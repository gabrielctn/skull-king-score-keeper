/**
 * Contract tests for cross-game statistics and endgame awards.
 * Run with: npm run test:stats
 */
import { createGame, emptyBonus } from "../src/scoring";
import {
  aggregateStats,
  cumulativeScoreSeries,
  gameAwards,
  normalizePlayerName,
  playerNameSuggestions,
} from "../src/stats";
import { BonusInput, Game, LootUse, Player, RoundEntry } from "../src/types";

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
  if (Object.is(actual, expected)) {
    passed++;
    console.log(`  ✓ ${label} = ${String(actual)}`);
  } else {
    failed++;
    console.error(
      `  ✗ ${label}: expected ${String(expected)}, got ${String(actual)}`
    );
  }
}

function deepEq(label: string, actual: unknown, expected: unknown) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson === expectedJson) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(
      `  ✗ ${label}: expected ${expectedJson}, got ${actualJson}`
    );
  }
}

function approx(label: string, actual: number, expected: number) {
  const epsilon = 1e-9;
  if (Math.abs(actual - expected) <= epsilon) {
    passed++;
    console.log(`  ✓ ${label} ≈ ${expected}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}: expected ${expected}, got ${actual}`);
  }
}

function doesNotThrow(label: string, fn: () => unknown) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${label}`);
  } catch (error) {
    failed++;
    console.error(`  ✗ ${label}: ${String(error)}`);
  }
}

function section(title: string) {
  console.log(`\n${title}`);
}

const E = (
  bid: number,
  tricks: number,
  bonus: Partial<BonusInput> = {},
  recorded = true,
  legacyLoot = 0
): RoundEntry => ({
  bid,
  tricks,
  bonus: { ...emptyBonus(), ...bonus },
  legacyLoot,
  recorded,
});

interface GameOptions {
  status?: Game["status"];
  advancedCards?: boolean;
  twoPlayerGhost?: boolean;
  cardsDealt?: number[];
  lootUses?: LootUse[][];
  createdAt?: number;
}

function fixtureGame(
  id: string,
  updatedAt: number,
  players: Player[],
  rounds: Game["rounds"],
  options: GameOptions = {}
): Game {
  const game = createGame(
    players,
    rounds.length,
    options.advancedCards ?? true,
    options.twoPlayerGhost ?? false,
    true,
    options.cardsDealt
  );
  game.id = id;
  game.createdAt = options.createdAt ?? updatedAt - 1;
  game.updatedAt = updatedAt;
  game.status = options.status ?? "finished";
  game.totalRounds = rounds.length;
  game.currentRound = Math.max(1, rounds.length);
  game.rounds = rounds;
  game.cardsDealt =
    options.cardsDealt ?? rounds.map((_, roundIndex) => roundIndex + 1);
  game.lootUses =
    options.lootUses ?? rounds.map(() => []);
  game.discardedTricks = rounds.map(() => 0);
  return game;
}

section("Player-name normalization");
eq(
  "trim, accents, case, and whitespace",
  normalizePlayerName("  ÉLISE \t de   L’Île "),
  "elise de l’ile"
);
eq(
  "apostrophes are preserved",
  normalizePlayerName("  D'Artagnan  "),
  "d'artagnan"
);
eq("empty whitespace stays empty", normalizePlayerName("  \n\t "), "");

section("Aggregates, identity merging, and finished-game filtering");
const olderIdentity = fixtureGame(
  "identity_old",
  100,
  [
    { id: "elise_old", name: "  ÉLISE " },
    { id: "bob_old", name: "Bob" },
  ],
  [
    {
      elise_old: E(1, 1),
      bob_old: E(0, 1),
    },
  ]
);
const newerIdentity = fixtureGame(
  "identity_new",
  300,
  [
    { id: "elise_new", name: "Elisé" },
    { id: "cara_new", name: "Cara" },
  ],
  [
    {
      elise_new: E(0, 0),
      cara_new: E(1, 1),
    },
    {
      elise_new: E(5, 5, { black14: true }, false),
      cara_new: E(2, 2, {}, false),
    },
  ]
);
const ignoredInProgress = fixtureGame(
  "identity_live",
  500,
  [
    { id: "elise_live", name: "ELISE" },
    { id: "cara_live", name: "Cara" },
  ],
  [
    {
      elise_live: E(3, 3, { black14: true }),
      cara_live: E(0, 1),
    },
  ],
  { status: "in_progress" }
);
const identitySnapshot = aggregateStats([
  olderIdentity,
  ignoredInProgress,
  newerIdentity,
]);
const elise = identitySnapshot.players.find((player) => player.identity === "elise");
check("accent/case/space variants merge", elise !== undefined);
eq("newest finished spelling wins", elise?.name, "Elisé");
eq("in-progress appearance is ignored", elise?.gamesPlayed, 2);
eq("only finished wins count", elise?.wins, 1);
approx("win rate is a fraction", elise?.winRate ?? -1, 0.5);
eq("exact attempts use recorded entries", elise?.exactBids.attempts, 2);
eq("exact successes use madeBid", elise?.exactBids.successes, 2);
eq("zero-bid attempts are a subset", elise?.zeroBids.attempts, 1);
eq("successful zero bids use madeBid", elise?.zeroBids.successes, 1);
approx("average final score", elise?.averagePoints ?? -1, 15);
eq("best final score", elise?.bestFinalScore, 20);
eq("recent games newest first", elise?.recentGames[0]?.gameId, "identity_new");
eq("older appearance follows", elise?.recentGames[1]?.gameId, "identity_old");
eq("latest loss ends current streak", elise?.currentWinStreak, 0);
eq("in-progress score does not become a record", identitySnapshot.records.bestFinalScore?.score, 20);
eq(
  "zero-bid rate is null with no zero-bid attempts",
  identitySnapshot.players.find((player) => player.identity === "cara")?.zeroBids.rate,
  null
);

const collision = fixtureGame(
  "collision",
  600,
  [
    { id: "sam_one", name: "Sam" },
    { id: "sam_two", name: " SÁM " },
    { id: "other", name: "Other" },
  ],
  [
    {
      sam_one: E(1, 1),
      sam_two: E(0, 0),
      other: E(1, 0),
    },
  ]
);
const sharedIdentity = aggregateStats([collision]).players.find(
  (player) => player.identity === "sam"
);
eq("same-name seats contribute two appearances", sharedIdentity?.gamesPlayed, 2);
eq("same-name seats contribute two recent items", sharedIdentity?.recentGames.length, 2);
eq("only the winning same-name seat adds a win", sharedIdentity?.wins, 1);
approx("same-name seat scores share one average", sharedIdentity?.averagePoints ?? -1, 15);

section("Shared wins and current streaks");
const tieOld = fixtureGame(
  "tie_old",
  700,
  [
    { id: "alice_old", name: "Alice" },
    { id: "bonny_old", name: "Bonny" },
    { id: "calico_old", name: "Calico" },
  ],
  [
    {
      alice_old: E(1, 1),
      bonny_old: E(1, 1),
      calico_old: E(0, 1),
    },
  ]
);
const tieNew = fixtureGame(
  "tie_new",
  800,
  [
    { id: "alice_new", name: "Alice" },
    { id: "bonny_new", name: "Bonny" },
    { id: "calico_new", name: "Calico" },
  ],
  [
    {
      alice_new: E(1, 1),
      bonny_new: E(1, 1),
      calico_new: E(0, 1),
    },
  ]
);
const tieStats = aggregateStats([tieOld, tieNew]);
const alice = tieStats.players.find((player) => player.identity === "alice");
const bonny = tieStats.players.find((player) => player.identity === "bonny");
eq("first tied winner credited in both games", alice?.wins, 2);
eq("second tied winner credited in both games", bonny?.wins, 2);
eq("first tied winner streak extends", alice?.currentWinStreak, 2);
eq("second tied winner streak extends", bonny?.currentWinStreak, 2);

section("Leaderboard ordering");
const orderingOld = fixtureGame(
  "ordering_old",
  900,
  [
    { id: "oa", name: "A" },
    { id: "ob", name: "B" },
    { id: "oc", name: "C" },
    { id: "od", name: "D" },
    { id: "oe", name: "E" },
    { id: "of", name: "F" },
  ],
  [
    {
      oa: E(2, 2),
      ob: E(0, 1),
      oc: E(0, 1),
      od: E(0, 1),
      oe: E(0, 1),
      of: E(0, 1),
    },
  ]
);
const orderingNew = fixtureGame(
  "ordering_new",
  1000,
  [
    { id: "ob2", name: "B" },
    { id: "oc2", name: "C" },
  ],
  [
    {
      ob2: E(1, 1),
      oc2: E(0, 1),
    },
  ]
);
deepEq(
  "wins, win rate, games, recency, then identity",
  aggregateStats([orderingOld, orderingNew]).players.map((player) => player.identity),
  ["a", "b", "c", "d", "e", "f"]
);

section("Group records use canonical score histories");
const lootRecord = fixtureGame(
  "loot_record",
  1200,
  [
    { id: "loot_a", name: "Alpha" },
    { id: "loot_b", name: "Bravo" },
    { id: "loot_c", name: "Charlie" },
  ],
  [
    {
      loot_a: E(1, 1),
      loot_b: E(0, 0),
      loot_c: E(5, 0, { colored14: 3 }),
    },
  ],
  {
    advancedCards: true,
    cardsDealt: [5],
    lootUses: [
      [
        {
          id: "loot_active",
          playedById: "loot_a",
          boundToId: "loot_b",
        },
      ],
    ],
  }
);
const lootRecords = aggregateStats([lootRecord]).records;
eq("best final score includes successful Loot", lootRecords.bestFinalScore?.score, 70);
eq("best score record holder", lootRecords.bestFinalScore?.identity, "bravo");
eq("best score record game", lootRecords.bestFinalScore?.gameId, "loot_record");
eq("best score record date", lootRecords.bestFinalScore?.playedAt, 1200);
eq("worst round includes capture bonuses", lootRecords.worstRound?.score, -20);
eq("worst round number is retained", lootRecords.worstRound?.roundNumber, 1);
eq("worst round holder", lootRecords.worstRound?.identity, "charlie");

const exactMany = fixtureGame(
  "exact_many",
  1300,
  [
    { id: "many", name: "Many" },
    { id: "many_foe", name: "Foe" },
  ],
  [
    { many: E(1, 1), many_foe: E(0, 1) },
    { many: E(1, 1), many_foe: E(0, 1) },
  ]
);
const exactOne = fixtureGame(
  "exact_one",
  1400,
  [
    { id: "one", name: "One" },
    { id: "one_foe", name: "Other" },
  ],
  [{ one: E(1, 1), one_foe: E(0, 1) }]
);
const exactRecord = aggregateStats([exactOne, exactMany]).records.bestExactBidRate;
eq("equal exact rates prefer larger sample", exactRecord?.identity, "many");
eq("exact-rate record carries successes", exactRecord?.successes, 2);
eq("exact-rate record carries attempts", exactRecord?.attempts, 2);

section("Cumulative score series");
const sparse = fixtureGame(
  "sparse",
  1500,
  [
    { id: "sparse_a", name: "Sparse A" },
    { id: "sparse_b", name: "Sparse B" },
  ],
  [
    { sparse_a: E(1, 1), sparse_b: E(0, 0) },
    { sparse_a: E(2, 2, {}, false), sparse_b: E(0, 0, {}, false) },
    { sparse_a: E(0, 0), sparse_b: E(1, 0) },
  ]
);
const sparseSeries = cumulativeScoreSeries(sparse);
deepEq(
  "series keeps sparse round numbers and running totals",
  sparseSeries.find((series) => series.playerId === "sparse_a")?.points,
  [
    { roundNumber: 1, total: 20 },
    { roundNumber: 3, total: 50 },
  ]
);
eq("series has one row per real player", sparseSeries.length, 2);

section("Setup suggestions");
const suggestionOld = fixtureGame(
  "suggestion_old",
  1600,
  [
    { id: "suggestion_old_elise", name: "Elise" },
    { id: "suggestion_cara", name: "Cara" },
    { id: "suggestion_empty", name: "   " },
  ],
  []
);
const suggestionNew = fixtureGame(
  "suggestion_new",
  1800,
  [
    { id: "suggestion_new_elise", name: "Élise" },
    { id: "suggestion_bob", name: "BOB" },
  ],
  [],
  { status: "in_progress" }
);
deepEq(
  "suggestions include in-progress games and keep newest spelling",
  playerNameSuggestions([suggestionOld, suggestionNew]),
  ["Élise", "BOB", "Cara"]
);
deepEq(
  "suggestions exclude normalized setup names",
  playerNameSuggestions([suggestionOld, suggestionNew], ["  elisé ", ""]),
  ["BOB", "Cara"]
);
eq(
  "in-progress suggestion still does not feed aggregates",
  aggregateStats([suggestionOld, suggestionNew]).players.length,
  0
);

section("Defensive and degenerate histories");
const emptySnapshot = aggregateStats([]);
eq("empty input has no players", emptySnapshot.players.length, 0);
eq("empty input has no best score", emptySnapshot.records.bestFinalScore, null);
eq("empty input has no worst round", emptySnapshot.records.worstRound, null);
eq("empty input has no exact record", emptySnapshot.records.bestExactBidRate, null);

const noPlayers = fixtureGame("no_players", 1900, [], []);
const noHistory = fixtureGame(
  "no_history",
  2000,
  [
    { id: "idle_a", name: "Idle A" },
    { id: "idle_b", name: "Idle B" },
  ],
  [{ idle_a: E(0, 0, {}, false), idle_b: E(0, 0, {}, false) }]
);
const missingSlots = fixtureGame(
  "missing_slots",
  2100,
  [
    { id: "short_a", name: "Short A" },
    { id: "short_b", name: "Short B" },
  ],
  [{ short_a: E(1, 1) }, {}, {}]
);
doesNotThrow("empty-player game is safe", () => aggregateStats([noPlayers]));
doesNotThrow("missing round entries are safe", () => aggregateStats([missingSlots]));
eq("no-record game contributes no aggregate rows", aggregateStats([noHistory]).players.length, 0);
eq("no-record game contributes no awards", gameAwards(noHistory).length, 0);
eq("no-record game contributes no best score", aggregateStats([noHistory]).records.bestFinalScore, null);
eq("valid seat survives missing entries", aggregateStats([missingSlots]).players.length, 1);

const ghostGame = fixtureGame(
  "ghost",
  2200,
  [
    { id: "ghost_one", name: "One" },
    { id: "ghost_two", name: "Two" },
  ],
  [{ ghost_one: E(0, 0), ghost_two: E(0, 1) }],
  { twoPlayerGhost: true }
);
eq("two-player ghost game exposes only real players", aggregateStats([ghostGame]).players.length, 2);
eq("two-player series exposes only real players", cumulativeScoreSeries(ghostGame).length, 2);

section("Award priority, criteria, and uniqueness");
const awardGame = fixtureGame(
  "awards",
  2300,
  [
    { id: "award_a", name: "Anne" },
    { id: "award_b", name: "Bonny" },
    { id: "award_c", name: "Calico" },
    { id: "award_d", name: "Drake" },
    { id: "award_e", name: "Edward" },
  ],
  [
    {
      award_a: E(0, 0),
      award_b: E(0, 0),
      award_c: E(1, 0),
      award_d: E(5, 0),
      award_e: E(0, 1),
    },
    {
      award_a: E(0, 0),
      award_b: E(0, 0),
      award_c: E(2, 0),
      award_d: E(5, 0),
      award_e: E(0, 1),
    },
    {
      award_a: E(0, 0),
      award_b: E(1, 1),
      award_c: E(3, 3),
      award_d: E(5, 0),
      award_e: E(0, 1),
    },
    {
      award_a: E(1, 1),
      award_b: E(2, 1),
      award_c: E(4, 4),
      award_d: E(5, 0),
      award_e: E(10, 0),
    },
  ]
);
const awards = gameAwards(awardGame);
deepEq(
  "awards follow priority order",
  awards.map((award) => award.kind),
  ["lookout", "zeroBidRoyalty", "comeback", "reckless", "castaway"]
);
deepEq(
  "criterion leaders are filtered after receiving an award",
  awards.map((award) => award.playerId),
  ["award_a", "award_b", "award_c", "award_d", "award_e"]
);
deepEq(
  "award values carry their canonical criterion",
  awards.map((award) => award.value),
  [4, 2, 2, 20, -100]
);
eq("each player receives at most one award", new Set(awards.map((award) => award.playerId)).size, awards.length);
eq("each award kind appears at most once", new Set(awards.map((award) => award.kind)).size, awards.length);

const finalScoreTieBreak = fixtureGame(
  "award_final_tie_break",
  2400,
  [
    { id: "tie_low", name: "Low" },
    { id: "tie_high", name: "High" },
  ],
  [
    {
      tie_low: E(1, 1),
      tie_high: E(1, 1, { black14: true }),
    },
  ]
);
eq(
  "equal award criterion uses higher final total",
  gameAwards(finalScoreTieBreak).find((award) => award.kind === "lookout")?.playerId,
  "tie_high"
);

const unresolvedTie = fixtureGame(
  "award_unresolved_tie",
  2500,
  [
    { id: "unresolved_a", name: "A" },
    { id: "unresolved_b", name: "B" },
    { id: "unresolved_c", name: "C" },
  ],
  [
    {
      unresolved_a: E(1, 1),
      unresolved_b: E(1, 1),
      unresolved_c: E(1, 1),
    },
    {
      unresolved_a: E(1, 1),
      unresolved_b: E(1, 1),
      unresolved_c: E(1, 0),
    },
  ]
);
check(
  "unresolved top tie omits award instead of falling through",
  !gameAwards(unresolvedTie).some((award) => award.kind === "lookout")
);

const unfinishedAwards = { ...awardGame, status: "in_progress" as const };
eq("in-progress game has no awards", gameAwards(unfinishedAwards).length, 0);
eq("empty-player game has no awards", gameAwards(noPlayers).length, 0);
doesNotThrow("degenerate awards do not throw", () => gameAwards(noPlayers));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
