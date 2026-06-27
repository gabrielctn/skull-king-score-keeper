import AsyncStorage from "@react-native-async-storage/async-storage";
import { BonusInput, Game, RoundEntries } from "./types";
import { emptyBonus } from "./scoring";
import { Lang } from "./i18n/types";

const CURRENT_GAME_KEY = "skullking:currentGame";
const LANG_KEY = "skullking:lang";

/**
 * Bring a loaded game up to the current schema. Older saves stored `bonus`
 * as a single number and had no `cardsDealt` / `advancedCards`, so backfill
 * those rather than crashing.
 */
function normalizeGame(raw: any): Game | null {
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
    return { ...emptyBonus(), ...(b ?? {}) };
  };

  const rounds: RoundEntries[] = raw.rounds.map((round: any) => {
    const out: RoundEntries = {};
    for (const p of raw.players) {
      const e = round?.[p.id];
      out[p.id] = {
        bid: e?.bid ?? 0,
        tricks: e?.tricks ?? 0,
        bonus: normBonus(e?.bonus),
        recorded: !!e?.recorded,
      };
    }
    return out;
  });

  return {
    id: raw.id ?? `game_${Date.now()}`,
    players: raw.players,
    totalRounds,
    currentRound: raw.currentRound ?? 1,
    rounds,
    cardsDealt,
    advancedCards: raw.advancedCards ?? true,
    // v2 saves predate the 2-player ghost; default off to keep their strict
    // "tricks must equal cards dealt" behaviour.
    twoPlayerGhost: raw.twoPlayerGhost ?? false,
    status: raw.status === "finished" ? "finished" : "in_progress",
    createdAt: raw.createdAt ?? Date.now(),
    updatedAt: raw.updatedAt ?? Date.now(),
  };
}

/** Persist the in-progress (or just-finished) game so it survives restarts. */
export async function saveGame(game: Game): Promise<void> {
  try {
    await AsyncStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(game));
  } catch (e) {
    console.warn("Failed to save game", e);
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

export async function clearGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CURRENT_GAME_KEY);
  } catch (e) {
    console.warn("Failed to clear game", e);
  }
}

/** Load the saved UI language, or null if none was chosen yet. */
export async function loadLang(): Promise<Lang | null> {
  try {
    const value = await AsyncStorage.getItem(LANG_KEY);
    return value === "en" || value === "fr" ? value : null;
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
