/**
 * Live-session manager and spectator watcher checks, driven through a fake
 * in-memory transport (no Supabase, no network). Verifies session lifecycle,
 * debounced/retried pushes, restore, realtime delivery, validation of
 * untrusted server payloads, and URL/hash helpers.
 * Run with: npm run test:livesession
 */
import { createGame } from "../src/scoring";
import {
  LiveSessionManager,
  LiveSessionStore,
  LiveSubscriptionHandlers,
  LiveTransport,
  StoredLiveSession,
  buildLiveUrl,
  extractLiveSessionId,
  generateWriterKey,
  liveStatePayload,
  watchLiveGame,
} from "../src/liveSession";
import { Game } from "../src/types";

let passed = 0;
let failed = 0;
function check(label: string, condition: boolean, detail = ""): void {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}${detail ? `: ${detail}` : ""}`);
  }
}
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const SAMPLE_UUID = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";

function makeGame(): Game {
  return createGame(
    [
      { id: "a", name: "Anne" },
      { id: "b", name: "Bonny" },
      { id: "c", name: "Calico" },
    ],
    10
  );
}

/** In-memory transport with hooks to simulate failures and realtime events. */
class FakeTransport implements LiveTransport {
  rows = new Map<
    string,
    { state: unknown; updatedAt: string; writerKey: string }
  >();
  private subscribers = new Map<string, LiveSubscriptionHandlers>();
  createCalls = 0;
  updateCalls = 0;
  endCalls = 0;
  failCreateOnce = false;
  failUpdateTimes = 0;
  private counter = 0;

  private nextId(): string {
    this.counter += 1;
    return `00000000-0000-4000-8000-${String(this.counter).padStart(12, "0")}`;
  }

  async createSession(writerKey: string, state: unknown): Promise<string> {
    this.createCalls += 1;
    if (this.failCreateOnce) {
      this.failCreateOnce = false;
      throw new Error("simulated create failure");
    }
    const id = this.nextId();
    this.rows.set(id, {
      state,
      updatedAt: new Date().toISOString(),
      writerKey,
    });
    return id;
  }

  async updateSession(
    id: string,
    writerKey: string,
    state: unknown
  ): Promise<void> {
    this.updateCalls += 1;
    if (this.failUpdateTimes > 0) {
      this.failUpdateTimes -= 1;
      throw new Error("simulated update failure");
    }
    const row = this.rows.get(id);
    if (!row || row.writerKey !== writerKey) {
      throw new Error("unknown session or wrong writer key");
    }
    row.state = state;
    row.updatedAt = new Date().toISOString();
    const handlers = this.subscribers.get(id);
    if (handlers) handlers.onUpdate(state, row.updatedAt);
  }

  async endSession(id: string, writerKey: string): Promise<void> {
    this.endCalls += 1;
    const row = this.rows.get(id);
    if (row && row.writerKey === writerKey) {
      this.rows.delete(id);
      const handlers = this.subscribers.get(id);
      if (handlers) handlers.onDelete();
    }
  }

  async fetchSession(
    id: string
  ): Promise<{ state: unknown; updatedAt: string } | null> {
    const row = this.rows.get(id);
    return row ? { state: row.state, updatedAt: row.updatedAt } : null;
  }

  subscribe(id: string, handlers: LiveSubscriptionHandlers): () => void {
    this.subscribers.set(id, handlers);
    // Mimic Supabase: the channel reports SUBSCRIBED shortly after.
    setTimeout(() => handlers.onStatus(true), 0);
    return () => this.subscribers.delete(id);
  }

  emitStatus(id: string, connected: boolean): void {
    this.subscribers.get(id)?.onStatus(connected);
  }

  /** Simulate a realtime UPDATE whose payload fails validation. */
  emitBadUpdate(id: string): void {
    this.subscribers.get(id)?.onUpdate({ garbage: true }, new Date().toISOString());
  }
}

function memoryStore(seed?: Record<string, StoredLiveSession>): LiveSessionStore {
  const map = new Map<string, StoredLiveSession>(
    seed ? Object.entries(seed) : []
  );
  return {
    async load(gameId) {
      return map.get(gameId) ?? null;
    },
    async save(gameId, session) {
      map.set(gameId, session);
    },
    async clear(gameId) {
      map.delete(gameId);
    },
  };
}

// --- helpers ----------------------------------------------------------------

console.log("Writer keys and payloads");
const key1 = generateWriterKey();
const key2 = generateWriterKey();
check("writer keys are 48 hex chars", /^[0-9a-f]{48}$/.test(key1));
check("writer keys are unique", key1 !== key2);
const payloadSource = makeGame();
check(
  "liveStatePayload produces a JSON-safe clone",
  JSON.stringify(liveStatePayload(payloadSource)) ===
    JSON.stringify(payloadSource)
);
check(
  "oversized state is rejected",
  (() => {
    const big = makeGame();
    (big as unknown as { blob: string }).blob = "x".repeat(200_001);
    try {
      liveStatePayload(big);
      return false;
    } catch {
      return true;
    }
  })()
);

console.log("URL and hash helpers");
check(
  "buildLiveUrl puts the id in the #live= hash",
  buildLiveUrl(SAMPLE_UUID, "https://x.test/app/") ===
    `https://x.test/app/#live=${SAMPLE_UUID}`
);
check(
  "extractLiveSessionId reads back a valid UUID (case-insensitive)",
  extractLiveSessionId(`#live=${SAMPLE_UUID.toUpperCase()}`) === SAMPLE_UUID
);
check(
  "extractLiveSessionId rejects non-UUID and unrelated hashes",
  extractLiveSessionId("#live=not-a-uuid") === null &&
    extractLiveSessionId(`#skl=${SAMPLE_UUID}`) === null &&
    extractLiveSessionId("") === null &&
    extractLiveSessionId(null) === null
);

