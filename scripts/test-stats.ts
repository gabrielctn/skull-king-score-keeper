/**
 * Contract tests for cross-game statistics and endgame awards.
 * Run with: npm run test:stats
 */
import { createGame, emptyBonus } from "../src/scoring";
import {
  aggregateStats,
  cumulativeScoreSeries,
  gameAwards,
  gameDuration,
  MIN_RATED_ROUNDS,
  MIN_ZERO_BIDS,
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
  rascalBet: "buckshot",
});

interface GameOptions {
  status?: Game["status"];
  advancedCards?: boolean;
  twoPlayerGhost?: boolean;
  bonusesRequireBid?: boolean;
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
  game.bonusesRequireBid =
    options.bonusesRequireBid ?? game.bonusesRequireBid;
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
eq("worst final score", elise?.worstFinalScore, 10);
eq("worst single round score", elise?.worstRound, 10);
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
    bonusesRequireBid: false,
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
eq(
  "an old unconditional game keeps capture bonuses in its records",
  lootRecords.worstRound?.score,
  -20
);
eq("worst round number is retained", lootRecords.worstRound?.roundNumber, 1);
eq("worst round holder", lootRecords.worstRound?.identity, "charlie");

// Rate records only name a holder once the sample is big enough to mean
// something. Each rated game runs the gate exactly: one seat bids the whole
// hand and takes it, the other bids one trick and takes none.
function ratedGame(id: string, updatedAt: number, rounds: number): Game {
  return fixtureGame(
    id,
    updatedAt,
    [
      { id: `${id}_sharp`, name: "Sharp" },
      { id: `${id}_blunt`, name: "Blunt" },
    ],
    Array.from({ length: rounds }, (_unused, index) => ({
      [`${id}_sharp`]: E(index + 1, index + 1),
      [`${id}_blunt`]: E(1, 0),
    })),
    { cardsDealt: Array.from({ length: rounds }, (_unused, i) => i + 1) }
  );
}

const shortOfGate = aggregateStats([
  ratedGame("gate_short", 1250, MIN_RATED_ROUNDS - 1),
]).records;
eq(
  "one round short of the gate leaves the exact-bid record unclaimed",
  shortOfGate.bestExactBidRate,
  null
);
eq(
  "one round short of the gate leaves the bid-appetite record unclaimed",
  shortOfGate.boldestBidder,
  null
);

const atGate = aggregateStats([
  ratedGame("gate_full", 1260, MIN_RATED_ROUNDS),
]).records;
eq("the gate publishes the exact-bid record", atGate.bestExactBidRate?.identity, "sharp");
eq("exact-rate record carries successes", atGate.bestExactBidRate?.successes, MIN_RATED_ROUNDS);
eq("exact-rate record carries attempts", atGate.bestExactBidRate?.attempts, MIN_RATED_ROUNDS);
eq("the gate publishes the bid-appetite record", atGate.boldestBidder?.identity, "sharp");
approx("bidding the whole hand is total appetite", atGate.boldestBidder?.aggression ?? -1, 1);
approx("bid appetite keeps its raw average", atGate.boldestBidder?.averageBid ?? -1, 5.5);
eq("bid-appetite record carries its sample", atGate.boldestBidder?.roundsPlayed, MIN_RATED_ROUNDS);

const exactMany = fixtureGame(
  "exact_many",
  1300,
  [
    { id: "many", name: "Many" },
    { id: "many_foe", name: "Foe" },
  ],
  Array.from({ length: MIN_RATED_ROUNDS }, () => ({
    many: E(1, 1),
    many_foe: E(0, 1),
  })),
  { cardsDealt: Array.from({ length: MIN_RATED_ROUNDS }, () => 1) }
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
eq("a perfect single round never outranks a real sample", exactRecord?.identity, "many");
eq("the surviving record carries its own successes", exactRecord?.successes, MIN_RATED_ROUNDS);

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
eq("empty input has no worst final score", emptySnapshot.records.worstFinalScore, null);
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

section("Extended crew stats, records, and summary");
// Three finished games among Anne, Bea and Cal, chosen so every new metric has
// a single, hand-checkable holder. Card counts: g1 = [1, 2], g2/g3 = [1].
const crewOne = fixtureGame(
  "crew_g1",
  100,
  [
    { id: "anne_1", name: "Anne" },
    { id: "bea_1", name: "Bea" },
    { id: "cal_1", name: "Cal" },
  ],
  [
    { anne_1: E(1, 1), bea_1: E(0, 0), cal_1: E(1, 0) },
    { anne_1: E(2, 2), bea_1: E(0, 0), cal_1: E(0, 1) },
  ],
  { cardsDealt: [1, 2] }
);
const crewTwo = fixtureGame(
  "crew_g2",
  200,
  [
    { id: "anne_2", name: "Anne" },
    { id: "bea_2", name: "Bea" },
    { id: "cal_2", name: "Cal" },
  ],
  [{ anne_2: E(1, 1), bea_2: E(0, 0), cal_2: E(0, 1) }],
  { cardsDealt: [1] }
);
const crewThree = fixtureGame(
  "crew_g3",
  300,
  [
    { id: "anne_3", name: "Anne" },
    { id: "bea_3", name: "Bea" },
    { id: "cal_3", name: "Cal" },
  ],
  [{ anne_3: E(0, 1), bea_3: E(1, 1), cal_3: E(1, 1) }],
  { cardsDealt: [1] }
);
const crew = aggregateStats([crewOne, crewTwo, crewThree]);
const crewPlayer = (identity: string) =>
  crew.players.find((player) => player.identity === identity);
const anne = crewPlayer("anne");
const bea = crewPlayer("bea");
const cal = crewPlayer("cal");

eq("summary counts finished games", crew.summary.totalGames, 3);
eq("summary sums rounds played", crew.summary.totalRounds, 4);
eq("summary sums every final score", crew.summary.totalPlunder, 110);
eq("summary counts distinct players", crew.summary.totalPlayers, 3);

eq("longest win streak spans games", anne?.longestWinStreak, 2);
// Anne wins two three-seat tables outright and finishes last at the third, so
// she is ahead of 4 of the 6 rivals she has faced. Cal trails both opponents
// twice, then ties Bea for first while beating only Anne: 1 of 6.
approx("rivals beaten normalises rank by table size", anne?.rivalsBeaten ?? -1, 2 / 3);
approx("a shared win beats only the players actually behind", cal?.rivalsBeaten ?? -1, 1 / 6);
approx("average rank averages positions", anne?.averageRank ?? -1, 5 / 3);
eq("best single round is tracked", anne?.bestRound, 40);
eq("worst single round is tracked", anne?.worstRound, -10);
eq("worst final score is tracked per player", anne?.worstFinalScore, -10);
eq("bea worst single round", bea?.worstRound, 10);
eq("bea worst final score", bea?.worstFinalScore, 10);
eq("cal worst single round", cal?.worstRound, -20);
eq("cal worst final score", cal?.worstFinalScore, -30);
approx("average bid stays available as raw tricks", anne?.averageBid ?? -1, 1);
approx("bid appetite is a share of the hand", anne?.bidAggression ?? -1, 0.75);
eq("rounds played are counted", anne?.roundsPlayed, 4);
approx("points per round divides by rounds, not games", anne?.pointsPerRound ?? 0, 17.5);
approx("average table size records the seats faced", anne?.averageTableSize ?? -1, 3);
eq("last-place finishes are counted", cal?.lastPlaces, 2);
approx("last-place rate is a fraction of games", cal?.lastPlaceRate ?? -1, 2 / 3);
eq("a bonus-free crew banks no bonus points", anne?.bonusPoints, 0);
eq("zero-bid attempts accumulate", bea?.zeroBids.attempts, 3);

eq("worst final score holder", crew.records.worstFinalScore?.identity, "cal");
eq("worst final score value", crew.records.worstFinalScore?.score, -30);
eq("worst final score game", crew.records.worstFinalScore?.gameId, "crew_g1");
eq("biggest round holder", crew.records.biggestRound?.identity, "anne");
eq("biggest round score", crew.records.biggestRound?.score, 40);
eq("biggest round retains its number", crew.records.biggestRound?.roundNumber, 2);
eq("longest streak holder", crew.records.longestStreak?.identity, "anne");
eq("longest streak length", crew.records.longestStreak?.streak, 2);
eq("last-place record holder", crew.records.mostLastPlaces?.identity, "cal");
eq("last-place record count", crew.records.mostLastPlaces?.count, 2);
eq("last-place record shows the games behind it", crew.records.mostLastPlaces?.outOf, 3);
eq("zero-bid master needs a real sample", crew.records.zeroBidMaster?.identity, "bea");
eq("zero-bid master attempts", crew.records.zeroBidMaster?.attempts, MIN_ZERO_BIDS);
eq(
  "a short crew history leaves rate records unclaimed",
  crew.records.bestExactBidRate,
  null
);
eq("a bonus-free crew leaves the haul unclaimed", crew.records.biggestBonusHaul, null);

// A comeback is measured against the halfway standings, so the winner has to
// have actually been behind at the turn.
const comeback = fixtureGame(
  "comeback",
  1900,
  [
    { id: "come_a", name: "Ada" },
    { id: "come_b", name: "Ben" },
    { id: "come_c", name: "Cass" },
  ],
  [
    { come_a: E(1, 1), come_b: E(0, 0), come_c: E(1, 0) },
    { come_a: E(2, 2), come_b: E(0, 0), come_c: E(2, 0) },
    { come_a: E(3, 0), come_b: E(0, 0), come_c: E(3, 3) },
    { come_a: E(4, 0), come_b: E(0, 0), come_c: E(4, 4) },
  ],
  { cardsDealt: [1, 2, 3, 4] }
);
const comebackRecord = aggregateStats([comeback]).records.biggestComeback;
eq("comeback holder climbed from the back", comebackRecord?.identity, "cass");
eq("comeback counts places gained", comebackRecord?.placesGained, 2);
eq("comeback keeps the halfway rank", comebackRecord?.fromRank, 3);
eq("comeback keeps the final rank", comebackRecord?.toRank, 1);
eq("comeback names its game", comebackRecord?.gameId, "comeback");
eq(
  "a game nobody climbed in leaves no comeback",
  aggregateStats([crewTwo]).records.biggestComeback,
  null
);

// Bonus points are every scoring line except the bid, so only special cards
// move them.
const treasure = fixtureGame(
  "treasure",
  2000,
  [
    { id: "gold_a", name: "Gilda" },
    { id: "gold_b", name: "Hook" },
  ],
  [{ gold_a: E(1, 1, { black14: true, colored14: 2 }), gold_b: E(0, 0) }],
  { cardsDealt: [1] }
);
const treasureStats = aggregateStats([treasure]);
eq(
  "bonus points collect every special-card line",
  treasureStats.players.find((player) => player.identity === "gilda")?.bonusPoints,
  40
);
eq("richest haul holder", treasureStats.records.biggestBonusHaul?.identity, "gilda");
eq("richest haul counts only the bonus", treasureStats.records.biggestBonusHaul?.score, 40);
eq("richest haul names its game", treasureStats.records.biggestBonusHaul?.gameId, "treasure");

// Everyone level means everyone won; nobody trailed, so nobody finished last.
const allSquare = fixtureGame(
  "all_square",
  2050,
  [
    { id: "square_a", name: "Even A" },
    { id: "square_b", name: "Even B" },
  ],
  [{ square_a: E(0, 0), square_b: E(0, 0) }],
  { cardsDealt: [1] }
);
const squareStats = aggregateStats([allSquare]);
eq(
  "a drawn game hands nobody a last place",
  squareStats.players.every((player) => player.lastPlaces === 0),
  true
);
eq(
  "drawing with someone is not beating them",
  squareStats.players.every((player) => player.rivalsBeaten === 0),
  true
);
eq("a drawn game leaves the last-place record unclaimed", squareStats.records.mostLastPlaces, null);

const emptyExtended = aggregateStats([]);
eq("empty input has no summary games", emptyExtended.summary.totalGames, 0);
eq("empty input has no plunder", emptyExtended.summary.totalPlunder, 0);
eq("empty input has no players", emptyExtended.summary.totalPlayers, 0);
eq("empty input has no biggest round", emptyExtended.records.biggestRound, null);
eq("empty input has no worst final score", emptyExtended.records.worstFinalScore, null);
eq("empty input has no streak record", emptyExtended.records.longestStreak, null);
eq("empty input has no last-place record", emptyExtended.records.mostLastPlaces, null);
eq("empty input has no comeback", emptyExtended.records.biggestComeback, null);
eq("empty input has no bonus haul", emptyExtended.records.biggestBonusHaul, null);
eq("empty input has no boldest bidder", emptyExtended.records.boldestBidder, null);
eq("empty input has no zero-bid master", emptyExtended.records.zeroBidMaster, null);

section("Game duration");
const MINUTE = 60_000;
function timedGame(
  createdAt: number,
  finishedAt: number | null,
  status: Game["status"] = "finished"
): Game {
  const value = fixtureGame(
    "timed",
    createdAt,
    [
      { id: "timed_a", name: "Timed A" },
      { id: "timed_b", name: "Timed B" },
    ],
    [{ timed_a: E(1, 1), timed_b: E(0, 1) }],
    { status, createdAt }
  );
  value.finishedAt = finishedAt;
  return value;
}

deepEq(
  "hours and minutes split",
  gameDuration(timedGame(0, 90 * MINUTE)),
  { hours: 1, minutes: 30 }
);
deepEq(
  "sub-hour games report only minutes",
  gameDuration(timedGame(0, 45 * MINUTE)),
  { hours: 0, minutes: 45 }
);
deepEq(
  "duration is measured from the first deal",
  gameDuration(timedGame(10 * MINUTE, 70 * MINUTE)),
  { hours: 1, minutes: 0 }
);
deepEq(
  "seconds round to the nearest minute",
  gameDuration(timedGame(0, 20_000)),
  { hours: 0, minutes: 0 }
);
eq(
  "in-progress games have no duration",
  gameDuration(timedGame(0, null, "in_progress")),
  null
);
eq(
  "pre-v8 finished saves have no duration",
  gameDuration(timedGame(0, null)),
  null
);
eq(
  "a finish before the deal is rejected",
  gameDuration(timedGame(90 * MINUTE, 10 * MINUTE)),
  null
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
