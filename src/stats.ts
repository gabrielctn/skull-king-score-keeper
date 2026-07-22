import { playerScoreHistory, standings } from "./scoring";
import { Game, Player } from "./types";

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
  wins: number;
  winRate: number;
  exactBids: Rate;
  zeroBids: Rate;
  averagePoints: number;
  bestFinalScore: number | null;
  currentWinStreak: number;
  /** Longest run of consecutive wins ever, not just the current one. */
  longestWinStreak: number;
  /** Top-three finishes and their share of games played. */
  podiums: number;
  podiumRate: number;
  /** Mean finishing position (1 = winner); lower is better. */
  averageRank: number;
  /** Last-place finishes — the "kraken bait" counter. */
  lastPlaces: number;
  /** Highest single-round score this player has ever posted. */
  bestRound: number | null;
  /** Mean tricks bid per recorded round — the recklessness gauge. */
  averageBid: number;
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

/** A holder plus their mean tricks bid per round. */
export interface AverageBidRecord {
  identity: string;
  name: string;
  averageBid: number;
}

/** A holder plus a simple tally (e.g. last-place finishes). */
export interface CountRecord {
  identity: string;
  name: string;
  count: number;
}

export interface GroupRecords {
  bestFinalScore: FinalScoreRecord | null;
  worstRound: RoundScoreRecord | null;
  bestExactBidRate: ExactBidRecord | null;
  /** Highest single-round haul anyone has ever scored. */
  biggestRound: RoundScoreRecord | null;
  /** Longest historical winning streak across the crew. */
  longestStreak: StreakRecord | null;
  /** Highest average bid — the boldest (or most foolhardy) captain. */
  mostReckless: AverageBidRecord | null;
  /** Most last-place finishes — served most often to the kraken. */
  krakenBait: CountRecord | null;
  /** Best zero-bid success rate with a meaningful sample. */
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
}

export interface StatsSnapshot {
  players: PlayerStats[];
  records: GroupRecords;
  summary: StatsSummary;
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
  wins: number;
  exactSuccesses: number;
  exactAttempts: number;
  zeroSuccesses: number;
  zeroAttempts: number;
  totalPoints: number;
  bestFinalScore: number | null;
  podiums: number;
  rankSum: number;
  lastPlaces: number;
  bestRound: number | null;
  bidSum: number;
  recentGames: RecentPlayerGame[];
}

interface FinalRecordCandidate extends FinalScoreRecord {
  playerId: string;
}

