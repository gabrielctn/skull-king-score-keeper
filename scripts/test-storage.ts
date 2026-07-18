/**
 * Shape-based save migration checks.
 * Run with: npm run test:storage
 */
import { createGame } from "../src/scoring";
import { normalizeGame, normalizeSettings } from "../src/storage";

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

const players = [
  { id: "a", name: "Anne" },
  { id: "b", name: "Bonny" },
  { id: "c", name: "Calico" },
];

console.log("Legacy Loot migration");
const legacy = normalizeGame({
  id: "legacy",
  players,
  totalRounds: 2,
  rounds: [
    {
      a: {
        bid: 1,
        tricks: 1,
        bonus: { loot: 2, black14: true },
        recorded: true,
      },
      b: { bid: 0, tricks: 0, bonus: {}, recorded: true },
      c: { bid: 0, tricks: 1, bonus: {}, recorded: true },
    },
    {},
  ],
});
check("legacy save normalizes", legacy !== null);
if (legacy) {
  check("old count is preserved separately", legacy.rounds[0].a.legacyLoot === 2);
  check(
    "old editable Loot field is removed",
    !("loot" in legacy.rounds[0].a.bonus)
  );
  check("missing round bindings become empty", legacy.lootUses.length === 2);
  check("first round has no invented pair", legacy.lootUses[0].length === 0);
  check(
    "old saves default Kraken-discard counts to zero",
    legacy.discardedTricks.length === 2 &&
      legacy.discardedTricks.every((n) => n === 0)
  );
  check("new expansion stays off for pre-v5 saves", !legacy.newExpansion);
  check(
    "new expansion bonus fields default safely",
    legacy.rounds[0].a.bonus.expansion7 === 0 &&
      legacy.rounds[0].a.bonus.expansion8 === 0 &&
      legacy.rounds[0].a.bonus.davyJonesLeviathans === 0 &&
      !legacy.rounds[0].a.bonus.secondCaptured
  );
}

console.log("Loot-use validation and physical two-card cap");
const normalized = normalizeGame({
  id: "new",
  players,
  totalRounds: 2,
  rounds: [{}, {}],
  lootUses: [
    [
      { id: "one", playedById: "a", boundToId: "b" },
      { id: "self", playedById: "a", boundToId: "a" },
      { id: "third", playedById: "b", boundToId: "c" },
    ],
    [
      { id: "pending", playedById: null, boundToId: null },
      { id: "invalid", playedById: "missing", boundToId: "a" },
    ],
  ],
});
check("new save normalizes", normalized !== null);
if (normalized) {
  check("only two physical cards are kept", normalized.lootUses[0].length === 2);
  check(
    "self-win is retained as a used card",
    normalized.lootUses[0][1]?.boundToId === "a"
  );
  check(
    "pending use survives navigation/reload",
    normalized.lootUses[1][0]?.playedById === null &&
      normalized.lootUses[1][0]?.boundToId === null
  );
  check("unknown players are rejected", normalized.lootUses[1].length === 1);
}

console.log("Current-game JSON round trip");
const current = createGame(players, 2, true);
current.lootUses[0] = [
  { id: "roundtrip", playedById: "a", boundToId: "c" },
];
current.newExpansion = true;
current.rounds[0].a.bonus.expansion7 = 2;
current.rounds[0].a.bonus.davyJonesLeviathans = 1;
current.discardedTricks[0] = 1;
const roundTripped = normalizeGame(JSON.parse(JSON.stringify(current)));
check(
  "bound player IDs survive JSON persistence",
  roundTripped?.lootUses[0][0]?.playedById === "a" &&
    roundTripped?.lootUses[0][0]?.boundToId === "c"
);
check(
  "new expansion settings survive JSON persistence",
  roundTripped?.newExpansion === true &&
    roundTripped.rounds[0].a.bonus.expansion7 === 2 &&
    roundTripped.rounds[0].a.bonus.davyJonesLeviathans === 1
);
check(
  "Kraken-discard count survives JSON persistence",
  roundTripped?.discardedTricks[0] === 1 &&
    roundTripped.discardedTricks[1] === 0
);

console.log("App settings normalization");
check(
  "missing settings fall back to keep-awake on",
  normalizeSettings(null).keepAwake === true
);
check(
  "corrupt settings fall back to keep-awake on",
  normalizeSettings("nonsense").keepAwake === true &&
    normalizeSettings({ keepAwake: "yes" }).keepAwake === true
);
check(
  "an explicit opt-out survives",
  normalizeSettings({ keepAwake: false }).keepAwake === false
);
check(
  "unknown fields from newer versions are dropped",
  Object.keys(normalizeSettings({ keepAwake: true, future: 1 })).join(",") ===
    "keepAwake"
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
