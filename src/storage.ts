import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BonusInput,
  Game,
  LootUse,
  RoundEntries,
  ScoringMode,
} from "./types";
import { emptyBonus } from "./scoring";
import { Lang } from "./i18n/types";

const CURRENT_GAME_KEY = "skullking:currentGame";
const GAME_HISTORY_KEY = "skullking:gameHistory";
const LANG_KEY = "skullking:lang";
const SEEN_RELEASE_KEY = "skullking:seenRelease";
const SETTINGS_KEY = "skullking:settings";

/** App-wide preferences, as opposed to the per-game options chosen at setup. */
export interface AppSettings {
  /** Hold a screen wake lock while a game screen is open (web only). */
  keepAwake: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = { keepAwake: true };

/** Fill defaults so settings written by other app versions load safely. */
export function normalizeSettings(raw: unknown): AppSettings {
  const source =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    keepAwake:
      typeof source.keepAwake === "boolean"
        ? source.keepAwake
        : DEFAULT_SETTINGS.keepAwake,
  };
}

/**
 * Bring a loaded game up to the current schema. Older saves stored `bonus`
 * as a single number and had no `cardsDealt` / `advancedCards`. Saves created
 * before schema v4 also stored Loot as a per-player count instead of binding
 * the two allied players, so keep those historical points in `legacyLoot`.
 * Schema v5 adds the new expansion fields and toggle; old games keep it off.
 * Schema v6 records tricks destroyed by a Kraken; older saves default to 0.
 * Schema v7 adds Rascal scoring (mode, optional-rules flag and per-entry
 * declarations); older saves stay on classic scoring.
 */
export function normalizeGame(raw: any): Game | null {
  if (!raw || !Array.isArray(raw.players) || !Array.isArray(raw.rounds)) {
    return null;
  }

  const totalRounds: number =
    typeof raw.totalRounds === "number" ? raw.totalRounds : raw.rounds.length;

  const cardsDealt: number[] = Array.isArray(raw.cardsDealt)
    ? raw.cardsDealt
    : Array.from({ length: totalRounds }, (_, i) => i + 1);

  const normBonus = (b: any): BonusInput => {
    if (typeof b === "number") {
      // Legacy: a single freeform bonus number -> map to colored14 buckets.
      const base = emptyBonus();
      base.colored14 = b > 0 ? Math.round(b / 10) : 0;
      return base;
    }
    const { loot: _legacyLoot, ...currentBonus } = b ?? {};
    return { ...emptyBonus(), ...currentBonus };
  };

  const scoringMode: ScoringMode =
    raw.scoringMode === "rascal" ? "rascal" : "classic";
  // The optional-rules flag (and any stored declaration) only means something
  // in a Rascal game with bets on; reset it everywhere else so stale values
  // can never change a score.
  const rascalBets = scoringMode === "rascal" && raw.rascalBets === true;

  const rounds: RoundEntries[] = raw.rounds.map((round: any) => {
    const out: RoundEntries = {};
    for (const p of raw.players) {
      const e = round?.[p.id];
      out[p.id] = {
        bid: e?.bid ?? 0,
        tricks: e?.tricks ?? 0,
        bonus: normBonus(e?.bonus),
        legacyLoot: Math.max(
          0,
          Number(e?.legacyLoot ?? e?.bonus?.loot ?? 0) || 0
        ),
        recorded: !!e?.recorded,
        rascalBet:
          rascalBets && e?.rascalBet === "cannonball"
            ? "cannonball"
            : "buckshot",
      };
    }
    return out;
  });

  const playerIds = new Set<string>(raw.players.map((p: any) => p.id));
  const lootUses: LootUse[][] = Array.from(
    { length: totalRounds },
    (_, roundIndex) => {
      const uses = Array.isArray(raw.lootUses?.[roundIndex])
        ? raw.lootUses[roundIndex]
        : [];
      return uses
        .filter(
          (lootUse: any) =>
            lootUse &&
            (lootUse.playedById === null ||
              (typeof lootUse.playedById === "string" &&
                playerIds.has(lootUse.playedById))) &&
            (lootUse.boundToId === null ||
              (typeof lootUse.boundToId === "string" &&
                playerIds.has(lootUse.boundToId)))
        )
        .slice(0, 2)
        .map((lootUse: any, index: number) => ({
          id:
            typeof lootUse.id === "string"
              ? lootUse.id
              : `loot_${roundIndex + 1}_${index + 1}`,
          playedById: lootUse.playedById,
          boundToId: lootUse.boundToId,
        }));
    }
  );

  const discardedTricks: number[] = Array.from(
    { length: totalRounds },
    (_, roundIndex) =>
      Math.max(0, Math.floor(Number(raw.discardedTricks?.[roundIndex]) || 0))
  );

  return {
    id: raw.id ?? `game_${Date.now()}`,
    players: raw.players,
    totalRounds,
    currentRound: raw.currentRound ?? 1,
    rounds,
    lootUses,
    discardedTricks,
    cardsDealt,
    scoringMode,
    rascalBets,
    advancedCards: raw.advancedCards ?? true,
    newExpansion: raw.newExpansion ?? false,
    // v2 saves predate the 2-player ghost; default off to keep their strict
    // "tricks must equal cards dealt" behaviour.
    twoPlayerGhost: raw.twoPlayerGhost ?? false,
    status: raw.status === "finished" ? "finished" : "in_progress",
    createdAt: raw.createdAt ?? Date.now(),
    updatedAt: raw.updatedAt ?? Date.now(),
  };
}

