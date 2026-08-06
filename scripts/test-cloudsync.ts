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
  InviteError,
  TableInvite,
  buildJoinUrl,
  classifyJoinInput,
  decodeSyncCode,
  encodeSyncCode,
  extractJoinCode,
  parseCloudState,
} from "../src/cloudSync";
import {
  formatCountdown,
  formatInviteCode,
  inviteSecondsLeft,
  normalizeInviteCode,
} from "../src/tableInvites";
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
  inviteCalls = 0;
  invites = new Map<string, CloudOwner>();
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

  async createInvite(ownerId: string, writerKey: string): Promise<TableInvite> {
    if (this.offline) throw new InviteError("offline");
    if (this.keys.get(ownerId) !== writerKey) throw new InviteError("offline");
    this.inviteCalls++;
    const invite = `K7M4Q${this.inviteCalls}`;
    this.invites.set(invite, { ownerId, writerKey });
    return { code: invite, expiresAt: Date.now() + 900_000 };
  }

  async redeemInvite(code: string): Promise<CloudOwner> {
    if (this.offline) throw new InviteError("offline");
    const owner = this.invites.get(code);
    if (!owner) throw new InviteError("unknown");
    return owner;
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

// --- table join links -------------------------------------------------------

section("Table join links");
const joinUrl = buildJoinUrl(code, "https://example.com/app/");
check("join URL carries the #join= hash", joinUrl === `https://example.com/app/#join=${code}`);
check("extract round-trips the code from a full hash", extractJoinCode(`#join=${code}`) === code);
check("extract accepts a hash without the # prefix", extractJoinCode(`join=${code}`) === code);
check("extract rejects an empty hash", extractJoinCode("") === null);
check("extract rejects other hash params", extractJoinCode(`#live=${code}`) === null);
check("extract rejects a malformed code", extractJoinCode("#join=SKC1.$$$$") === null);
check("extract rejects a non-code payload", extractJoinCode("#join=hello") === null);

// --- short invite codes -----------------------------------------------------

section("Table invite codes");
check("accepts a plain six-character code", normalizeInviteCode("K7M4QP") === "K7M4QP");
check("ignores case", normalizeInviteCode("k7m4qp") === "K7M4QP");
check("ignores the display separator", normalizeInviteCode("K7M-4QP") === "K7M4QP");
check("ignores spaces around and inside", normalizeInviteCode(" K7M 4QP ") === "K7M4QP");
// Crockford folding: a code read out loud must survive the ear and the keyboard.
check("folds I and L to 1", normalizeInviteCode("IL34QP") === "1134QP");
check("folds O to 0", normalizeInviteCode("O734QP") === "0734QP");
check("rejects a short code", normalizeInviteCode("K7M4Q") === null);
check("rejects a long code", normalizeInviteCode("K7M4QPZ") === null);
check("rejects U, which the alphabet leaves out", normalizeInviteCode("K7M4QU") === null);
check("rejects an empty string", normalizeInviteCode("") === null);
check("groups a code for display", formatInviteCode("K7M4QP") === "K7M-4QP");
eq("counts whole seconds left", inviteSecondsLeft(10_000, 4_500), 6);
eq("never counts below zero", inviteSecondsLeft(1_000, 9_000), 0);
eq("formats the countdown as m:ss", formatCountdown(605), "10:05");
eq("pads the seconds", formatCountdown(61), "1:01");

section("Join field input");
check(
  "a six-character code is read as an invite",
  classifyJoinInput("k7m-4qp")?.kind === "invite"
);
check(
  "a full table code is read as a sync code",
  classifyJoinInput(code)?.kind === "sync"
);
check(
  "a pasted join link yields the code it carries",
  classifyJoinInput(buildJoinUrl(code, "https://example.com/app/"))?.code === code
);
check("empty input classifies as nothing", classifyJoinInput("   ") === null);
check("prose classifies as nothing", classifyJoinInput("join my table") === null);

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

// A pulled row has to bring the table's deletions back with its games: they are
// what stops this device from re-uploading a game a crew mate deleted.
const deletedPayload = createBackupPayload({
  currentGame: null,
  history: [finishedGame("kept", 1000)],
  deletions: { removed: 900 },
});
check(
  "a pulled row keeps the table's deletions",
  parseCloudState(deletedPayload)?.deletions?.removed === 900
);
check(
  "a pushed snapshot drops the games its deletions cover",
  createBackupPayload({
    currentGame: null,
    history: [finishedGame("kept", 1000), finishedGame("removed", 800)],
    deletions: { removed: 900 },
  }).history.every((entry) => entry.id !== "removed")
);

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

  section("Manager: peek a table without adopting");
  const peekOwner: CloudOwner = {
    ownerId: "33333333-3333-4333-8333-333333333333",
    writerKey: "d".repeat(48),
  };
  transport.seed(peekOwner.ownerId, peekOwner.writerKey, {
    currentGame: null,
    history: [finishedGame("peeked", 6000)],
    tableName: "Crew of the Fable",
  });
  const ownerBeforePeek = store.owner?.ownerId;
  const peeked = await manager.peek(encodeSyncCode(peekOwner));
  eq("peek returns the table's games", peeked?.history[0]?.id, "peeked");
  eq("peek returns the table name", peeked?.tableName ?? null, "Crew of the Fable");
  check(
    "peek never touches this device's owner",
    store.owner?.ownerId === ownerBeforePeek
  );
  check(
    "peek rejects a well-formed but unknown code",
    await rejects(() =>
      manager.peek(
        encodeSyncCode({
          ownerId: "44444444-4444-4444-8444-444444444444",
          writerKey: "c".repeat(48),
        })
      )
    )
  );
  check("peek rejects a bad code", await rejects(() => manager.peek("garbage")));

  section("Manager: several tables on one device");
  const otherTable: CloudOwner = {
    ownerId: "55555555-5555-4555-8555-555555555555",
    writerKey: "b".repeat(48),
  };
  transport.seed(otherTable.ownerId, otherTable.writerKey, {
    currentGame: null,
    history: [finishedGame("friday", 7000)],
    tableName: "Friday crew",
  });
  const switched = await manager.switchTo(otherTable);
  eq("switching loads that table's games", switched?.history[0]?.id, "friday");
  eq("switching loads that table's name", switched?.tableName ?? null, "Friday crew");
  check(
    "switching makes it the active identity",
    manager.getOwner()?.ownerId === otherTable.ownerId &&
      store.owner?.ownerId === otherTable.ownerId
  );

  const ownerBeforeBadSwitch = store.owner?.ownerId;
  check(
    "switching to an unknown table is refused",
    await rejects(() =>
      manager.switchTo({
        ownerId: "66666666-6666-4666-8666-666666666666",
        writerKey: "9".repeat(48),
      })
    )
  );
  check(
    "a refused switch keeps the working table",
    store.owner?.ownerId === ownerBeforeBadSwitch
  );

  const createsBefore = transport.createCalls;
  const fresh = await manager.createTable();
  check("a new table gets its own owner id", fresh.ownerId !== otherTable.ownerId);
  check("a new table is created server-side", transport.createCalls === createsBefore + 1);
  check("a new table becomes active", manager.getOwner()?.ownerId === fresh.ownerId);
  const freshState = await manager.pull();
  check("a new table starts empty", freshState === null);

  // Switching tables replaces local state, so a queued change must reach its
  // own table's row first; the guard is flushPending() reporting success.
  section("Manager: flushing before a table change");
  manager.push({ currentGame: null, history: [finishedGame("g9", 9000)] });
  const flushed = await manager.flushPending();
  check("a pending push flushes on demand", flushed);
  eq("the flushed state is stored", manager.getStatus(), "synced");
  check("flushing with nothing pending succeeds", await manager.flushPending());

  transport.offline = true;
  manager.push({ currentGame: null, history: [finishedGame("g10", 10000)] });
  const flushedOffline = await manager.flushPending();
  check("flushing while offline reports failure", !flushedOffline);
  transport.offline = false;
  check("the unsent change stays queued for later", await manager.flushPending());

  // A short code is a *carrier* for the table's own code: minting one never
  // changes this device's identity, and redeeming one never joins anything by
  // itself — it hands back a SKC1. code for the usual confirmation flow.
  section("Manager: short invite codes");
  const inviteOwner = manager.getOwner();
  const invite = await manager.createInvite();
  check("an invite is minted for the active table", invite.code.length === 6);
  check("minting leaves the active table alone", manager.getOwner()?.ownerId === inviteOwner?.ownerId);
  check("the invite expires in the future", invite.expiresAt > Date.now());

  const redeemed = await manager.redeemInvite(invite.code);
  check("redeeming yields a table code", decodeSyncCode(redeemed)?.ownerId === inviteOwner?.ownerId);
  check(
    "redeeming does not join the table on its own",
    manager.getOwner()?.ownerId === inviteOwner?.ownerId
  );
  check(
    "a code typed with separators and lowercase still redeems",
    (await manager.redeemInvite(` ${formatInviteCode(invite.code).toLowerCase()} `)) === redeemed
  );

  const unknownReason = await manager
    .redeemInvite("ZZZZZZ")
    .then(() => null)
    .catch((error) => (error instanceof InviteError ? error.reason : "other"));
  eq("an unknown code reports itself as unknown", unknownReason, "unknown");
  const malformedReason = await manager
    .redeemInvite("nope")
    .then(() => null)
    .catch((error) => (error instanceof InviteError ? error.reason : "other"));
  eq("a malformed code never reaches the backend", malformedReason, "unknown");

  transport.offline = true;
  const offlineReason = await manager
    .createInvite()
    .then(() => null)
    .catch((error) => (error instanceof InviteError ? error.reason : "other"));
  eq("minting offline reports itself as offline", offlineReason, "offline");
  transport.offline = false;

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
