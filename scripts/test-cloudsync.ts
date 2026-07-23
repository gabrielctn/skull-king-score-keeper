/**
 * Contract tests for the automatic cloud backup: portable sync codes, untrusted
 * state hardening, and the debounced push / pull / adopt manager (with a fake
 * transport and in-memory owner store, so no network or AsyncStorage is used).
 * Run with: npm run test:cloudsync
 */
import { createGame, emptyBonus } from "../src/scoring";
import { createBackupPayload, BackupData } from "../src/backup";
import {
  CloudBackupManager,
  CloudOwnerStore,
  CloudTransport,
  decodeSyncCode,
  encodeSyncCode,
  parseCloudState,
} from "../src/cloudSync";
import { CloudOwner } from "../src/storage";
import { Game, Player, RoundEntry } from "../src/types";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

function eq<T>(label: string, actual: T, expected: T) {
  check(`${label} = ${String(expected)}`, Object.is(actual, expected));
}

function section(title: string) {
  console.log(`\n${title}`);
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(
  predicate: () => boolean,
  timeoutMs = 500
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return true;
    await delay(5);
  }
  return predicate();
}

// --- fixtures ---------------------------------------------------------------

const players: Player[] = [
  { id: "a", name: "Anne" },
  { id: "b", name: "Bob" },
];

function finishedGame(id: string, updatedAt: number): Game {
  const game = createGame(players, 1, true, false, true, [1]);
  game.id = id;
  game.status = "finished";
  game.createdAt = updatedAt - 1;
  game.updatedAt = updatedAt;
  const entry = (bid: number, tricks: number): RoundEntry => ({
    bid,
    tricks,
    bonus: emptyBonus(),
    legacyLoot: 0,
    recorded: true,
    rascalBet: "buckshot",
  });
  game.rounds = [{ a: entry(1, 1), b: entry(0, 0) }];
  return game;
}

// --- fake transport + store -------------------------------------------------

class FakeTransport implements CloudTransport {
  states = new Map<string, unknown>();
  keys = new Map<string, string>();
  createCalls = 0;
  putCalls = 0;
  offline = false;
  private counter = 0;

  async create(writerKey: string): Promise<string> {
    if (this.offline) throw new Error("offline");
    this.createCalls++;
    this.counter++;
    const ownerId = `00000000-0000-4000-8000-00000000000${this.counter}`;
    this.keys.set(ownerId, writerKey);
    this.states.set(ownerId, null);
    return ownerId;
  }

  async put(ownerId: string, writerKey: string, state: unknown): Promise<void> {
    if (this.offline) throw new Error("offline");
    this.putCalls++;
    if (this.keys.get(ownerId) !== writerKey) throw new Error("wrong key");
    this.states.set(ownerId, state);
  }

  async get(ownerId: string, writerKey: string): Promise<unknown | null> {
    if (this.offline) throw new Error("offline");
    if (this.keys.get(ownerId) !== writerKey) return null;
    return this.states.get(ownerId) ?? null;
  }

  // Test helper: seed a foreign owner (as if created on another device).
  seed(ownerId: string, writerKey: string, data: BackupData): void {
    this.keys.set(ownerId, writerKey);
    this.states.set(ownerId, createBackupPayload(data));
  }
}

function memoryStore(): CloudOwnerStore & { owner: CloudOwner | null } {
  const store = {
    owner: null as CloudOwner | null,
    async load() {
      return store.owner;
    },
    async save(owner: CloudOwner) {
      store.owner = owner;
    },
  };
  return store;
}

// --- sync codes -------------------------------------------------------------

