import {
  BonusInput,
  Game,
  LootUse,
  Player,
  RoundEntries,
  RoundEntry,
} from "./types";

/**
 * Skull King scoring — Grandpa Beck's 2022 rules ("Les scores selon Skull King").
 *
 * Bid scoring (per round):
 *   - Bid >= 1, hit exactly:        +20 per trick won  (20 x bid)
 *   - Bid >= 1, missed (over/under): -10 per trick of difference, no points for tricks
 *   - Bid 0, won 0 tricks:          +10 x cards dealt this round
 *   - Bid 0, won >= 1 trick:        -10 x cards dealt this round
 *
 * Bonus points (capturing special cards) are added REGARDLESS of bid accuracy:
 *   - colored 14 (yellow/purple/green): +10 each
 *   - black 14 (Jolly Roger / trump):   +20
 *   - mermaid captured by a pirate:     +20 each
 *   - pirate captured by Skull King:    +30 each
 *   - mermaid captures the Skull King:  +40
 *   - leviathan destroyed by Davy Jones: +20 each
 *   - Second captured by Skull King / Mermaid: +30
 * Bonuses go to whoever CAPTURES the card (wins the trick containing it),
 * no matter who played it.
 *
 * Conditional extras:
 *   - Loot/Butin alliance: +20 to both linked players, but only when both make
 *     their exact bids. Alliances are stored at round level so this is checked
 *     rather than entered as a pre-calculated per-player count.
 *   - Rascal pirate wager (0/10/20): +wager if the bid is hit, -wager if missed.
 *   - Expansion 7 / 8: -5 / +5 to their captor only when the bid is hit.
 */

export const BONUS_VALUES = {
  colored14: 10,
  black14: 20,
  mermaidByPirate: 20,
  pirateBySkullKing: 30,
  mermaidCapturesSkullKing: 40,
  expansion7: -5,
  expansion8: 5,
  davyJonesLeviathan: 20,
  secondCaptured: 30,
  loot: 20,
} as const;

export type ScoreBreakdownKey =
  | "bid"
  | "colored14"
  | "black14"
  | "mermaidByPirate"
  | "pirateBySkullKing"
  | "mermaidCapturesSkullKing"
  | "rascalWager"
  | "expansion7"
  | "expansion8"
  | "davyJonesLeviathans"
  | "secondCaptured"
  | "legacyLoot"
  | "loot"
  | "lootSelfWin";

/** One auditable contribution to a round score. */
export interface ScoreBreakdownItem {
  key: ScoreBreakdownKey;
  /** Number of cards, alliances, or wagers represented by this line. */
  count: number;
  points: number;
  /** False when the item was recorded but the scoring condition was not met. */
  applied: boolean;
}

/** The exact inputs and score contributions for one player in one round. */
export interface RoundScoreBreakdown {
  cardsDealt: number;
  bid: number;
  tricks: number;
  madeBid: boolean;
  items: ScoreBreakdownItem[];
  total: number;
}

/** A recorded round plus the player's running total after that round. */
export interface PlayerRoundScoreBreakdown extends RoundScoreBreakdown {
  roundNumber: number;
  runningTotal: number;
}

/** A player makes their bid when tricks won equals the bid (works for 0 too). */
export function madeBid(entry: RoundEntry): boolean {
  return entry.bid === entry.tricks;
}

/** Points from the bid alone (no bonuses). */
export function bidScore(cardsDealt: number, entry: RoundEntry): number {
  if (entry.bid === 0) {
    return madeBid(entry) ? 10 * cardsDealt : -10 * cardsDealt;
  }
  return madeBid(entry)
    ? 20 * entry.bid
    : -10 * Math.abs(entry.tricks - entry.bid);
}

