import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Game } from "./types";
import { normalizeUntrustedGame } from "./backup";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, liveConfigured } from "./liveConfig";
import {
  StoredLiveSession,
  clearLiveSessionFor,
  loadLiveSessionFor,
  saveLiveSessionFor,
} from "./storage";

export type { StoredLiveSession } from "./storage";

/**
 * Live score follow — real-time sync through Supabase.
 *
 * The game master's device starts a *session*: one row in the `live_games`
 * table (see supabase/schema.sql). The row's unguessable UUID is the read
 * capability that the QR code hands to spectators; a locally generated writer
 * key (whose hash lives server-side, out of API reach) is required to update
 * it. Every local save of the game is debounced and pushed; spectators fetch
 * the row once and then receive realtime UPDATE events.
 *
 * The snapshot-in-QR mode (shareLink.ts) remains the offline fallback: live
 * needs connectivity on both sides, snapshots need none.
 *
 * Server state is untrusted on the way back in: everything a spectator
 * receives goes through the backup-import hardening before it reaches the UI.
 */

/** URL-hash parameter carrying a live session: `#live=<uuid>`. */
export const LIVE_HASH_PARAM = "live";

/** sessionStorage key that keeps a scanned live session across reloads. */
const SPECTATOR_LIVE_SESSION_KEY = "skullking:spectatorLiveId";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Server-side guard is 200_000 bytes; stay under it with margin. */
const MAX_STATE_JSON_CHARS = 190_000;

const PUSH_DEBOUNCE_MS = 700;
const PUSH_RETRY_MS = 4000;

// --- transport --------------------------------------------------------------

export interface LiveSubscriptionHandlers {
  onUpdate(state: unknown, updatedAt: string): void;
  /** The session row was deleted (game master ended the session). */
  onDelete(): void;
  /** Realtime channel connectivity: true when subscribed and healthy. */
  onStatus(connected: boolean): void;
}

/**
 * The few backend calls live mode needs, so tests can substitute a fake
 * transport and the rest of the module stays backend-agnostic.
 */
export interface LiveTransport {
  createSession(writerKey: string, state: unknown): Promise<string>;
  updateSession(id: string, writerKey: string, state: unknown): Promise<void>;
  endSession(id: string, writerKey: string): Promise<void>;
  fetchSession(
    id: string
  ): Promise<{ state: unknown; updatedAt: string } | null>;
  subscribe(id: string, handlers: LiveSubscriptionHandlers): () => void;
}

/** Where the game master's per-game session credentials are kept. */
export interface LiveSessionStore {
  load(gameId: string): Promise<StoredLiveSession | null>;
  save(gameId: string, session: StoredLiveSession): Promise<void>;
  clear(gameId: string): Promise<void>;
}

const defaultLiveSessionStore: LiveSessionStore = {
  load: loadLiveSessionFor,
  save: saveLiveSessionFor,
  clear: clearLiveSessionFor,
};

let supabaseClient: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseClient;
}

function rpcError(operation: string, error: { message?: string } | null): Error {
  return new Error(`${operation} failed: ${error?.message ?? "unknown error"}`);
}

