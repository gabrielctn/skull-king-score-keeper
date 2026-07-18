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

export interface GroupRecords {
  bestFinalScore: FinalScoreRecord | null;
  worstRound: RoundScoreRecord | null;
  bestExactBidRate: ExactBidRecord | null;
}

export interface StatsSnapshot {
  players: PlayerStats[];
  records: GroupRecords;
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

/** Aggregate finished, recorded player appearances and group records. */
export function aggregateStats(games: readonly Game[]): StatsSnapshot {
  const finishedGames = [...games]
    .filter((game) => game?.status === "finished")
    .sort(compareGamesNewest)
    .map(defensiveGame);
  const buckets = new Map<string, PlayerBucket>();
  const finalCandidates: FinalRecordCandidate[] = [];
  const roundCandidates: RoundRecordCandidate[] = [];

  for (const game of finishedGames) {
    const gamePlayedAt = playedAt(game);
    const finalRows = safeStandings(game);
    const standingById = new Map(finalRows.map((row) => [row.player.id, row]));

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
      bucket.exactAttempts += history.length;
      bucket.exactSuccesses += history.filter((round) => round.madeBid).length;

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
      recentGames: [...bucket.recentGames],
    }))
    .sort(compareLeaderboard);
  const displayNameByIdentity = new Map(
    players.map((player) => [player.identity, player.name])
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

  return {
    players,
    records: { bestFinalScore, worstRound, bestExactBidRate },
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