/** Persist the in-progress (or just-finished) game so it survives restarts. */
export async function saveGame(game: Game): Promise<boolean> {
  try {
    await AsyncStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(game));
    return true;
  } catch (e) {
    console.warn("Failed to save game", e);
    return false;
  }
}

/** Load the saved game, or null if there isn't one / it's unreadable. */
export async function loadGame(): Promise<Game | null> {
  try {
    const stored = await AsyncStorage.getItem(CURRENT_GAME_KEY);
    if (!stored) return null;
    return normalizeGame(JSON.parse(stored));
  } catch (e) {
    console.warn("Failed to load game", e);
    return null;
  }
}

export async function clearGame(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(CURRENT_GAME_KEY);
    return true;
  } catch (e) {
    console.warn("Failed to clear game", e);
    return false;
  }
}

/** Load every saved game, newest activity first. Invalid entries are skipped. */
export async function loadGameHistory(): Promise<Game[]> {
  try {
    const stored = await AsyncStorage.getItem(GAME_HISTORY_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeGame)
      .filter((game): game is Game => game !== null)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (e) {
    console.warn("Failed to load game history", e);
    return [];
  }
}

/** Replace the persisted history with the supplied games. */
export async function saveGameHistory(games: Game[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(games));
    return true;
  } catch (e) {
    console.warn("Failed to save game history", e);
    return false;
  }
}

/** Load the saved UI language, or null if none was chosen yet. */
export async function loadLang(): Promise<Lang | null> {
  try {
    const value = await AsyncStorage.getItem(LANG_KEY);
    return value === "en" ||
      value === "fr" ||
      value === "es" ||
      value === "de" ||
      value === "ar" ||
      value === "zh"
      ? value
      : null;
  } catch (e) {
    console.warn("Failed to load language", e);
    return null;
  }
}

/** Persist the chosen UI language. */
export async function saveLang(lang: Lang): Promise<void> {
  try {
    await AsyncStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    console.warn("Failed to save language", e);
  }
}

/** Load the saved app settings, falling back to defaults field by field. */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    return normalizeSettings(stored ? JSON.parse(stored) : null);
  } catch (e) {
    console.warn("Failed to load settings", e);
    return { ...DEFAULT_SETTINGS };
  }
}

/** Persist the app settings. */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn("Failed to save settings", e);
  }
}

const LIVE_SESSION_PREFIX = "skullking:liveSession:";

/**
 * The game master's live-sharing credentials for one game: the server session
 * id (the read capability in the QR) and the local writer key (required to
 * push updates). Kept per game so restarting the app resumes the same session.
 */
export interface StoredLiveSession {
  sessionId: string;
  writerKey: string;
}

export async function loadLiveSessionFor(
  gameId: string
): Promise<StoredLiveSession | null> {
  try {
    const stored = await AsyncStorage.getItem(LIVE_SESSION_PREFIX + gameId);
    if (!stored) return null;
    const raw = JSON.parse(stored);
    if (
      raw &&
      typeof raw.sessionId === "string" &&
      typeof raw.writerKey === "string"
    ) {
      return { sessionId: raw.sessionId, writerKey: raw.writerKey };
    }
    return null;
  } catch (e) {
    console.warn("Failed to load live session", e);
    return null;
  }
}

export async function saveLiveSessionFor(
  gameId: string,
  session: StoredLiveSession
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      LIVE_SESSION_PREFIX + gameId,
      JSON.stringify(session)
    );
  } catch (e) {
    console.warn("Failed to save live session", e);
  }
}

export async function clearLiveSessionFor(gameId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(LIVE_SESSION_PREFIX + gameId);
  } catch (e) {
    console.warn("Failed to clear live session", e);
  }
}