/** Points from captured special cards (always counted). */
export function captureBonus(b: BonusInput): number {
  return (
    b.colored14 * BONUS_VALUES.colored14 +
    (b.black14 ? BONUS_VALUES.black14 : 0) +
    b.mermaidByPirate * BONUS_VALUES.mermaidByPirate +
    b.pirateBySkullKing * BONUS_VALUES.pirateBySkullKing +
    (b.mermaidCapturesSkullKing ? BONUS_VALUES.mermaidCapturesSkullKing : 0) +
    b.davyJonesLeviathans * BONUS_VALUES.davyJonesLeviathan +
    (b.secondCaptured ? BONUS_VALUES.secondCaptured : 0)
  );
}

/** Conditional points from the expansion's extra 7 and 8 cards. */
export function expansionColorBonus(
  bonus: BonusInput,
  bidMade: boolean
): number {
  if (!bidMade) return 0;
  return (
    bonus.expansion7 * BONUS_VALUES.expansion7 +
    bonus.expansion8 * BONUS_VALUES.expansion8
  );
}

/** Rascal and migrated Loot extras, which depend on bid accuracy. */
export function conditionalBonus(entry: RoundEntry): number {
  const made = madeBid(entry);
  const legacyLoot = made
    ? (entry.legacyLoot ?? 0) * BONUS_VALUES.loot
    : 0;
  const rascal =
    entry.bonus.rascalWager > 0
      ? made
        ? entry.bonus.rascalWager
        : -entry.bonus.rascalWager
      : 0;
  return legacyLoot + rascal + expansionColorBonus(entry.bonus, made);
}

/** Whether a recorded Loot alliance satisfies the exact-bid requirement. */
export function lootAllianceSucceeded(
  entries: RoundEntries,
  lootUse: LootUse
): boolean {
  if (
    lootUse.playedById === null ||
    lootUse.boundToId === null ||
    lootUse.playedById === lootUse.boundToId ||
    !entries[lootUse.playedById] ||
    !entries[lootUse.boundToId]
  ) {
    return false;
  }
  return (
    madeBid(entries[lootUse.playedById]) &&
    madeBid(entries[lootUse.boundToId])
  );
}

/** Verified Loot points earned by one player from all alliances in a round. */
export function lootBonusForPlayer(
  entries: RoundEntries,
  lootUses: LootUse[],
  playerId: string
): number {
  return lootUses.reduce((points, lootUse) => {
    const isParticipant =
      lootUse.playedById === playerId || lootUse.boundToId === playerId;
    return isParticipant && lootAllianceSucceeded(entries, lootUse)
      ? points + BONUS_VALUES.loot
      : points;
  }, 0);
}

/**
 * Recorded Loot events involving a player. Incomplete pairings cannot belong
 * to a scored round, while self-wins are kept to explain why no bonus applied.
 */
function lootEventsForPlayer(
  lootUses: LootUse[],
  playerId: string
): { alliances: number; selfWins: number } {
  return lootUses.reduce(
    (counts, lootUse) => {
      const completeAlliance =
        lootUse.playedById !== null &&
        lootUse.boundToId !== null &&
        lootUse.playedById !== lootUse.boundToId;
      const isParticipant =
        lootUse.playedById === playerId || lootUse.boundToId === playerId;
      if (completeAlliance && isParticipant) counts.alliances += 1;
      if (
        lootUse.playedById === playerId &&
        lootUse.boundToId === playerId
      ) {
        counts.selfWins += 1;
      }
      return counts;
    },
    { alliances: 0, selfWins: 0 }
  );
}

/**
 * Fully itemized score for one round.
 *
 * `lootAttempts` lets history views surface failed alliances as explicit
 * zero-point lines. Callers that only have a verified Loot total can omit it.
 */
