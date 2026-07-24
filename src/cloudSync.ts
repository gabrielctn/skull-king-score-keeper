import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
  liveConfigured,
} from "./liveConfig";
import { BackupData, createBackupPayload, parseBackup } from "./backup";
import { generateWriterKey } from "./liveSession";
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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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

// --- transport --------------------------------------------------------------

/** The backend calls cloud backup needs; swappable so tests can fake them. */
export interface CloudTransport {
  create(writerKey: string): Promise<string>;
  put(ownerId: string, writerKey: string, state: unknown): Promise<void>;
  get(ownerId: string, writerKey: string): Promise<unknown | null>;
}

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
      const { data, error } = await getClient().rpc("create_user_backup", {
        writer_key: writerKey,
      });
      if (error || typeof data !== "string") {
        throw rpcError("create_user_backup", error);
      }
      return data;
    },
    async put(ownerId, writerKey, state) {
      const { error } = await getClient().rpc("put_user_backup", {
        owner_id: ownerId,
        writer_key: writerKey,
        game_state: state,
      });
      if (error) throw rpcError("put_user_backup", error);
    },
    async get(ownerId, writerKey) {
      const { data, error } = await getClient().rpc("get_user_backup", {
        owner_id: ownerId,
        writer_key: writerKey,
      });
      if (error) throw rpcError("get_user_backup", error);
      return data ?? null;
    },
  };
}

/** Re-harden untrusted server state through the backup-import pipeline. */
export function parseCloudState(state: unknown): BackupData | null {
  if (state === null || state === undefined) return null;
  try {
    const payload = parseBackup(JSON.stringify(state));
    return { currentGame: payload.currentGame, history: payload.history };
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
   * Adopt the identity carried by a sync code (to load another device's games
   * here) and return that owner's stored snapshot. Throws on a bad or
   * unreachable code so the caller can show the right message.
   */
  async adopt(code: string): Promise<BackupData | null> {
    const owner = decodeSyncCode(code);
    if (!owner) throw new Error("invalid sync code");
    let state: unknown;
    try {
      state = await this.transport.get(owner.ownerId, owner.writerKey);
    } catch {
      this.setStatus("offline");
      throw new Error("cloud unreachable");
    }
    // get_user_backup returns null for an unknown owner or a wrong key (a real
    // owner always has at least its initial "{}" state), so a well-formed but
    // wrong code must never overwrite this device's working identity.
    if (state === null || state === undefined) {
      throw new Error("unknown sync code");
    }
    this.owner = owner;
    this.ownerChecked = true;
    await this.store.save(owner);
    this.setStatus("synced");
    return parseCloudState(state);
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