export function supabaseLiveTransport(): LiveTransport {
  return {
    async createSession(writerKey, state) {
      const { data, error } = await getClient().rpc("create_live_game", {
        writer_key: writerKey,
        game_state: state,
      });
      if (error || typeof data !== "string") {
        throw rpcError("create_live_game", error);
      }
      return data;
    },

    async updateSession(id, writerKey, state) {
      const { error } = await getClient().rpc("update_live_game", {
        game_id: id,
        writer_key: writerKey,
        game_state: state,
      });
      if (error) throw rpcError("update_live_game", error);
    },

    async endSession(id, writerKey) {
      const { error } = await getClient().rpc("end_live_game", {
        game_id: id,
        writer_key: writerKey,
      });
      if (error) throw rpcError("end_live_game", error);
    },

    async fetchSession(id) {
      const { data, error } = await getClient()
        .from("live_games")
        .select("state, updated_at")
        .eq("id", id)
        .maybeSingle();
      if (error) throw rpcError("fetch live_games", error);
      if (!data) return null;
      return { state: data.state, updatedAt: data.updated_at };
    },

    subscribe(id, handlers) {
      const channel = getClient()
        .channel(`live_game_${id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "live_games",
            filter: `id=eq.${id}`,
          },
          (payload) => {
            const row = payload.new as
              | { state?: unknown; updated_at?: string }
              | undefined;
            handlers.onUpdate(
              row?.state,
              typeof row?.updated_at === "string" ? row.updated_at : ""
            );
          }
        )
        .on(
          "postgres_changes",
          // Realtime cannot filter DELETE events, so match on the old row's
          // primary key ourselves.
          { event: "DELETE", schema: "public", table: "live_games" },
          (payload) => {
            const old = payload.old as { id?: string } | undefined;
            if (old?.id === id) handlers.onDelete();
          }
        )
        .subscribe((status) => {
          handlers.onStatus(status === "SUBSCRIBED");
        });
      return () => {
        void getClient().removeChannel(channel);
      };
    },
  };
}

// --- shared helpers ---------------------------------------------------------

/** Random 192-bit writer key, hex-encoded. Never leaves this device in clear
 * except inside the authenticated update calls. */
export function generateWriterKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/** Plain JSON payload for the server; also enforces the size guard. */
export function liveStatePayload(game: Game): unknown {
  const json = JSON.stringify(game);
  if (json.length > MAX_STATE_JSON_CHARS) {
    throw new Error("Game state is too large to sync");
  }
  return JSON.parse(json);
}

export function buildLiveUrl(sessionId: string, baseUrl: string): string {
  return `${baseUrl}#${LIVE_HASH_PARAM}=${sessionId}`;
}

/** Extract a live session UUID from a location hash, or null. */
export function extractLiveSessionId(
  hash: string | null | undefined
): string | null {
  if (!hash) return null;
  const prefix = `${LIVE_HASH_PARAM}=`;
  const trimmed = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!trimmed.startsWith(prefix)) return null;
  const id = trimmed.slice(prefix.length);
  return UUID_PATTERN.test(id) ? id.toLowerCase() : null;
}

// --- game master side -------------------------------------------------------

export type MasterLiveStatus =
  | "idle"
  | "starting"
  | "live"
  | "syncing"
  | "error"
  | "stopping";

export interface MasterLiveState {
  status: MasterLiveStatus;
  sessionId: string | null;
  gameId: string | null;
}

/**
 * Owns the game master's active live session: starting/stopping it, resuming
 * it after an app restart, and pushing every saved change (debounced, with
 * retry). A singleton because saves flow through App-level code while the
 * sharing UI lives in a modal — both talk to this manager.
 */
export class LiveSessionManager {
  private state: MasterLiveState = {
    status: "idle",
    sessionId: null,
    gameId: null,
  };
  private writerKey: string | null = null;
  private listeners = new Set<(state: MasterLiveState) => void>();
  private pendingGame: Game | null = null;
  private pushTimer: ReturnType<typeof setTimeout> | null = null;
  private pushing = false;
  private restoreAttemptedFor: string | null = null;

  constructor(
    private readonly transport: LiveTransport,
    private readonly store: LiveSessionStore = defaultLiveSessionStore,
    private readonly debounceMs = PUSH_DEBOUNCE_MS,
    private readonly retryMs = PUSH_RETRY_MS
  ) {}

  getState(): MasterLiveState {
    return this.state;
  }

  subscribe(listener: (state: MasterLiveState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(next: Partial<MasterLiveState>): void {
    this.state = { ...this.state, ...next };
    for (const listener of this.listeners) listener(this.state);
  }

  private clearTimer(): void {
    if (this.pushTimer) clearTimeout(this.pushTimer);
    this.pushTimer = null;
  }

  /** Start sharing `game` live. Replaces any previous session. */
  async start(game: Game): Promise<void> {
    if (this.state.status === "starting" || this.state.status === "stopping") {
      return;
    }
    this.clearTimer();
    this.pendingGame = null;
    const writerKey = generateWriterKey();
    this.setState({ status: "starting", sessionId: null, gameId: game.id });
    try {
      const sessionId = await this.transport.createSession(
        writerKey,
        liveStatePayload(game)
      );
      this.writerKey = writerKey;
      this.restoreAttemptedFor = game.id;
      await this.store.save(game.id, { sessionId, writerKey });
      this.setState({ status: "live", sessionId, gameId: game.id });
    } catch {
      this.writerKey = null;
      this.setState({ status: "error", sessionId: null, gameId: game.id });
    }
  }

  /** Stop sharing and delete the session server-side (best effort). */
  async stop(): Promise<void> {
    const { sessionId, gameId } = this.state;
    const writerKey = this.writerKey;
    this.clearTimer();
    this.pendingGame = null;
    this.writerKey = null;
    this.setState({ status: "stopping" });
    if (gameId) await this.store.clear(gameId);
    if (sessionId && writerKey) {
      try {
        await this.transport.endSession(sessionId, writerKey);
      } catch {
        // The row still expires on its own; local state is already cleared.
      }
    }
    this.setState({ status: "idle", sessionId: null, gameId });
  }

  /**
   * Resume a previously started session for this game after an app restart,
   * so the QR stays valid and pushes continue without reopening the sheet.
   */
  async restoreFor(game: Game): Promise<void> {
    if (!liveConfigured()) return;
    if (this.state.gameId === game.id && this.state.status !== "idle") return;
    if (this.restoreAttemptedFor === game.id) return;
    this.restoreAttemptedFor = game.id;

    let stored: StoredLiveSession | null = null;
    try {
      stored = await this.store.load(game.id);
    } catch {
      return;
    }
    if (!stored) return;
    try {
      const existing = await this.transport.fetchSession(stored.sessionId);
      if (!existing) {
        await this.store.clear(game.id);
        return;
      }
      this.writerKey = stored.writerKey;
      this.setState({
        status: "live",
        sessionId: stored.sessionId,
        gameId: game.id,
      });
      // Local state may have moved while offline; sync it up now.
      this.notifyGameChanged(game);
    } catch {
      // Backend unreachable: keep the stored session for a later attempt.
    }
  }

  /** Called on every local save; pushes are debounced and coalesced. */
  notifyGameChanged(game: Game): void {
    if (!this.state.sessionId || this.state.gameId !== game.id) return;
    if (this.state.status === "stopping") return;
    this.pendingGame = game;
    if (this.state.status !== "syncing" && this.state.status !== "error") {
      this.setState({ status: "syncing" });
    }
    if (this.pushTimer === null && !this.pushing) {
      this.pushTimer = setTimeout(() => {
        this.pushTimer = null;
        void this.flush();
      }, this.debounceMs);
    }
  }

  private async flush(): Promise<void> {
    if (this.pushing) return;
    this.pushing = true;
    try {
      while (this.pendingGame) {
        const game = this.pendingGame;
        this.pendingGame = null;
        const { sessionId } = this.state;
        const writerKey = this.writerKey;
        if (!sessionId || !writerKey) return;
        try {
          await this.transport.updateSession(
            sessionId,
            writerKey,
            liveStatePayload(game)
          );
          if (this.pendingGame === null) {
            this.setState({ status: "live" });
          }
        } catch {
          // Put the failed snapshot back and retry later; newer local saves
          // replace it in the meantime.
          if (this.pendingGame === null) this.pendingGame = game;
          this.setState({ status: "error" });
          if (this.pushTimer === null) {
            this.pushTimer = setTimeout(() => {
              this.pushTimer = null;
              void this.flush();
            }, this.retryMs);
          }
          return;
        }
      }
    } finally {
      this.pushing = false;
    }
  }
}

let managerInstance: LiveSessionManager | null = null;

/** The app-wide manager, bound to the Supabase transport. */
export function liveSessionManager(): LiveSessionManager {
  if (!managerInstance) {
    managerInstance = new LiveSessionManager(supabaseLiveTransport());
  }
  return managerInstance;
}

// --- spectator side ---------------------------------------------------------

export type SpectatorLiveStatus =
  | "connecting"
  | "live"
  | "reconnecting"
  | "ended"
  | "notFound"
  | "error";

export interface LiveWatcherCallbacks {
  onGame(game: Game, updatedAt: number): void;
  onStatus(status: SpectatorLiveStatus): void;
}

export interface LiveWatcher {
  /** Re-fetch the current state (used on focus/visibility regains). */
  refresh(): void;
  stop(): void;
}

function parseServerTimestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

/**
 * Follow one live session: initial fetch, realtime updates, reconnect
 * refetches. Every server payload is validated before it reaches callers.
 */
export function watchLiveGame(
  sessionId: string,
  callbacks: LiveWatcherCallbacks,
  transport: LiveTransport = supabaseLiveTransport()
): LiveWatcher {
  let stopped = false;
  let ended = false;
  let unsubscribe: (() => void) | null = null;

  const deliver = (state: unknown, updatedAt: string): boolean => {
    try {
      const game = normalizeUntrustedGame(state, "live");
      callbacks.onGame(game, parseServerTimestamp(updatedAt));
      return true;
    } catch {
      return false;
    }
  };

  const refresh = async (initial = false): Promise<void> => {
    if (stopped || ended) return;
    try {
      const session = await transport.fetchSession(sessionId);
      if (stopped || ended) return;
      if (!session) {
        // Gone on the initial load = bad/expired link; gone later = the game
        // master ended the session.
        ended = true;
        callbacks.onStatus(initial ? "notFound" : "ended");
        return;
      }
      if (!deliver(session.state, session.updatedAt) && initial) {
        ended = true;
        callbacks.onStatus("error");
      }
    } catch {
      if (!stopped && !ended && initial) callbacks.onStatus("error");
    }
  };

  callbacks.onStatus("connecting");
  void refresh(true).then(() => {
    if (stopped || ended) return;
    unsubscribe = transport.subscribe(sessionId, {
      onUpdate(state, updatedAt) {
        if (stopped || ended) return;
        // A payload that fails validation (or was truncated) falls back to a
        // plain refetch of the row.
        if (!deliver(state, updatedAt)) void refresh();
      },
      onDelete() {
        if (stopped || ended) return;
        ended = true;
        callbacks.onStatus("ended");
      },
      onStatus(connected) {
        if (stopped || ended) return;
        callbacks.onStatus(connected ? "live" : "reconnecting");
        // Whatever happened while the channel was down, catch up now.
        if (connected) void refresh();
      },
    });
  });

  return {
    refresh() {
      void refresh();
    },
    stop() {
      stopped = true;
      if (unsubscribe) unsubscribe();
      unsubscribe = null;
    },
  };
}

// --- spectator boot (URL hash + session storage) ----------------------------

export function saveSpectatorLiveId(sessionId: string): void {
  try {
    window.sessionStorage.setItem(SPECTATOR_LIVE_SESSION_KEY, sessionId);
  } catch {
    // Reloads simply leave live mode when sessionStorage is unavailable.
  }
}

export function loadSpectatorLiveId(): string | null {
  try {
    const stored = window.sessionStorage.getItem(SPECTATOR_LIVE_SESSION_KEY);
    return stored && UUID_PATTERN.test(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function clearSpectatorLiveId(): void {
  try {
    window.sessionStorage.removeItem(SPECTATOR_LIVE_SESSION_KEY);
  } catch {
    // Nothing to clear.
  }
}

/**
 * If the URL hash carries a live session id (the page was just opened from a
 * scanned QR code), consume it: strip the hash, remember the id for reloads,
 * and return it. Mirrors shareLink.consumeScannedShareCode for snapshots.
 */
export function consumeScannedLiveId(): string | null {
  if (typeof window === "undefined" || !window.location) return null;
  const scanned = extractLiveSessionId(window.location.hash);
  if (!scanned) return null;
  if (window.history?.replaceState) {
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`
    );
  }
  saveSpectatorLiveId(scanned);
  return scanned;
}

/** Live session to follow on this page load, if any. */
export function readLiveBoot(): string | null {
  const scanned = consumeScannedLiveId();
  if (scanned) return scanned;
  if (typeof window === "undefined") return null;
  return loadSpectatorLiveId();
}