interface RoundRecordCandidate extends RoundScoreRecord {
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

function compareBestFinal(
  a: FinalRecordCandidate,
  b: FinalRecordCandidate
): number {
  if (a.score !== b.score) return b.score - a.score;
  if (a.playedAt !== b.playedAt) return b.playedAt - a.playedAt;
  const identityDifference = compareText(a.identity, b.identity);
  if (identityDifference !== 0) return identityDifference;
  const gameDifference = compareText(a.gameId, b.gameId);
  if (gameDifference !== 0) return gameDifference;
  return compareText(a.playerId, b.playerId);
}

function compareWorstRound(
  a: RoundRecordCandidate,
  b: RoundRecordCandidate
): number {
  if (a.score !== b.score) return a.score - b.score;
  if (a.playedAt !== b.playedAt) return b.playedAt - a.playedAt;
  const identityDifference = compareText(a.identity, b.identity);
  if (identityDifference !== 0) return identityDifference;
  const gameDifference = compareText(a.gameId, b.gameId);
  if (gameDifference !== 0) return gameDifference;
  if (a.roundNumber !== b.roundNumber) return a.roundNumber - b.roundNumber;
  return compareText(a.playerId, b.playerId);
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

function compareBiggestRound(
  a: RoundRecordCandidate,
  b: RoundRecordCandidate
): number {
  if (a.score !== b.score) return b.score - a.score;
  if (a.playedAt !== b.playedAt) return b.playedAt - a.playedAt;
  const identityDifference = compareText(a.identity, b.identity);
  if (identityDifference !== 0) return identityDifference;
  const gameDifference = compareText(a.gameId, b.gameId);
  if (gameDifference !== 0) return gameDifference;
  if (a.roundNumber !== b.roundNumber) return a.roundNumber - b.roundNumber;
  return compareText(a.playerId, b.playerId);
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
  let totalRounds = 0;

  for (const game of finishedGames) {
    const gamePlayedAt = playedAt(game);
    const finalRows = safeStandings(game);
    const standingById = new Map(finalRows.map((row) => [row.player.id, row]));
    // Last place is the worst rank in a game with at least two ranked seats;
    // ties for last share it. Used for the "kraken bait" tally.
    const lastRank =
      finalRows.length >= 2
        ? Math.max(...finalRows.map((row) => row.rank))
        : null;
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
          wins: 0,
          exactSuccesses: 0,
          exactAttempts: 0,
          zeroSuccesses: 0,
          zeroAttempts: 0,
          totalPoints: 0,
          bestFinalScore: null,
          podiums: 0,
          rankSum: 0,
          lastPlaces: 0,
          bestRound: null,
          bidSum: 0,
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
      bucket.podiums += finalStanding.rank <= 3 ? 1 : 0;
      bucket.rankSum += finalStanding.rank;
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
      bucket.bidSum += history.reduce((sum, round) => sum + round.bid, 0);
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
      wins: bucket.wins,
      winRate: bucket.gamesPlayed > 0 ? bucket.wins / bucket.gamesPlayed : 0,
      exactBids: toRate(bucket.exactSuccesses, bucket.exactAttempts),
      zeroBids: toRate(bucket.zeroSuccesses, bucket.zeroAttempts),
      averagePoints:
        bucket.gamesPlayed > 0 ? bucket.totalPoints / bucket.gamesPlayed : 0,
      bestFinalScore: bucket.bestFinalScore,
      currentWinStreak: currentStreak(bucket.recentGames),
      longestWinStreak: longestStreak(bucket.recentGames),
      podiums: bucket.podiums,
      podiumRate: bucket.gamesPlayed > 0 ? bucket.podiums / bucket.gamesPlayed : 0,
      averageRank:
        bucket.gamesPlayed > 0 ? bucket.rankSum / bucket.gamesPlayed : 0,
      lastPlaces: bucket.lastPlaces,
      bestRound: bucket.bestRound,
      averageBid:
        bucket.exactAttempts > 0 ? bucket.bidSum / bucket.exactAttempts : 0,
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

  const bestFinalCandidate = [...finalCandidates].sort(compareBestFinal)[0];
  const worstRoundCandidate = [...roundCandidates].sort(compareWorstRound)[0];
  const bestExactPlayer = players
    .filter((player) => player.exactBids.rate !== null)
    .sort((a, b) => {
      if (a.exactBids.rate !== b.exactBids.rate) {
        return (b.exactBids.rate ?? -1) - (a.exactBids.rate ?? -1);
      }
      if (a.exactBids.attempts !== b.exactBids.attempts) {
        return b.exactBids.attempts - a.exactBids.attempts;
      }
      if (a.lastPlayedAt !== b.lastPlayedAt) {
        return b.lastPlayedAt - a.lastPlayedAt;
      }
      return compareText(a.identity, b.identity);
    })[0];

  const bestFinalScore: FinalScoreRecord | null = bestFinalCandidate
    ? {
        identity: bestFinalCandidate.identity,
        name:
          displayNameByIdentity.get(bestFinalCandidate.identity) ??
          bestFinalCandidate.name,
        score: bestFinalCandidate.score,
        gameId: bestFinalCandidate.gameId,
        playedAt: bestFinalCandidate.playedAt,
      }
    : null;
  const worstRound: RoundScoreRecord | null = worstRoundCandidate
    ? {
        identity: worstRoundCandidate.identity,
        name:
          displayNameByIdentity.get(worstRoundCandidate.identity) ??
          worstRoundCandidate.name,
        score: worstRoundCandidate.score,
        gameId: worstRoundCandidate.gameId,
        playedAt: worstRoundCandidate.playedAt,
        roundNumber: worstRoundCandidate.roundNumber,
      }
    : null;
  const bestExactBidRate: ExactBidRecord | null =
    bestExactPlayer && bestExactPlayer.exactBids.rate !== null
      ? {
          identity: bestExactPlayer.identity,
          name: bestExactPlayer.name,
          rate: bestExactPlayer.exactBids.rate,
          successes: bestExactPlayer.exactBids.successes,
          attempts: bestExactPlayer.exactBids.attempts,
        }
      : null;

  const biggestRoundCandidate = [...roundCandidates].sort(compareBiggestRound)[0];
  const biggestRound: RoundScoreRecord | null = biggestRoundCandidate
    ? {
        identity: biggestRoundCandidate.identity,
        name:
          displayNameByIdentity.get(biggestRoundCandidate.identity) ??
          biggestRoundCandidate.name,
        score: biggestRoundCandidate.score,
        gameId: biggestRoundCandidate.gameId,
        playedAt: biggestRoundCandidate.playedAt,
        roundNumber: biggestRoundCandidate.roundNumber,
      }
    : null;

  const streakLeader = [...players]
    .filter((player) => player.longestWinStreak >= 2)
    .sort((a, b) => {
      if (a.longestWinStreak !== b.longestWinStreak) {
        return b.longestWinStreak - a.longestWinStreak;
      }
      if (a.lastPlayedAt !== b.lastPlayedAt) return b.lastPlayedAt - a.lastPlayedAt;
      return compareText(a.identity, b.identity);
    })[0];
  const longestStreakRecord: StreakRecord | null = streakLeader
    ? {
        identity: streakLeader.identity,
        name: streakLeader.name,
        streak: streakLeader.longestWinStreak,
      }
    : null;

  const recklessLeader = [...players]
    .filter((player) => player.exactBids.attempts >= 1 && player.averageBid > 0)
    .sort((a, b) => {
      if (a.averageBid !== b.averageBid) return b.averageBid - a.averageBid;
      if (a.exactBids.attempts !== b.exactBids.attempts) {
        return b.exactBids.attempts - a.exactBids.attempts;
      }
      if (a.lastPlayedAt !== b.lastPlayedAt) return b.lastPlayedAt - a.lastPlayedAt;
      return compareText(a.identity, b.identity);
    })[0];
  const mostReckless: AverageBidRecord | null = recklessLeader
    ? {
        identity: recklessLeader.identity,
        name: recklessLeader.name,
        averageBid: recklessLeader.averageBid,
      }
    : null;

  const krakenBaitLeader = [...players]
    .filter((player) => player.lastPlaces >= 1)
    .sort((a, b) => {
      if (a.lastPlaces !== b.lastPlaces) return b.lastPlaces - a.lastPlaces;
      if (a.lastPlayedAt !== b.lastPlayedAt) return b.lastPlayedAt - a.lastPlayedAt;
      return compareText(a.identity, b.identity);
    })[0];
  const krakenBait: CountRecord | null = krakenBaitLeader
    ? {
        identity: krakenBaitLeader.identity,
        name: krakenBaitLeader.name,
        count: krakenBaitLeader.lastPlaces,
      }
    : null;

  // A "master" needs a real sample, so a lone lucky zero bid never qualifies.
  const zeroMasterLeader = [...players]
    .filter(
      (player) => player.zeroBids.rate !== null && player.zeroBids.attempts >= 3
    )
    .sort((a, b) => {
      const rateA = a.zeroBids.rate ?? -1;
      const rateB = b.zeroBids.rate ?? -1;
      if (rateA !== rateB) return rateB - rateA;
      if (a.zeroBids.attempts !== b.zeroBids.attempts) {
        return b.zeroBids.attempts - a.zeroBids.attempts;
      }
      if (a.lastPlayedAt !== b.lastPlayedAt) return b.lastPlayedAt - a.lastPlayedAt;
      return compareText(a.identity, b.identity);
    })[0];
  const zeroBidMaster: ExactBidRecord | null =
    zeroMasterLeader && zeroMasterLeader.zeroBids.rate !== null
      ? {
          identity: zeroMasterLeader.identity,
          name: zeroMasterLeader.name,
          rate: zeroMasterLeader.zeroBids.rate,
          successes: zeroMasterLeader.zeroBids.successes,
          attempts: zeroMasterLeader.zeroBids.attempts,
        }
      : null;

  return {
    players,
    records: {
      bestFinalScore,
      worstRound,
      bestExactBidRate,
      biggestRound,
      longestStreak: longestStreakRecord,
      mostReckless,
      krakenBait,
      zeroBidMaster,
    },
    summary: {
      totalGames: finishedGames.length,
      totalRounds,
      totalPlunder,
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