export function scoreRoundBreakdown(
  cardsDealt: number,
  entry: RoundEntry,
  lootBonus = 0,
  lootAttempts = Math.floor(lootBonus / BONUS_VALUES.loot),
  lootSelfWins = 0
): RoundScoreBreakdown {
  const exact = madeBid(entry);
  const items: ScoreBreakdownItem[] = [
    {
      key: "bid",
      count: entry.bid,
      points: bidScore(cardsDealt, entry),
      applied: true,
    },
  ];

  const add = (
    key: ScoreBreakdownKey,
    count: number,
    points: number,
    applied = true
  ) => {
    if (count <= 0) return;
    items.push({ key, count, points, applied });
  };

  const b = entry.bonus;
  add("colored14", b.colored14, b.colored14 * BONUS_VALUES.colored14);
  add("black14", b.black14 ? 1 : 0, b.black14 ? BONUS_VALUES.black14 : 0);
  add(
    "mermaidByPirate",
    b.mermaidByPirate,
    b.mermaidByPirate * BONUS_VALUES.mermaidByPirate
  );
  add(
    "pirateBySkullKing",
    b.pirateBySkullKing,
    b.pirateBySkullKing * BONUS_VALUES.pirateBySkullKing
  );
  add(
    "mermaidCapturesSkullKing",
    b.mermaidCapturesSkullKing ? 1 : 0,
    b.mermaidCapturesSkullKing
      ? BONUS_VALUES.mermaidCapturesSkullKing
      : 0
  );
  add(
    "davyJonesLeviathans",
    b.davyJonesLeviathans,
    b.davyJonesLeviathans * BONUS_VALUES.davyJonesLeviathan
  );
  add(
    "secondCaptured",
    b.secondCaptured ? 1 : 0,
    b.secondCaptured ? BONUS_VALUES.secondCaptured : 0
  );

  if (b.rascalWager > 0) {
    add(
      "rascalWager",
      1,
      exact ? b.rascalWager : -b.rascalWager
    );
  }
  add(
    "expansion7",
    b.expansion7,
    exact ? b.expansion7 * BONUS_VALUES.expansion7 : 0,
    exact
  );
  add(
    "expansion8",
    b.expansion8,
    exact ? b.expansion8 * BONUS_VALUES.expansion8 : 0,
    exact
  );
  add(
    "legacyLoot",
    entry.legacyLoot ?? 0,
    exact ? (entry.legacyLoot ?? 0) * BONUS_VALUES.loot : 0,
    exact
  );

  const successfulLoot = Math.floor(lootBonus / BONUS_VALUES.loot);
  add("loot", successfulLoot, lootBonus);
  add("loot", Math.max(0, lootAttempts - successfulLoot), 0, false);
  add("lootSelfWin", lootSelfWins, 0, false);

  return {
    cardsDealt,
    bid: entry.bid,
    tricks: entry.tricks,
    madeBid: exact,
    items,
    total: items.reduce((sum, item) => sum + item.points, 0),
  };
}

/** Total points for a single player's round, including verified Loot points. */
export function scoreRound(
  cardsDealt: number,
  entry: RoundEntry,
  lootBonus = 0
): number {
  return scoreRoundBreakdown(cardsDealt, entry, lootBonus).total;
}

/** Cards dealt for a given 1-based round (defaults to the round number). */
export function cardsForRound(game: Game, roundNumber: number): number {
  return game.cardsDealt[roundNumber - 1] ?? roundNumber;
}

/**
 * Tricks captured by the non-scoring "Greybeard" ghost in the 2-player variant.
 *
 * Greybeard plays a third hand and wins some tricks without scoring, so the two
 * real players' tricks may sum to fewer than the cards dealt — the ghost took
 * the rest. Returns 0 outside 2-player mode, and clamps at 0 (a player total
 * above the cards dealt is impossible, so the ghost never owes tricks).
 */
export function ghostTricks(
  game: Game,
  playerTricksTotal: number,
  cards: number,
  discardedTricks = 0
): number {
  if (!game.twoPlayerGhost) return 0;
  return Math.max(0, cards - playerTricksTotal - discardedTricks);
}

