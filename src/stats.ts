import {
  PlayerRoundScoreBreakdown,
  playerScoreHistory,
  standings,
} from "./scoring";
import { Game, Player } from "./types";

/**
 * Recorded rounds a player needs before a per-round record (exact-bid rate,
 * bid appetite) names them. One classic ten-round game clears it, and it stops
 * a single lucky round from outranking a whole season of play.
 */
export const MIN_RATED_ROUNDS = 10;

/**
 * Zero bids a player needs before the zero-bid record names them. Zero bids
 * are far rarer than ordinary rounds, so the bar is lower.
 */
export const MIN_ZERO_BIDS = 3;

export interface Rate {
  successes: number;
  attempts: number;
  rate: number | null;
}

export interface RecentPlayerGame {
  gameId: string;
  playedAt: number;
  playerId: string;
  finalScore: number;
  rank: number;
  won: boolean;
}

export interface PlayerStats {
  identity: string;
  name: string;
  lastPlayedAt: number;
  gamesPlayed: number;
  /** Recorded rounds actually played — the denominator of every round rate. */
  roundsPlayed: number;
  wins: number;
  winRate: number;
  exactBids: Rate;
  zeroBids: Rate;
  averagePoints: number;
  /** Mean points per recorded round, comparable across game lengths. */
  pointsPerRound: number;
  bestFinalScore: number | null;
  /** Lowest final score this player has ever posted. */
  worstFinalScore: number | null;
  currentWinStreak: number;
  /** Longest run of consecutive wins ever, not just the current one. */
  longestWinStreak: number;
  /**
   * Mean share of opponents finished ahead of, 0-1. A podium rate says almost
   * nothing at a three-seat table, where everybody is on it; this asks the
   * same question in a way that compares across table sizes.
   */
  rivalsBeaten: number;
  /** Mean finishing position (1 = winner); lower is better. */
  averageRank: number;
  /** Mean seats at the tables played, so an average rank can be read. */
  averageTableSize: number;
  /** Games finished behind every opponent, and their share of games played. */
  lastPlaces: number;
  lastPlaceRate: number;
  /** Highest single-round score this player has ever posted. */
  bestRound: number | null;
  /** Lowest single-round score this player has ever posted. */
  worstRound: number | null;
  /** Mean tricks bid per recorded round. */
  averageBid: number;
  /**
   * Mean share of the dealt hand bid for, 0-1. Unlike a raw bid average this
   * compares fairly between a one-card round and a ten-card one.
   */
  bidAggression: number;
  /** Net points won from special cards, i.e. every scoring line but the bid. */
  bonusPoints: number;
  recentGames: RecentPlayerGame[];
}

export interface FinalScoreRecord {
  identity: string;
  name: string;
  score: number;
  gameId: string;
  playedAt: number;
}

export interface RoundScoreRecord extends FinalScoreRecord {
  roundNumber: number;
}

export interface ExactBidRecord {
  identity: string;
  name: string;
  rate: number;
  successes: number;
  attempts: number;
}

/** A holder plus their longest run of consecutive wins. */
export interface StreakRecord {
  identity: string;
  name: string;
  streak: number;
}

/** A holder plus how much of every hand they claim when bidding. */
export interface BidAppetiteRecord {
  identity: string;
  name: string;
  /** Mean share of the dealt hand bid for, 0-1. */
  aggression: number;
  /** The same appetite expressed as raw tricks bid per round. */
  averageBid: number;
  /** Rounds behind the average, so the card can show its sample. */
  roundsPlayed: number;
}

/** A holder plus a tally and the games that tally came out of. */
export interface CountRecord {
  identity: string;
  name: string;
  count: number;
  /** Games played, so a raw tally can be read as a share. */
  outOf: number;
}

/** The biggest climb between the halfway standings and the final ones. */
export interface ComebackRecord {
  identity: string;
  name: string;
  placesGained: number;
  /** Rank at the halfway point, and the rank it turned into. */
  fromRank: number;
  toRank: number;
  gameId: string;
  playedAt: number;
}

