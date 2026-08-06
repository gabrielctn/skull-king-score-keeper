import { liveConfigured } from "./liveConfig";
import {
  UUID_PATTERN,
  getSupabaseClient,
  rpcError,
} from "./supabaseClient";
import { BackupData, createBackupPayload, parseBackup } from "./backup";
import { generateWriterKey } from "./liveSession";
import { INVITE_TTL_SECONDS, normalizeInviteCode } from "./tableInvites";
import {
  CloudOwner,
  loadCloudOwner,
  saveCloudOwner,
} from "./storage";

/**
 * Automatic cloud backup.
 *
 * Every scorekeeper's device owns one private row in Supabase (see the
 * user_backups tables in supabase/schema.sql): an unguessable owner id plus a
 * secret writer key, both generated locally. The full {currentGame, history}
 * snapshot is pushed on every change and pulled on launch, so the scoreboard,
 * leaderboard and stats survive clearing the browser cache — and never mix
 * with another scorekeeper's games, because reads require the writer key.
 *
 * It is strictly a durable mirror layered on top of the local store: the app
 * stays fully usable offline, and any cloud failure degrades to local-only
 * without data loss. Everything that comes back from the server is run through
 * the same hardening as a backup-file import before it reaches the UI.
 */

export type CloudStatus =
  | "unavailable" // no backend configured for this build
  | "idle" // configured, nothing synced yet this session
  | "syncing" // a push is in flight or queued
  | "synced" // reachable and up to date
  | "offline"; // backend unreachable; will retry

const WRITER_KEY_PATTERN = /^[0-9a-f]{32,200}$/i;
const SYNC_CODE_PREFIX = "SKC1.";

/** Server guard is 2 MB; stay comfortably under it. */
const MAX_STATE_JSON_CHARS = 1_800_000;
const PUSH_DEBOUNCE_MS = 1200;
const PUSH_RETRY_MS = 8000;

// --- sync code (portable owner id + writer key) -----------------------------

function base64UrlEncode(input: string): string {
  const base64 =
    typeof btoa !== "undefined"
      ? btoa(input)
      : Buffer.from(input, "utf8").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  // Restore the "=" padding that encoding strips: browser atob() requires the
  // base64 length to be a multiple of 4, and a remainder of 1 is never valid.
  const remainder = normalized.length % 4;
  if (remainder === 1) throw new Error("invalid base64");
  const base64 = remainder === 0 ? normalized : normalized + "=".repeat(4 - remainder);
  return typeof atob !== "undefined"
    ? atob(base64)
    : Buffer.from(base64, "base64").toString("utf8");
}

/** A short, copy-pasteable string that carries this device's cloud identity. */
export function encodeSyncCode(owner: CloudOwner): string {
  return SYNC_CODE_PREFIX + base64UrlEncode(`${owner.ownerId}.${owner.writerKey}`);
}

/** Parse a sync code back into an owner, or null when it is malformed. */
export function decodeSyncCode(code: string): CloudOwner | null {
  if (typeof code !== "string") return null;
  const trimmed = code.trim();
  if (!trimmed.startsWith(SYNC_CODE_PREFIX)) return null;
  let raw: string;
  try {
    raw = base64UrlDecode(trimmed.slice(SYNC_CODE_PREFIX.length));
  } catch {
    return null;
  }
  const separator = raw.indexOf(".");
  if (separator < 0) return null;
  const ownerId = raw.slice(0, separator).toLowerCase();
  const writerKey = raw.slice(separator + 1);
  if (!UUID_PATTERN.test(ownerId) || !WRITER_KEY_PATTERN.test(writerKey)) {
    return null;
  }
  return { ownerId, writerKey };
}

// --- join links (shared game table) -----------------------------------------

/** URL-hash parameter carrying a table join code: `#join=<sync code>`. */
export const JOIN_HASH_PARAM = "join";

/** Full URL to share (link or QR) for joining this device's table. */
export function buildJoinUrl(code: string, baseUrl: string): string {
  return `${baseUrl}#${JOIN_HASH_PARAM}=${code}`;
}

