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

/** Total points for a single player's round, including verified Loot points. */
export function scoreRound(
  cardsDealt: number,
  entry: RoundEntry,
  lootBonus = 0
): number {
  return (
    bidScore(cardsDealt, entry) +
    captureBonus(entry.bonus) +
    conditionalBonus(entry) +
    lootBonus
  );
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
  cards: number
): number {
  if (!game.twoPlayerGhost) return 0;
  return Math.max(0, cards - playerTricksTotal);
}

/** Running total for a player up to and including `uptoRound` (1-based). */
export function playerTotal(
  game: Game,
  playerId: string,
  uptoRound: number = game.totalRounds
): number {
  let total = 0;
  for (let r = 1; r <= uptoRound && r <= game.totalRounds; r++) {
    const entry = game.rounds[r - 1]?.[playerId];
    if (entry && entry.recorded) {
      const round = game.rounds[r - 1];
      const loot = lootBonusForPlayer(
        round,
        game.advancedCards && game.players.length > 2
          ? (game.lootUses[r - 1] ?? [])
          : [],
        playerId
      );
      total += scoreRound(cardsForRound(game, r), entry, loot);
    }
  }
  return total;
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
  newExpansion = true
): Game {
  const now = Date.now();
  return {
    id: `game_${now}`,
    players,
    totalRounds,
    currentRound: 1,
    rounds: Array.from({ length: totalRounds }, () => emptyRound(players)),
    lootUses: Array.from({ length: totalRounds }, () => []),
    cardsDealt: Array.from({ length: totalRounds }, (_, i) => i + 1),
    advancedCards,
    newExpansion,
    twoPlayerGhost,
    status: "in_progress",
    createdAt: now,
    updatedAt: now,
  };
}