export interface GroupRecords {
  bestFinalScore: FinalScoreRecord | null;
  /** Lowest score anyone has ever finished a game with. */
  worstFinalScore: FinalScoreRecord | null;
  worstRound: RoundScoreRecord | null;
  /** Best exact-bid rate over at least MIN_RATED_ROUNDS rounds. */
  bestExactBidRate: ExactBidRecord | null;
  /** Highest single-round haul anyone has ever scored. */
  biggestRound: RoundScoreRecord | null;
  /** Longest historical winning streak across the crew. */
  longestStreak: StreakRecord | null;
  /** Most places climbed after the halfway point of one game. */
  biggestComeback: ComebackRecord | null;
  /** Most special-card points banked in one game; `score` is that haul. */
  biggestBonusHaul: FinalScoreRecord | null;
  /** Biggest share of the hand claimed, over at least MIN_RATED_ROUNDS. */
  boldestBidder: BidAppetiteRecord | null;
  /** Most games finished behind every opponent at the table. */
  mostLastPlaces: CountRecord | null;
  /** Best zero-bid success rate over at least MIN_ZERO_BIDS zero bids. */
  zeroBidMaster: ExactBidRecord | null;
}

/** Crew-wide totals shown at the top of the stats screen. */
export interface StatsSummary {
  /** Finished games on record. */
  totalGames: number;
  /** Rounds actually scored across every finished game. */
  totalRounds: number;
  /** Sum of every player's final score across every finished game. */
  totalPlunder: number;
  /** Distinct players who appear in at least one finished game. */
  totalPlayers: number;
}

export interface StatsSnapshot {
  players: PlayerStats[];
  records: GroupRecords;
  summary: StatsSummary;
}

/** How long a finished game took, already split for display. */
export interface GameDuration {
  hours: number;
  minutes: number;
}

export interface ScorePoint {
  roundNumber: number;
  total: number;
}

export interface PlayerScoreSeries {
  playerId: string;
  name: string;
  points: ScorePoint[];
}

export type AwardKind =
  | "lookout"
  | "zeroBidRoyalty"
  | "comeback"
  | "reckless"
  | "castaway";

export interface GameAward {
  kind: AwardKind;
  playerId: string;
  playerName: string;
  value: number;
  finalScore: number;
}

interface PlayerBucket {
  identity: string;
  name: string;
  lastPlayedAt: number;
  gamesPlayed: number;
  roundsPlayed: number;
  wins: number;
  exactSuccesses: number;
  exactAttempts: number;
  zeroSuccesses: number;
  zeroAttempts: number;
  totalPoints: number;
  bonusPoints: number;
  bestFinalScore: number | null;
  worstFinalScore: number | null;
  rivalShareSum: number;
  rivalGames: number;
  rankSum: number;
  seatSum: number;
  lastPlaces: number;
  bestRound: number | null;
  worstRound: number | null;
  bidSum: number;
  aggressionSum: number;
  recentGames: RecentPlayerGame[];
}

interface FinalRecordCandidate extends FinalScoreRecord {
  playerId: string;
}

interface RoundRecordCandidate extends RoundScoreRecord {
  playerId: string;
}

interface ComebackCandidate extends ComebackRecord {
  playerId: string;
}

interface AwardCandidate {
  player: Player;
  value: number;
  finalScore: number;
}