/** Extract a well-formed join code from a location hash, or null. */
export function extractJoinCode(hash: string | null | undefined): string | null {
  if (!hash) return null;
  const prefix = `${JOIN_HASH_PARAM}=`;
  const trimmed = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!trimmed.startsWith(prefix)) return null;
  const code = trimmed.slice(prefix.length);
  return decodeSyncCode(code) ? code : null;
}

/**
 * If the URL hash carries a table join code (the page was just opened from a
 * shared link or QR), consume it: strip the hash and return the code. One-shot
 * on purpose; joining a table must stay a deliberate, confirmed action.
 */
export function consumeScannedJoinCode(): string | null {
  if (typeof window === "undefined" || !window.location) return null;
  const code = extractJoinCode(window.location.hash);
  if (!code) return null;
  if (window.history?.replaceState) {
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`
    );
  }
  return code;
}

/**
 * What the user typed (or pasted) into the join field. One field accepts all
 * three shapes an invite can take, so nobody has to know which one they hold:
 * the six-character code read off a friend's screen, a full `SKC1.` table code,
 * or the whole join link.
 */
export type JoinInput =
  | { kind: "invite"; code: string }
  | { kind: "sync"; code: string };

export function classifyJoinInput(raw: string): JoinInput | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const linked = extractJoinCode(
    trimmed.includes("#") ? trimmed.slice(trimmed.indexOf("#")) : null
  );
  if (linked) return { kind: "sync", code: linked };
  if (decodeSyncCode(trimmed)) return { kind: "sync", code: trimmed };
  const invite = normalizeInviteCode(trimmed);
  return invite ? { kind: "invite", code: invite } : null;
}

// --- table invites (short codes) --------------------------------------------

/** A freshly minted invite: the code to show, and when it dies (epoch ms). */
export interface TableInvite {
  code: string;
  expiresAt: number;
}

/** Why an invite code did not open a table. */
export type InviteFailure =
  | "unknown" // wrong, already expired, or never existed
  | "throttled" // the backend's guessing ceiling was hit; retry shortly
  | "unsupported" // backend without the invite functions deployed yet
  | "offline";

export class InviteError extends Error {
  constructor(readonly reason: InviteFailure) {
    super(`invite ${reason}`);
  }
}

/**
 * PostgREST answers a call to a function the project does not have with
 * PGRST202. A deployed app can therefore run against a backend whose schema
 * predates invites: the short-code UI reports itself unavailable and the link
 * and QR keep working, instead of the whole panel failing.
 */
function missingFunction(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "PGRST202" ||
    /could not find the function|does not exist/i.test(error?.message ?? "")
  );
}

// --- transport --------------------------------------------------------------

/** The backend calls cloud backup needs; swappable so tests can fake them. */
export interface CloudTransport {
  create(writerKey: string): Promise<string>;
  put(ownerId: string, writerKey: string, state: unknown): Promise<void>;
  get(ownerId: string, writerKey: string): Promise<unknown | null>;
  /** Mint a short invite code for a table this device can write. */
  createInvite(ownerId: string, writerKey: string): Promise<TableInvite>;
  /** Trade a short code for the table's credentials; throws `InviteError`. */
  redeemInvite(code: string): Promise<CloudOwner>;
}

/** Where this device's cloud identity is persisted (swappable for tests). */
export interface CloudOwnerStore {
  load(): Promise<CloudOwner | null>;
  save(owner: CloudOwner): Promise<void>;
}

const defaultOwnerStore: CloudOwnerStore = {
  load: loadCloudOwner,
  save: saveCloudOwner,
};

export function supabaseCloudTransport(): CloudTransport {
  return {
    async create(writerKey) {
      const { data, error } = await getSupabaseClient().rpc("create_user_backup", {
        writer_key: writerKey,
      });
      if (error || typeof data !== "string") {
        throw rpcError("create_user_backup", error);
      }
      return data;
    },
    async put(ownerId, writerKey, state) {
      const { error } = await getSupabaseClient().rpc("put_user_backup", {
        owner_id: ownerId,
        writer_key: writerKey,
        game_state: state,
      });
      if (error) throw rpcError("put_user_backup", error);
    },
    async get(ownerId, writerKey) {
      const { data, error } = await getSupabaseClient().rpc("get_user_backup", {
        owner_id: ownerId,
        writer_key: writerKey,
      });
      if (error) throw rpcError("get_user_backup", error);
      return data ?? null;
    },
    async createInvite(ownerId, writerKey) {
      const { data, error } = await getSupabaseClient().rpc(
        "create_table_invite",
        { owner_id: ownerId, writer_key: writerKey }
      );
      if (error) {
        throw new InviteError(missingFunction(error) ? "unsupported" : "offline");
      }
      const payload = data as { code?: unknown; expires_in?: unknown } | null;
      const code =
        typeof payload?.code === "string"
          ? normalizeInviteCode(payload.code)
          : null;
      if (!code) throw new InviteError("offline");
      const ttl =
        typeof payload?.expires_in === "number" && payload.expires_in > 0
          ? payload.expires_in
          : INVITE_TTL_SECONDS;
      return { code, expiresAt: Date.now() + ttl * 1000 };
    },
    async redeemInvite(code) {
      const { data, error } = await getSupabaseClient().rpc(
        "redeem_table_invite",
        { code }
      );
      if (error) {
        throw new InviteError(missingFunction(error) ? "unsupported" : "offline");
      }
      const payload = data as {
        owner_id?: unknown;
        writer_key?: unknown;
        throttled?: unknown;
      } | null;
      if (!payload) throw new InviteError("unknown");
      if (payload.throttled) throw new InviteError("throttled");
      // Same hardening as a pasted code: what comes back is untrusted input.
      const ownerId =
        typeof payload.owner_id === "string"
          ? payload.owner_id.toLowerCase()
          : "";
      const writerKey =
        typeof payload.writer_key === "string" ? payload.writer_key : "";
      if (!UUID_PATTERN.test(ownerId) || !WRITER_KEY_PATTERN.test(writerKey)) {
        throw new InviteError("unknown");
      }
      return { ownerId, writerKey };
    },
  };
}

/** Re-harden untrusted server state through the backup-import pipeline. */
export function parseCloudState(state: unknown): BackupData | null {
  if (state === null || state === undefined) return null;
  try {
    const payload = parseBackup(JSON.stringify(state));
    return {
      currentGame: payload.currentGame,
      history: payload.history,
      tableName: payload.tableName ?? null,
      // Deletions made at this table travel with its games: without them the
      // launch merge is a union and every deleted game comes back.
      deletions: payload.deletions ?? {},
    };
  } catch {
    return null;
  }
}

// --- manager ----------------------------------------------------------------

/**
 * Owns this device's cloud identity and the debounced push loop. A singleton,
 * because saves flow through App-level code while the status and sync-code UI
 * live in Settings — both talk to this one manager.
 */
export class CloudBackupManager {
  private status: CloudStatus = liveConfigured() ? "idle" : "unavailable";
  private owner: CloudOwner | null = null;
  private ownerChecked = false;
  private creating: Promise<CloudOwner | null> | null = null;
  private listeners = new Set<(status: CloudStatus) => void>();
  private pending: BackupData | null = null;
  private pushTimer: ReturnType<typeof setTimeout> | null = null;
  private pushing = false;

  constructor(
    private readonly transport: CloudTransport,
    private readonly store: CloudOwnerStore = defaultOwnerStore,
    private readonly debounceMs = PUSH_DEBOUNCE_MS,
    private readonly retryMs = PUSH_RETRY_MS
  ) {}

  getStatus(): CloudStatus {
    return this.status;
  }

  subscribe(listener: (status: CloudStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setStatus(next: CloudStatus): void {
    if (this.status === next) return;
    this.status = next;
    for (const listener of this.listeners) listener(next);
  }

  /** In-memory owner if one is already loaded (no network). */
  getOwner(): CloudOwner | null {
    return this.owner;
  }

  /**
   * Ensure this device has a cloud identity, creating one on the backend the
   * first time. Returns null (and stays local-only) when offline or unconfigured.
   */
  async ensureOwner(): Promise<CloudOwner | null> {
    if (!liveConfigured()) return null;
    if (this.owner) return this.owner;
    if (this.creating) return this.creating;

    this.creating = (async () => {
      if (!this.ownerChecked) {
        const stored = await this.store.load();
        this.ownerChecked = true;
        if (stored) {
          this.owner = stored;
          return stored;
        }
      }
      try {
        const writerKey = generateWriterKey();
        const ownerId = await this.transport.create(writerKey);
        const owner: CloudOwner = { ownerId, writerKey };
        await this.store.save(owner);
        this.owner = owner;
        return owner;
      } catch {
        this.setStatus("offline");
        return null;
      }
    })();
    try {
      return await this.creating;
    } finally {
      this.creating = null;
    }
  }

  /** Pull the stored snapshot (creating the owner if needed), or null. */
  async pull(): Promise<BackupData | null> {
    const owner = await this.ensureOwner();
    if (!owner) return null;
    try {
      const state = await this.transport.get(owner.ownerId, owner.writerKey);
      this.setStatus("synced");
      return parseCloudState(state);
    } catch {
      this.setStatus("offline");
      return null;
    }
  }

  /** Queue a debounced push of the full snapshot. */
  push(data: BackupData): void {
    if (!liveConfigured()) return;
    this.pending = data;
    this.setStatus("syncing");
    this.scheduleFlush(this.debounceMs);
  }

  private scheduleFlush(delay: number): void {
    if (this.pushTimer !== null || this.pushing) return;
    this.pushTimer = setTimeout(() => {
      this.pushTimer = null;
      void this.flush();
    }, delay);
  }

  private async flush(): Promise<void> {
    if (this.pushing) return;
    this.pushing = true;
    try {
      while (this.pending) {
        const data = this.pending;
        this.pending = null;
        const owner = await this.ensureOwner();
        if (!owner) {
          if (this.pending === null) this.pending = data;
          this.setStatus("offline");
          this.pushing = false;
          this.scheduleFlush(this.retryMs);
          return;
        }
        let state: unknown;
        try {
          const payload = createBackupPayload(data);
          const json = JSON.stringify(payload);
          if (json.length > MAX_STATE_JSON_CHARS) {
            // Too large to store; drop this push but keep local + status honest.
            if (this.pending === null) this.setStatus("synced");
            continue;
          }
          state = payload;
        } catch {
          // Unserializable/invalid snapshot: skip it rather than loop.
          continue;
        }
        try {
          await this.transport.put(owner.ownerId, owner.writerKey, state);
          if (this.pending === null) this.setStatus("synced");
        } catch {
          if (this.pending === null) this.pending = data;
          this.setStatus("offline");
          this.pushing = false;
          this.scheduleFlush(this.retryMs);
          return;
        }
      }
    } finally {
      this.pushing = false;
    }
  }

  /** This device's sync code, ensuring an owner exists first. */
  async syncCode(): Promise<string | null> {
    const owner = await this.ensureOwner();
    return owner ? encodeSyncCode(owner) : null;
  }

  /**
   * Push any pending snapshot right now instead of waiting for the debounce.
   * Returns false when the cloud could not be reached (the data stays queued).
   * Callers switching tables MUST get a true from this first, so nothing from
   * the previous table can ever land in the next table's row.
   */
  async flushPending(): Promise<boolean> {
    if (this.pushTimer !== null) {
      clearTimeout(this.pushTimer);
      this.pushTimer = null;
    }
    while (this.pushing) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    if (this.pending !== null) await this.flush();
    return this.pending === null;
  }

  /**
   * Make another table's identity the active one and return its stored
   * snapshot. Unlike a pull-merge, the caller replaces its local state with
   * the result: each table keeps its own history. Throws on an unreachable or
   * unknown table, leaving the current identity untouched.
   */
  async switchTo(owner: CloudOwner): Promise<BackupData | null> {
    let state: unknown;
    try {
      state = await this.transport.get(owner.ownerId, owner.writerKey);
    } catch {
      this.setStatus("offline");
      throw new Error("cloud unreachable");
    }
    // get_user_backup returns null for an unknown owner or a wrong key (a real
    // owner always has at least its initial "{}" state), so a stale membership
    // must never replace this device's working identity.
    if (state === null || state === undefined) {
      throw new Error("unknown table");
    }
    this.owner = owner;
    this.ownerChecked = true;
    await this.store.save(owner);
    this.setStatus("synced");
    return parseCloudState(state);
  }

  /**
   * Create a brand-new, empty table identity and make it active. Used to
   * start a separate history for another group of friends. Throws when the
   * backend is unreachable, leaving the current identity untouched.
   */
  async createTable(): Promise<CloudOwner> {
    const writerKey = generateWriterKey();
    const ownerId = await this.transport.create(writerKey);
    const owner: CloudOwner = { ownerId, writerKey };
    this.owner = owner;
    this.ownerChecked = true;
    await this.store.save(owner);
    this.setStatus("synced");
    return owner;
  }

  /**
   * Read the snapshot behind a sync/join code WITHOUT adopting its identity,
   * so a join prompt can preview the table (name, game count) before the user
   * commits. Throws on a bad, unknown, or unreachable code.
   */
  async peek(code: string): Promise<BackupData | null> {
    const owner = decodeSyncCode(code);
    if (!owner) throw new Error("invalid sync code");
    let state: unknown;
    try {
      state = await this.transport.get(owner.ownerId, owner.writerKey);
    } catch {
      throw new Error("cloud unreachable");
    }
    if (state === null || state === undefined) {
      throw new Error("unknown sync code");
    }
    return parseCloudState(state);
  }

  /**
   * Mint a short invite code for the table currently open, so a friend sitting
   * at the same table can type it into their own app. Throws `InviteError`
   * with the reason the invite panel should show.
   */
  async createInvite(): Promise<TableInvite> {
    const owner = await this.ensureOwner();
    if (!owner) throw new InviteError("offline");
    try {
      return await this.transport.createInvite(owner.ownerId, owner.writerKey);
    } catch (error) {
      throw error instanceof InviteError ? error : new InviteError("offline");
    }
  }

  /**
   * Trade a short invite code for the table's own `SKC1.` code, which then
   * takes the ordinary preview-and-confirm join path: a short code is a way to
   * *carry* a table code across the table, not a second kind of membership.
   */
  async redeemInvite(code: string): Promise<string> {
    const normalized = normalizeInviteCode(code);
    if (!normalized) throw new InviteError("unknown");
    try {
      return encodeSyncCode(await this.transport.redeemInvite(normalized));
    } catch (error) {
      throw error instanceof InviteError ? error : new InviteError("offline");
    }
  }

  /**
   * Adopt the identity carried by a sync code (join that table here) and
   * return its stored snapshot. Throws on a bad, unknown, or unreachable
   * code so the caller can show the right message.
   */
  async adopt(code: string): Promise<BackupData | null> {
    const owner = decodeSyncCode(code);
    if (!owner) throw new Error("invalid sync code");
    return this.switchTo(owner);
  }
}

let managerInstance: CloudBackupManager | null = null;

/** The app-wide cloud backup manager, bound to the Supabase transport. */
export function cloudBackupManager(): CloudBackupManager {
  if (!managerInstance) {
    managerInstance = new CloudBackupManager(supabaseCloudTransport());
  }
  return managerInstance;
}

/** True when a cloud backend is configured for this build. */
export function cloudConfigured(): boolean {
  return liveConfigured();
}