const CLOUD_OWNER_KEY = "skullking:cloudOwner";

/**
 * This device's credentials for its private cloud backup: an unguessable
 * owner id (the row to read) and a secret writer key (required to read or
 * write it). Generated once and kept locally; the same pair, shared as a
 * "sync code", lets another device load the same games. Isolation between
 * different scorekeepers is simply that each holds a different pair.
 */
export interface CloudOwner {
  ownerId: string;
  writerKey: string;
}

export async function loadCloudOwner(): Promise<CloudOwner | null> {
  try {
    const stored = await AsyncStorage.getItem(CLOUD_OWNER_KEY);
    if (!stored) return null;
    const raw = JSON.parse(stored);
    if (
      raw &&
      typeof raw.ownerId === "string" &&
      typeof raw.writerKey === "string"
    ) {
      return { ownerId: raw.ownerId, writerKey: raw.writerKey };
    }
    return null;
  } catch (e) {
    console.warn("Failed to load cloud owner", e);
    return null;
  }
}

export async function saveCloudOwner(owner: CloudOwner): Promise<void> {
  try {
    await AsyncStorage.setItem(CLOUD_OWNER_KEY, JSON.stringify(owner));
  } catch (e) {
    console.warn("Failed to save cloud owner", e);
  }
}

export async function clearCloudOwner(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CLOUD_OWNER_KEY);
  } catch (e) {
    console.warn("Failed to clear cloud owner", e);
  }
}

const SPECTATOR_IDENTITY_KEY = "skullking:spectatorIdentity";

/**
 * Which player this device's owner is in the game they follow as a
 * spectator. Lets a re-scan of the game master's QR code jump straight to
 * the right score details. Only the latest followed game is remembered.
 */
export interface SpectatorIdentity {
  gameId: string;
  playerId: string;
  /** Guards against a seat-derived ID pointing at someone else. */
  playerName: string;
}

export async function loadSpectatorIdentity(): Promise<SpectatorIdentity | null> {
  try {
    const stored = await AsyncStorage.getItem(SPECTATOR_IDENTITY_KEY);
    if (!stored) return null;
    const raw = JSON.parse(stored);
    if (
      raw &&
      typeof raw.gameId === "string" &&
      typeof raw.playerId === "string" &&
      typeof raw.playerName === "string"
    ) {
      return {
        gameId: raw.gameId,
        playerId: raw.playerId,
        playerName: raw.playerName,
      };
    }
    return null;
  } catch (e) {
    console.warn("Failed to load spectator identity", e);
    return null;
  }
}

export async function saveSpectatorIdentity(
  identity: SpectatorIdentity
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      SPECTATOR_IDENTITY_KEY,
      JSON.stringify(identity)
    );
  } catch (e) {
    console.warn("Failed to save spectator identity", e);
  }
}

const SPECTATOR_SORT_KEY = "skullking:spectatorSort";

/**
 * How a spectator (a player following the live/QR scores on their own phone)
 * wants the standings list ordered:
 * - `name`: alphabetical, so a name never jumps around as scores change;
 * - `gameOrder`: seating order, matching the physical table;
 * - `rank`: classic high-to-low leaderboard order.
 * The rank badge always shows the true standing regardless of this choice.
 */
export type SpectatorSort = "name" | "gameOrder" | "rank";

export const DEFAULT_SPECTATOR_SORT: SpectatorSort = "name";

function isSpectatorSort(value: unknown): value is SpectatorSort {
  return value === "name" || value === "gameOrder" || value === "rank";
}

export async function loadSpectatorSort(): Promise<SpectatorSort> {
  try {
    const stored = await AsyncStorage.getItem(SPECTATOR_SORT_KEY);
    return isSpectatorSort(stored) ? stored : DEFAULT_SPECTATOR_SORT;
  } catch (e) {
    console.warn("Failed to load spectator sort", e);
    return DEFAULT_SPECTATOR_SORT;
  }
}

export async function saveSpectatorSort(sort: SpectatorSort): Promise<void> {
  try {
    await AsyncStorage.setItem(SPECTATOR_SORT_KEY, sort);
  } catch (e) {
    console.warn("Failed to save spectator sort", e);
  }
}

/** Last changelog release acknowledged by this device. */
export async function loadSeenRelease(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SEEN_RELEASE_KEY);
  } catch (e) {
    console.warn("Failed to load seen release", e);
    return null;
  }
}

export async function saveSeenRelease(version: string): Promise<void> {
  try {
    await AsyncStorage.setItem(SEEN_RELEASE_KEY, version);
  } catch (e) {
    console.warn("Failed to save seen release", e);
  }
}