/** The stable cross-game identity derived from a player-facing name. */
export function normalizePlayerName(name: string): string {
  if (typeof name !== "string") return "";
  return name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function finiteNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function playedAt(game: Game): number {
  return finiteNumber(game.updatedAt, finiteNumber(game.createdAt));
}

function compareText(a: string, b: string): number {
  return a === b ? 0 : a < b ? -1 : 1;
}

function validPlayers(game: Game): Player[] {
  if (!Array.isArray(game.players)) return [];
  return game.players.filter(
    (player): player is Player =>
      player !== null &&
      typeof player === "object" &&
      typeof player.id === "string" &&
      typeof player.name === "string"
  );
}

/**
 * Scoring normally receives values returned by normalizeGame. Keeping a
 * shallow defensive view here also makes aggregation safe for short legacy or
 * hand-built fixtures without changing the persisted source value.
 */
function defensiveGame(game: Game): Game {
  const rounds = Array.isArray(game.rounds) ? game.rounds : [];
  const rawRoundCount = finiteNumber(game.totalRounds, rounds.length);
  return {
    ...game,
    players: validPlayers(game),
    totalRounds: Math.max(0, Math.floor(rawRoundCount)),
    rounds,
    lootUses: Array.isArray(game.lootUses) ? game.lootUses : [],
    discardedTricks: Array.isArray(game.discardedTricks)
      ? game.discardedTricks
      : [],
    krakenTricks: Array.isArray(game.krakenTricks) ? game.krakenTricks : [],
    cardsDealt: Array.isArray(game.cardsDealt) ? game.cardsDealt : [],
  };
}

function compareGamesNewest(a: Game, b: Game): number {
  const activityDifference = playedAt(b) - playedAt(a);
  if (activityDifference !== 0) return activityDifference;

  const creationDifference =
    finiteNumber(b.createdAt) - finiteNumber(a.createdAt);
  if (creationDifference !== 0) return creationDifference;

  return compareText(String(a.id ?? ""), String(b.id ?? ""));
}

function safeHistory(game: Game, playerId: string) {
  try {
    return playerScoreHistory(game, playerId);
  } catch {
    return [];
  }
}

function safeStandings(game: Game, uptoRound = game.totalRounds) {
  try {
    return standings(game, uptoRound);
  } catch {
    return [];
  }
}

function toRate(successes: number, attempts: number): Rate {
  return {
    successes,
    attempts,
    rate: attempts > 0 ? successes / attempts : null,
  };
}

/**
 * Wall-clock time between the first deal and the last recorded round, or null
 * when the game never finished or was saved before finish times were stamped.
 * Rounded to the nearest minute, which is all the results screen shows.
 */
export function gameDuration(game: Game): GameDuration | null {
  if (game?.status !== "finished") return null;

  const start = finiteNumber(game.createdAt, NaN);
  const end = finiteNumber(game.finishedAt, NaN);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return null;
  }

  const totalMinutes = Math.round((end - start) / 60_000);
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

/** Cumulative, sparse score histories for every real player in one game. */
export function cumulativeScoreSeries(game: Game): PlayerScoreSeries[] {
  const safeGame = defensiveGame(game);
  return safeGame.players.map((player) => ({
    playerId: player.id,
    name: player.name,
    points: safeHistory(safeGame, player.id).map((round) => ({
      roundNumber: round.roundNumber,
      total: round.runningTotal,
    })),
  }));
}

/** Known names in newest-use order for setup autocomplete. */
export function playerNameSuggestions(
  games: readonly Game[],
  excludedNames: readonly string[] = []
): string[] {
  const excluded = new Set(
    excludedNames
      .map(normalizePlayerName)
      .filter((identity) => identity.length > 0)
  );
  const seen = new Set<string>();
  const suggestions: string[] = [];
  const newestFirst = [...games].sort(compareGamesNewest);

  for (const game of newestFirst) {
    for (const player of validPlayers(game)) {
      const identity = normalizePlayerName(player.name);
      if (!identity || excluded.has(identity) || seen.has(identity)) continue;
      seen.add(identity);
      suggestions.push(player.name);
    }
  }

  return suggestions;
}

function compareLeaderboard(a: PlayerStats, b: PlayerStats): number {
  if (a.wins !== b.wins) return b.wins - a.wins;
  if (a.winRate !== b.winRate) return b.winRate - a.winRate;
  if (a.gamesPlayed !== b.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
  if (a.lastPlayedAt !== b.lastPlayedAt) {
    return b.lastPlayedAt - a.lastPlayedAt;
  }
  return compareText(a.identity, b.identity);
}

/**
 * The single best element under `compare`, chosen in one pass.
 *
 * Every record comparator below defines a total order, so this returns exactly
 * what sorting the array and taking the first element would — without copying
 * or sorting a list that grows with every round ever played.
 */
function bestBy<T>(
  items: readonly T[],
  compare: (a: T, b: T) => number
): T | undefined {
  let best: T | undefined;
  for (const item of items) {
    if (best === undefined || compare(item, best) < 0) best = item;
  }
  return best;
}

/**
 * Tiebreak shared by every record: the most recent game wins, then stable
 * identifiers so the same input always names the same holder.
 */
function compareFinalTiebreak(
  a: FinalRecordCandidate,
  b: FinalRecordCandidate
): number {
  return (
    b.playedAt - a.playedAt ||
    compareText(a.identity, b.identity) ||
    compareText(a.gameId, b.gameId) ||
    compareText(a.playerId, b.playerId)
  );
}

/** As above, but a round record also disambiguates by round number. */
function compareRoundTiebreak(
  a: RoundRecordCandidate,
  b: RoundRecordCandidate
): number {
  return (
    b.playedAt - a.playedAt ||
    compareText(a.identity, b.identity) ||
    compareText(a.gameId, b.gameId) ||
    a.roundNumber - b.roundNumber ||
    compareText(a.playerId, b.playerId)
  );
}

const compareBestFinal = (a: FinalRecordCandidate, b: FinalRecordCandidate) =>
  b.score - a.score || compareFinalTiebreak(a, b);

const compareWorstFinal = (a: FinalRecordCandidate, b: FinalRecordCandidate) =>
  a.score - b.score || compareFinalTiebreak(a, b);

const compareBiggestRound = (a: RoundRecordCandidate, b: RoundRecordCandidate) =>
  b.score - a.score || compareRoundTiebreak(a, b);

const compareWorstRound = (a: RoundRecordCandidate, b: RoundRecordCandidate) =>
  a.score - b.score || compareRoundTiebreak(a, b);

const compareComeback = (a: ComebackCandidate, b: ComebackCandidate) =>
  b.placesGained - a.placesGained ||
  b.playedAt - a.playedAt ||
  compareText(a.identity, b.identity) ||
  compareText(a.gameId, b.gameId) ||
  compareText(a.playerId, b.playerId);

/**
 * Points a round won from special cards: every scoring line except the bid
 * itself. Lines that were recorded but did not apply already carry 0 points,
 * and a lost Rascal wager or a captured 7 legitimately counts against the
 * haul, so a plain sum is the honest total.
 */
function roundBonusPoints(round: PlayerRoundScoreBreakdown): number {
  return round.items.reduce(
    (sum, item) => (item.key === "bid" ? sum : sum + item.points),
    0
  );
}

/**
 * Share of the dealt hand a bid claims, 0-1. Rounds deal anywhere from one to
 * ten cards, so only this ratio compares bidding appetite fairly. Clamped
 * because a legacy save could hold a bid larger than the hand it was made on.
 */
function bidShare(round: PlayerRoundScoreBreakdown): number {
  if (round.cardsDealt <= 0) return 0;
  return Math.min(1, Math.max(0, round.bid / round.cardsDealt));
}

/**
 * Publish a record: drop the internal player id and show the display name the
 * leaderboard settled on, so one player never appears under two spellings.
 */
function toFinalRecord(
  candidate: FinalRecordCandidate | undefined,
  displayNames: ReadonlyMap<string, string>
): FinalScoreRecord | null {
  if (!candidate) return null;
  return {
    identity: candidate.identity,
    name: displayNames.get(candidate.identity) ?? candidate.name,
    score: candidate.score,
    gameId: candidate.gameId,
    playedAt: candidate.playedAt,
  };
}

function toRoundRecord(
  candidate: RoundRecordCandidate | undefined,
  displayNames: ReadonlyMap<string, string>
): RoundScoreRecord | null {
  const record = toFinalRecord(candidate, displayNames);
  if (!record || !candidate) return null;
  return { ...record, roundNumber: candidate.roundNumber };
}

/**
 * The player leading on `rank` — a descending key vector — among those the
 * `eligible` predicate admits. Ties fall through to the most recent player and
 * then to a stable identity, so a record never flickers between equals.
 */
function topPlayer(
  players: readonly PlayerStats[],
  eligible: (player: PlayerStats) => boolean,
  rank: (player: PlayerStats) => number[]
): PlayerStats | undefined {
  return bestBy(players.filter(eligible), (a, b) => {
    const keysA = rank(a);
    const keysB = rank(b);
    for (let index = 0; index < keysA.length; index++) {
      if (keysA[index] !== keysB[index]) return keysB[index] - keysA[index];
    }
    return (
      b.lastPlayedAt - a.lastPlayedAt || compareText(a.identity, b.identity)
    );
  });
}

/** Publish one of a player's success rates as a record, if they have one. */
function toRateRecord(
  player: PlayerStats | undefined,
  pick: (player: PlayerStats) => Rate
): ExactBidRecord | null {
  if (!player) return null;
  const { rate, successes, attempts } = pick(player);
  if (rate === null) return null;
  return {
    identity: player.identity,
    name: player.name,
    rate,
    successes,
    attempts,
  };
}

function currentStreak(games: RecentPlayerGame[]): number {
  let streak = 0;
  for (const game of games) {
    if (!game.won) break;
    streak += 1;
  }
  return streak;
}

/** Longest run of consecutive wins anywhere in a player's history. */
function longestStreak(games: RecentPlayerGame[]): number {
  let best = 0;
  let run = 0;
  for (const game of games) {
    run = game.won ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
}

/** Aggregate finished, recorded player appearances and group records. */
export function aggregateStats(games: readonly Game[]): StatsSnapshot {
  const finishedGames = [...games]
    .filter((game) => game?.status === "finished")
    .sort(compareGamesNewest)
    .map(defensiveGame);
  const buckets = new Map<string, PlayerBucket>();
  const finalCandidates: FinalRecordCandidate[] = [];
  const roundCandidates: RoundRecordCandidate[] = [];
  const bonusCandidates: FinalRecordCandidate[] = [];
  const comebackCandidates: ComebackCandidate[] = [];
  let totalRounds = 0;

  for (const game of finishedGames) {
    const gamePlayedAt = playedAt(game);
    const finalRows = safeStandings(game);
    const standingById = new Map(finalRows.map((row) => [row.player.id, row]));
    // Where everyone stood at the turn, so a climb can be measured against it.
    const halfwayById = new Map(
      safeStandings(game, Math.ceil(game.totalRounds / 2)).map((row) => [
        row.player.id,
        row,
      ])
    );
    // Last place is the worst rank at a table of at least two; ties for last
    // share it. An all-square finish has a single rank, and nobody trailed
    // anybody, so that game leaves no last place behind.
    const worstRank =
      finalRows.length >= 2
        ? Math.max(...finalRows.map((row) => row.rank))
        : null;
    const lastRank = worstRank !== null && worstRank > 1 ? worstRank : null;
    let gameRoundsPlayed = 0;

    for (const player of game.players) {
      const identity = normalizePlayerName(player.name);
      if (!identity) continue;

      const history = safeHistory(game, player.id);
      const finalStanding = standingById.get(player.id);
      // A zero-history seat must not turn a defensive all-zero tie into a
      // fabricated appearance, win, streak, or record.
      if (history.length === 0 || !finalStanding) continue;

      let bucket = buckets.get(identity);
      if (!bucket) {
        bucket = {
          identity,
          name: player.name,
          lastPlayedAt: gamePlayedAt,
          gamesPlayed: 0,
          roundsPlayed: 0,
          wins: 0,
          exactSuccesses: 0,
          exactAttempts: 0,
          zeroSuccesses: 0,
          zeroAttempts: 0,
          totalPoints: 0,
          bonusPoints: 0,
          bestFinalScore: null,
          worstFinalScore: null,
          rivalShareSum: 0,
          rivalGames: 0,
          rankSum: 0,
          seatSum: 0,
          lastPlaces: 0,
          bestRound: null,
          worstRound: null,
          bidSum: 0,
          aggressionSum: 0,
          recentGames: [],
        };
        buckets.set(identity, bucket);
      }

      const won = finalStanding.rank === 1;
      bucket.gamesPlayed += 1;
      bucket.wins += won ? 1 : 0;
      bucket.lastPlayedAt = Math.max(bucket.lastPlayedAt, gamePlayedAt);
      bucket.totalPoints += finalStanding.total;
      bucket.bestFinalScore =
        bucket.bestFinalScore === null
          ? finalStanding.total
          : Math.max(bucket.bestFinalScore, finalStanding.total);
      bucket.worstFinalScore =
        bucket.worstFinalScore === null
          ? finalStanding.total
          : Math.min(bucket.worstFinalScore, finalStanding.total);
      // "Ahead of" means strictly ahead, and tied players share one rank, so
      // the rank number is not a position to subtract from: count the seats
      // that actually finished behind. Drawing with someone beats nobody. A
      // solo seat has no rivals at all and stays out of the average entirely,
      // rather than counting as a shut-out either way.
      if (finalRows.length >= 2) {
        const beaten = finalRows.filter(
          (row) => row.rank > finalStanding.rank
        ).length;
        bucket.rivalShareSum += beaten / (finalRows.length - 1);
        bucket.rivalGames += 1;
      }
      bucket.rankSum += finalStanding.rank;
      bucket.seatSum += finalRows.length;
      if (lastRank !== null && finalStanding.rank === lastRank) {
        bucket.lastPlaces += 1;
      }
      const bestRoundThisGame = Math.max(
        ...history.map((round) => round.total)
      );
      bucket.bestRound =
        bucket.bestRound === null
          ? bestRoundThisGame
          : Math.max(bucket.bestRound, bestRoundThisGame);
      const worstRoundThisGame = Math.min(
        ...history.map((round) => round.total)
      );
      bucket.worstRound =
        bucket.worstRound === null
          ? worstRoundThisGame
          : Math.min(bucket.worstRound, worstRoundThisGame);
      bucket.bidSum += history.reduce((sum, round) => sum + round.bid, 0);
      bucket.aggressionSum += history.reduce(
        (sum, round) => sum + bidShare(round),
        0
      );
      const bonusThisGame = history.reduce(
        (sum, round) => sum + roundBonusPoints(round),
        0
      );
      bucket.bonusPoints += bonusThisGame;
      bucket.roundsPlayed += history.length;
      bucket.exactAttempts += history.length;
      bucket.exactSuccesses += history.filter((round) => round.madeBid).length;
      gameRoundsPlayed = Math.max(gameRoundsPlayed, history.length);

      const zeroRounds = history.filter((round) => round.bid === 0);
      bucket.zeroAttempts += zeroRounds.length;
      bucket.zeroSuccesses += zeroRounds.filter((round) => round.madeBid).length;
      bucket.recentGames.push({
        gameId: game.id,
        playedAt: gamePlayedAt,
        playerId: player.id,
        finalScore: finalStanding.total,
        rank: finalStanding.rank,
        won,
      });

      finalCandidates.push({
        identity,
        name: player.name,
        score: finalStanding.total,
        gameId: game.id,
        playedAt: gamePlayedAt,
        playerId: player.id,
      });
      // A table that never records special cards should leave the treasure
      // record unclaimed rather than crown a zero-point "haul".
      if (bonusThisGame > 0) {
        bonusCandidates.push({
          identity,
          name: player.name,
          score: bonusThisGame,
          gameId: game.id,
          playedAt: gamePlayedAt,
          playerId: player.id,
        });
      }
      const halfwayRank = halfwayById.get(player.id)?.rank ?? finalStanding.rank;
      if (halfwayRank > finalStanding.rank) {
        comebackCandidates.push({
          identity,
          name: player.name,
          placesGained: halfwayRank - finalStanding.rank,
          fromRank: halfwayRank,
          toRank: finalStanding.rank,
          gameId: game.id,
          playedAt: gamePlayedAt,
          playerId: player.id,
        });
      }
      for (const round of history) {
        roundCandidates.push({
          identity,
          name: player.name,
          score: round.total,
          gameId: game.id,
          playedAt: gamePlayedAt,
          roundNumber: round.roundNumber,
          playerId: player.id,
        });
      }
    }
    totalRounds += gameRoundsPlayed;
  }

  const players = [...buckets.values()]
    .map<PlayerStats>((bucket) => ({
      identity: bucket.identity,
      name: bucket.name,
      lastPlayedAt: bucket.lastPlayedAt,
      gamesPlayed: bucket.gamesPlayed,
      roundsPlayed: bucket.roundsPlayed,
      wins: bucket.wins,
      winRate: bucket.gamesPlayed > 0 ? bucket.wins / bucket.gamesPlayed : 0,
      exactBids: toRate(bucket.exactSuccesses, bucket.exactAttempts),
      zeroBids: toRate(bucket.zeroSuccesses, bucket.zeroAttempts),
      averagePoints:
        bucket.gamesPlayed > 0 ? bucket.totalPoints / bucket.gamesPlayed : 0,
      pointsPerRound:
        bucket.roundsPlayed > 0 ? bucket.totalPoints / bucket.roundsPlayed : 0,
      bestFinalScore: bucket.bestFinalScore,
      worstFinalScore: bucket.worstFinalScore,
      currentWinStreak: currentStreak(bucket.recentGames),
      longestWinStreak: longestStreak(bucket.recentGames),
      rivalsBeaten:
        bucket.rivalGames > 0 ? bucket.rivalShareSum / bucket.rivalGames : 0,
      averageRank:
        bucket.gamesPlayed > 0 ? bucket.rankSum / bucket.gamesPlayed : 0,
      averageTableSize:
        bucket.gamesPlayed > 0 ? bucket.seatSum / bucket.gamesPlayed : 0,
      lastPlaces: bucket.lastPlaces,
      lastPlaceRate:
        bucket.gamesPlayed > 0 ? bucket.lastPlaces / bucket.gamesPlayed : 0,
      bestRound: bucket.bestRound,
      worstRound: bucket.worstRound,
      averageBid:
        bucket.roundsPlayed > 0 ? bucket.bidSum / bucket.roundsPlayed : 0,
      bidAggression:
        bucket.roundsPlayed > 0 ? bucket.aggressionSum / bucket.roundsPlayed : 0,
      bonusPoints: bucket.bonusPoints,
      recentGames: [...bucket.recentGames],
    }))
    .sort(compareLeaderboard);
  const displayNameByIdentity = new Map(
    players.map((player) => [player.identity, player.name])
  );
  const totalPlunder = [...buckets.values()].reduce(
    (sum, bucket) => sum + bucket.totalPoints,
    0
  );

  // Every rate record waits for a real sample, so one lucky round can never
  // outrank a season of play. Below the bar the record stays unclaimed rather
  // than crowning a holder the number does not support.
  const bestExactPlayer = topPlayer(
    players,
    (player) =>
      player.exactBids.rate !== null &&
      player.exactBids.attempts >= MIN_RATED_ROUNDS,
    (player) => [player.exactBids.rate ?? -1, player.exactBids.attempts]
  );
  const streakLeader = topPlayer(
    players,
    (player) => player.longestWinStreak >= 2,
    (player) => [player.longestWinStreak]
  );
  const boldestLeader = topPlayer(
    players,
    (player) =>
      player.roundsPlayed >= MIN_RATED_ROUNDS && player.bidAggression > 0,
    (player) => [player.bidAggression, player.roundsPlayed]
  );
  const lastPlaceLeader = topPlayer(
    players,
    (player) => player.lastPlaces >= 1,
    (player) => [player.lastPlaces, player.lastPlaceRate]
  );
  const zeroMasterLeader = topPlayer(
    players,
    (player) =>
      player.zeroBids.rate !== null &&
      player.zeroBids.attempts >= MIN_ZERO_BIDS,
    (player) => [player.zeroBids.rate ?? -1, player.zeroBids.attempts]
  );
  const comebackLeader = bestBy(comebackCandidates, compareComeback);

  return {
    players,
    records: {
      bestFinalScore: toFinalRecord(
        bestBy(finalCandidates, compareBestFinal),
        displayNameByIdentity
      ),
      worstFinalScore: toFinalRecord(
        bestBy(finalCandidates, compareWorstFinal),
        displayNameByIdentity
      ),
      worstRound: toRoundRecord(
        bestBy(roundCandidates, compareWorstRound),
        displayNameByIdentity
      ),
      bestExactBidRate: toRateRecord(
        bestExactPlayer,
        (player) => player.exactBids
      ),
      biggestRound: toRoundRecord(
        bestBy(roundCandidates, compareBiggestRound),
        displayNameByIdentity
      ),
      longestStreak: streakLeader
        ? {
            identity: streakLeader.identity,
            name: streakLeader.name,
            streak: streakLeader.longestWinStreak,
          }
        : null,
      biggestComeback: comebackLeader
        ? {
            identity: comebackLeader.identity,
            name:
              displayNameByIdentity.get(comebackLeader.identity) ??
              comebackLeader.name,
            placesGained: comebackLeader.placesGained,
            fromRank: comebackLeader.fromRank,
            toRank: comebackLeader.toRank,
            gameId: comebackLeader.gameId,
            playedAt: comebackLeader.playedAt,
          }
        : null,
      biggestBonusHaul: toFinalRecord(
        bestBy(bonusCandidates, compareBestFinal),
        displayNameByIdentity
      ),
      boldestBidder: boldestLeader
        ? {
            identity: boldestLeader.identity,
            name: boldestLeader.name,
            aggression: boldestLeader.bidAggression,
            averageBid: boldestLeader.averageBid,
            roundsPlayed: boldestLeader.roundsPlayed,
          }
        : null,
      mostLastPlaces: lastPlaceLeader
        ? {
            identity: lastPlaceLeader.identity,
            name: lastPlaceLeader.name,
            count: lastPlaceLeader.lastPlaces,
            outOf: lastPlaceLeader.gamesPlayed,
          }
        : null,
      zeroBidMaster: toRateRecord(
        zeroMasterLeader,
        (player) => player.zeroBids
      ),
    },
    summary: {
      totalGames: finishedGames.length,
      totalRounds,
      totalPlunder,
      totalPlayers: players.length,
    },
  };
}

function chooseAward(
  kind: AwardKind,
  candidates: AwardCandidate[],
  alreadyAwarded: Set<string>,
  lowerIsBetter = false
): GameAward | null {
  const eligible = candidates.filter(
    (candidate) => !alreadyAwarded.has(candidate.player.id)
  );
  if (eligible.length === 0) return null;

  const bestValue = lowerIsBetter
    ? Math.min(...eligible.map((candidate) => candidate.value))
    : Math.max(...eligible.map((candidate) => candidate.value));
  const criterionLeaders = eligible.filter(
    (candidate) => candidate.value === bestValue
  );
  const bestFinalScore = Math.max(
    ...criterionLeaders.map((candidate) => candidate.finalScore)
  );
  const finalists = criterionLeaders.filter(
    (candidate) => candidate.finalScore === bestFinalScore
  );

  // Awards deliberately remain unassigned when criterion and final score do
  // not identify one holder. Never fall through to a lower criterion value.
  if (finalists.length !== 1) return null;

  const winner = finalists[0];
  alreadyAwarded.add(winner.player.id);
  return {
    kind,
    playerId: winner.player.id,
    playerName: winner.player.name,
    value: winner.value,
    finalScore: winner.finalScore,
  };
}

/** Priority-ordered, one-per-player awards for a finished game. */
export function gameAwards(game: Game): GameAward[] {
  if (game?.status !== "finished") return [];

  const safeGame = defensiveGame(game);
  const finalRows = safeStandings(safeGame);
  const finalById = new Map(finalRows.map((row) => [row.player.id, row]));
  const halfwayRound = Math.ceil(safeGame.totalRounds / 2);
  const halfwayById = new Map(
    safeStandings(safeGame, halfwayRound).map((row) => [row.player.id, row])
  );
  const seenPlayerIds = new Set<string>();
  const playerData = safeGame.players.flatMap((player) => {
    if (seenPlayerIds.has(player.id)) return [];
    seenPlayerIds.add(player.id);
    const history = safeHistory(safeGame, player.id);
    const finalStanding = finalById.get(player.id);
    if (history.length === 0 || !finalStanding) return [];
    return [{ player, history, finalStanding }];
  });
  if (playerData.length === 0) return [];

  const awarded = new Set<string>();
  const awards: GameAward[] = [];
  const add = (
    kind: AwardKind,
    candidates: AwardCandidate[],
    lowerIsBetter = false
  ) => {
    const award = chooseAward(kind, candidates, awarded, lowerIsBetter);
    if (award) awards.push(award);
  };

  add(
    "lookout",
    playerData
      .map(({ player, history, finalStanding }) => ({
        player,
        value: history.filter((round) => round.madeBid).length,
        finalScore: finalStanding.total,
      }))
      .filter((candidate) => candidate.value >= 1)
  );

  add(
    "zeroBidRoyalty",
    playerData
      .map(({ player, history, finalStanding }) => ({
        player,
        value: history.filter((round) => round.bid === 0 && round.madeBid)
          .length,
        finalScore: finalStanding.total,
      }))
      .filter((candidate) => candidate.value >= 1)
  );

  add(
    "comeback",
    playerData
      .map(({ player, finalStanding }) => ({
        player,
        value:
          (halfwayById.get(player.id)?.rank ?? finalStanding.rank) -
          finalStanding.rank,
        finalScore: finalStanding.total,
      }))
      .filter((candidate) => candidate.value > 0)
  );

  add(
    "reckless",
    playerData.map(({ player, history, finalStanding }) => ({
      player,
      value: history.reduce((total, round) => total + round.bid, 0),
      finalScore: finalStanding.total,
    }))
  );

  add(
    "castaway",
    playerData.map(({ player, history, finalStanding }) => ({
      player,
      value: Math.min(...history.map((round) => round.total)),
      finalScore: finalStanding.total,
    })),
    true
  );

  return awards;
}