section("Sync code encode / decode");
const owner: CloudOwner = {
  ownerId: "1b4e28ba-2fa1-11d2-883f-0016d3cca427",
  writerKey: "a".repeat(48),
};
const code = encodeSyncCode(owner);
const decoded = decodeSyncCode(code);
check("round-trips the owner id", decoded?.ownerId === owner.ownerId);
check("round-trips the writer key", decoded?.writerKey === owner.writerKey);
check("code carries the versioned prefix", code.startsWith("SKC1."));
check("code strips base64 padding", !code.includes("="));
check("rejects an unprefixed code", decodeSyncCode("nope") === null);
check("rejects malformed base64", decodeSyncCode("SKC1.$$$$") === null);
check(
  "rejects a non-uuid owner id",
  decodeSyncCode(encodeSyncCode({ ownerId: "not-a-uuid", writerKey: "a".repeat(48) })) ===
    null
);
check(
  "rejects a too-short writer key",
  decodeSyncCode(encodeSyncCode({ ownerId: owner.ownerId, writerKey: "abcd" })) ===
    null
);
check("uppercases nothing it should not — trims input", decodeSyncCode(` ${code} `) !== null);

// --- untrusted state hardening ---------------------------------------------

section("Cloud state hardening");
const validPayload = createBackupPayload({
  currentGame: null,
  history: [finishedGame("g1", 1000)],
});
const parsed = parseCloudState(validPayload);
eq("valid payload yields its history", parsed?.history.length ?? -1, 1);
check("null cloud state parses to null", parseCloudState(null) === null);
check("garbage cloud state parses to null", parseCloudState({ nope: true }) === null);
check("empty object (fresh row) parses to null", parseCloudState({}) === null);

// --- manager: create once, push, pull --------------------------------------

async function run() {
  section("Manager: identity, push and pull");
  const transport = new FakeTransport();
  const store = memoryStore();
  const manager = new CloudBackupManager(transport, store, 1, 5);

  const owner1 = await manager.ensureOwner();
  const owner2 = await manager.ensureOwner();
  check("ensureOwner creates an owner", owner1 !== null);
  eq("ensureOwner is idempotent (one create)", transport.createCalls, 1);
  check("owner is cached across calls", owner1?.ownerId === owner2?.ownerId);
  check("owner is persisted to the store", store.owner?.ownerId === owner1?.ownerId);

  const data: BackupData = {
    currentGame: null,
    history: [finishedGame("g1", 1000), finishedGame("g2", 2000)],
  };
  manager.push(data);
  await waitFor(() => transport.putCalls >= 1);
  eq("push reaches the transport", transport.putCalls >= 1, true);
  eq("status is synced after a push", manager.getStatus(), "synced");

  const pulled = await manager.pull();
  eq("pull returns the stored games", pulled?.history.length ?? -1, 2);

  section("Manager: offline retry");
  transport.offline = true;
  manager.push({ currentGame: null, history: [finishedGame("g3", 3000)] });
  await waitFor(() => manager.getStatus() === "offline");
  eq("a failed push goes offline", manager.getStatus(), "offline");
  const putsBefore = transport.putCalls;
  transport.offline = false;
  const recovered = await waitFor(() => manager.getStatus() === "synced", 800);
  check("push retries and recovers when back online", recovered);
  check("the retry actually re-sent", transport.putCalls > putsBefore);

  section("Manager: adopt another device's code");
  const foreign: CloudOwner = {
    ownerId: "1b4e28ba-2fa1-11d2-883f-0016d3cca427",
    writerKey: "f".repeat(48),
  };
  transport.seed(foreign.ownerId, foreign.writerKey, {
    currentGame: null,
    history: [finishedGame("shared", 5000)],
  });
  const adopted = await manager.adopt(encodeSyncCode(foreign));
  eq("adopt returns the foreign games", adopted?.history[0]?.id, "shared");
  check("adopt switches this device's owner", store.owner?.ownerId === foreign.ownerId);

  const ownerBeforeBadAdopt = store.owner?.ownerId;
  check(
    "adopt rejects a well-formed but unknown code",
    await rejects(() =>
      manager.adopt(
        encodeSyncCode({
          ownerId: "22222222-2222-4222-8222-222222222222",
          writerKey: "e".repeat(48),
        })
      )
    )
  );
  check(
    "a rejected adopt leaves the working owner unchanged",
    store.owner?.ownerId === ownerBeforeBadAdopt
  );
  check("adopt rejects a bad code", await rejects(() => manager.adopt("garbage")));

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

async function rejects(fn: () => Promise<unknown>): Promise<boolean> {
  try {
    await fn();
    return false;
  } catch {
    return true;
  }
}

void run();