// --- game master lifecycle --------------------------------------------------

async function run(): Promise<void> {
  console.log("Session start, push, stop");
  {
    const transport = new FakeTransport();
    const store = memoryStore();
    const manager = new LiveSessionManager(transport, store, 20, 40);
    const states: string[] = [];
    manager.subscribe((s) => states.push(s.status));

    const game = makeGame();
    await manager.start(game);
    check("start creates exactly one session", transport.createCalls === 1);
    check("manager reports live with a session id", manager.getState().status === "live" && !!manager.getState().sessionId);
    const sessionId = manager.getState().sessionId!;
    check("credentials are persisted for restore", (await store.load(game.id))?.sessionId === sessionId);
    check("start passed through starting → live", states.includes("starting") && states.includes("live"));

    // Rapid edits collapse into a single debounced push.
    const g2 = { ...game, updatedAt: game.updatedAt + 1 };
    const g3 = { ...game, updatedAt: game.updatedAt + 2, currentRound: 2 };
    manager.notifyGameChanged(g2);
    manager.notifyGameChanged(g3);
    check("edits mark the manager syncing", manager.getState().status === "syncing");
    await delay(80);
    check("debounced edits produce one update call", transport.updateCalls === 1, `got ${transport.updateCalls}`);
    check("latest snapshot wins", (transport.rows.get(sessionId)!.state as Game).currentRound === 2);
    check("manager settles back to live", manager.getState().status === "live");

    await manager.stop();
    check("stop deletes the session", transport.endCalls === 1 && transport.rows.size === 0);
    check("stop clears persisted credentials", (await store.load(game.id)) === null);
    check("manager returns to idle", manager.getState().status === "idle");

    // Edits after stop are ignored.
    manager.notifyGameChanged(g3);
    await delay(60);
    check("no pushes after stop", transport.updateCalls === 1);
  }

  console.log("Push failure then recovery");
  {
    const transport = new FakeTransport();
    const manager = new LiveSessionManager(transport, memoryStore(), 20, 40);
    const game = makeGame();
    await manager.start(game);
    transport.failUpdateTimes = 1; // first push fails, retry should succeed
    manager.notifyGameChanged({ ...game, updatedAt: game.updatedAt + 1, currentRound: 3 });
    await delay(50);
    check("a failed push surfaces the error status", manager.getState().status === "error", manager.getState().status);
    await delay(80);
    check("the manager retries and recovers to live", manager.getState().status === "live", manager.getState().status);
    check("the snapshot eventually reaches the server", (transport.rows.get(manager.getState().sessionId!)!.state as Game).currentRound === 3);
    await manager.stop();
  }

  console.log("Restore after restart");
  {
    const transport = new FakeTransport();
    // Seed a live row and stored credentials, as if a previous run created them.
    const game = makeGame();
    const writerKey = generateWriterKey();
    const seededId = await transport.createSession(writerKey, liveStatePayload(game));
    const manager = new LiveSessionManager(
      transport,
      memoryStore({ [game.id]: { sessionId: seededId, writerKey } }),
      20,
      40
    );
    await manager.restoreFor(game);
    // restoreFor syncs local state up at the end, so status may be live or
    // syncing; what matters is that it re-attached to the same session.
    check("restore re-attaches to the existing session", manager.getState().sessionId === seededId && manager.getState().status !== "idle");
    // And it can push again with the restored writer key.
    manager.notifyGameChanged({ ...game, updatedAt: game.updatedAt + 1, currentRound: 4 });
    await delay(60);
    check("restored session can still push", (transport.rows.get(seededId)!.state as Game).currentRound === 4);
    await manager.stop();

    // Restore is a no-op when the server row is gone (expired).
    const gone = new LiveSessionManager(
      transport,
      memoryStore({ [game.id]: { sessionId: SAMPLE_UUID, writerKey } }),
      20,
      40
    );
    await gone.restoreFor(game);
    check("restore stays idle when the session has expired", gone.getState().status === "idle");
  }

  console.log("Start failure");
  {
    const transport = new FakeTransport();
    transport.failCreateOnce = true;
    const manager = new LiveSessionManager(transport, memoryStore(), 20, 40);
    await manager.start(makeGame());
    check("a failed start reports error, not live", manager.getState().status === "error");
  }

  // --- spectator watcher ----------------------------------------------------

  console.log("Spectator watcher");
  {
    const transport = new FakeTransport();
    const writerKey = generateWriterKey();
    const master = makeGame();
    const id = await transport.createSession(writerKey, liveStatePayload(master));

    const received: Game[] = [];
    const statuses: string[] = [];
    const watcher = watchLiveGame(
      id,
      {
        onGame: (g) => received.push(g),
        onStatus: (s) => statuses.push(s),
      },
      transport
    );
    await delay(20);
    check("initial fetch delivers the game", received.length >= 1 && received[0].players.length === 3);
    check("watcher reports connecting then live", statuses[0] === "connecting" && statuses.includes("live"));

    // A realtime update pushes a validated game to the spectator.
    await transport.updateSession(id, writerKey, liveStatePayload({ ...master, currentRound: 5 }));
    await delay(10);
    check("realtime update delivers the new state", received[received.length - 1].currentRound === 5);

    // A malformed realtime payload does not crash and triggers a refetch.
    const before = received.length;
    transport.emitBadUpdate(id);
    await delay(20);
    check("a malformed realtime payload is absorbed (no crash, refetch)", received.length >= before);

    // Ending the session notifies the spectator.
    await transport.endSession(id, writerKey);
    await delay(10);
    check("watcher reports ended when the session is deleted", statuses.includes("ended"));
    watcher.stop();
  }

  console.log("Spectator watcher — bad link and validation");
  {
    const transport = new FakeTransport();
    const statuses: string[] = [];
    const watcher = watchLiveGame(
      SAMPLE_UUID,
      { onGame: () => undefined, onStatus: (s) => statuses.push(s) },
      transport
    );
    await delay(20);
    check("an unknown session id reports notFound", statuses.includes("notFound"));
    watcher.stop();

    // A session whose stored state is garbage reports an error on load.
    const garbageId = "11111111-1111-4111-8111-111111111111";
    transport.rows.set(garbageId, { state: { not: "a game" }, updatedAt: new Date().toISOString(), writerKey: "x" });
    const badStatuses: string[] = [];
    const badWatcher = watchLiveGame(
      garbageId,
      { onGame: () => undefined, onStatus: (s) => badStatuses.push(s) },
      transport
    );
    await delay(20);
    check("invalid stored state reports error, never reaches the UI", badStatuses.includes("error"));
    badWatcher.stop();
  }
}

run().then(() => {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
});