/** Itemized history of every recorded round for one player. */
export function playerScoreHistory(
  game: Game,
  playerId: string,
  uptoRound: number = game.totalRounds
): PlayerRoundScoreBreakdown[] {
  const history: PlayerRoundScoreBreakdown[] = [];
  let runningTotal = 0;
  for (let r = 1; r <= uptoRound && r <= game.totalRounds; r++) {
    const entry = game.rounds[r - 1]?.[playerId];
    if (entry && entry.recorded) {
      const round = game.rounds[r - 1];
      const activeLootUses =
        game.advancedCards && game.players.length > 2
          ? (game.lootUses[r - 1] ?? [])
          : [];
      const loot = lootBonusForPlayer(
        round,
        activeLootUses,
        playerId
      );
      const lootEvents = lootEventsForPlayer(activeLootUses, playerId);
      const breakdown = scoreRoundBreakdown(
        cardsForRound(game, r),
        entry,
        loot,
        lootEvents.alliances,
        lootEvents.selfWins
      );
      runningTotal += breakdown.total;
      history.push({ ...breakdown, roundNumber: r, runningTotal });
    }
  }
  return history;
}

/** Running total for a player up to and including `uptoRound` (1-based). */
export function playerTotal(
  game: Game,
  playerId: string,
  uptoRound: number = game.totalRounds
): number {
  const history = playerScoreHistory(game, playerId, uptoRound);
  return history.length > 0 ? history[history.length - 1].runningTotal : 0;
}

export interface Standing {
  player: Player;
  total: number;
  rank: number;
}

/** Players sorted high-to-low by total, with ranks (ties share a rank). */
export function standings(
  game: Game,
  uptoRound: number = game.totalRounds
): Standing[] {
  const rows = game.players
    .map((player) => ({
      player,
      total: playerTotal(game, player.id, uptoRound),
      rank: 0,
    }))
    .sort((a, b) => b.total - a.total);

  let lastTotal: number | null = null;
  let lastRank = 0;
  rows.forEach((row, i) => {
    if (lastTotal === null || row.total !== lastTotal) {
      lastRank = i + 1;
      lastTotal = row.total;
    }
    row.rank = lastRank;
  });

  return rows;
}

/** True if every player has a recorded entry for the given round. */
export function isRoundComplete(game: Game, roundNumber: number): boolean {
  const round = game.rounds[roundNumber - 1];
  if (!round) return false;
  return game.players.every((p) => round[p.id]?.recorded);
}

// --- factories -------------------------------------------------------------

export function emptyBonus(): BonusInput {
  return {
    colored14: 0,
    black14: false,
    mermaidByPirate: 0,
    pirateBySkullKing: 0,
    mermaidCapturesSkullKing: false,
    rascalWager: 0,
    expansion7: 0,
    expansion8: 0,
    davyJonesLeviathans: 0,
    secondCaptured: false,
  };
}

export function emptyEntry(): RoundEntry {
  return {
    bid: 0,
    tricks: 0,
    bonus: emptyBonus(),
    legacyLoot: 0,
    recorded: false,
  };
}

function emptyRound(players: Player[]): RoundEntries {
  const round: RoundEntries = {};
  for (const p of players) round[p.id] = emptyEntry();
  return round;
}

export function createGame(
  players: Player[],
  totalRounds = 10,
  advancedCards = true,
  twoPlayerGhost = false,
  newExpansion = true,
  /**
   * Cards dealt in each round, for the rulebook's alternate round structures
   * ("Pas d'impair", "Prêt au combat", ...). When provided, its length wins
   * over `totalRounds`. Defaults to the classic 1, 2, ... `totalRounds`.
   */
  cardsPerRound?: number[]
): Game {
  const now = Date.now();
  // An empty structure would create a game with zero rounds but a
  // currentRound of 1; fall back to the classic structure instead.
  const structure =
    cardsPerRound && cardsPerRound.length > 0 ? cardsPerRound : undefined;
  const roundCount = structure?.length ?? totalRounds;
  return {
    id: `game_${now}`,
    players,
    totalRounds: roundCount,
    currentRound: 1,
    rounds: Array.from({ length: roundCount }, () => emptyRound(players)),
    lootUses: Array.from({ length: roundCount }, () => []),
    discardedTricks: Array.from({ length: roundCount }, () => 0),
    cardsDealt: structure
      ? [...structure]
      : Array.from({ length: roundCount }, (_, i) => i + 1),
    advancedCards,
    newExpansion,
    twoPlayerGhost,
    status: "in_progress",
    createdAt: now,
    updatedAt: now,
  };
}
