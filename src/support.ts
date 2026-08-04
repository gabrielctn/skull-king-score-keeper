/**
 * Everything the optional "support the developer" ask needs: where the
 * donation page lives, what publishing the app actually costs, and how often
 * the end-of-game prompt is allowed to appear.
 *
 * The ask exists to cover the Apple Developer Program membership that keeps
 * the iOS build on the App Store — not to monetize the app, which stays free
 * and ad-free either way. That is why the throttle below is deliberately
 * conservative: the prompt only reaches players who already came back for a
 * few games, it never repeats within a month, and it disappears for good once
 * the player has answered it.
 */

/** Donation page opened by the support button and the end-of-game prompt. */
export const SUPPORT_URL = "https://buymeacoffee.com/gabrielctn";

/**
 * Yearly cost, in euros, of the Apple Developer Program membership required to
 * keep Skull King Crew Ledger published on the App Store. Locales format this
 * number themselves so the amount lives in exactly one place.
 */
export const APP_STORE_ANNUAL_COST_EUR = 100;

/** Finished games required before the prompt may appear again. */
export const GAMES_BEFORE_PROMPT = 3;

/** Quiet period between two prompts, in days. */
export const DAYS_BETWEEN_PROMPTS = 30;

/**
 * How long the results screen is left alone before the prompt covers it, in
 * milliseconds. The podium celebration animates for 2s; the ask waits until
 * the crew has seen who won.
 */
export const PROMPT_DELAY_MS = 2600;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface SupportPromptState {
  /** Games finished on this device since the prompt was last shown. */
  finishedSincePrompt: number;
  /** Epoch ms of the last prompt, 0 when it has never been shown. */
  lastPromptAt: number;
  /** The player supported the app or asked not to be reminded again. */
  optedOut: boolean;
}

/** State of a device that has never finished a game. */
export const NEW_SUPPORT_PROMPT_STATE: SupportPromptState = {
  finishedSincePrompt: 0,
  lastPromptAt: 0,
  optedOut: false,
};

const counter = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;

/** Fill defaults so state written by another app version loads safely. */
export function normalizeSupportPrompt(raw: unknown): SupportPromptState {
  const source =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    finishedSincePrompt: counter(source.finishedSincePrompt),
    lastPromptAt: counter(source.lastPromptAt),
    optedOut: source.optedOut === true,
  };
}

/** Count a game that just ended. */
export function registerFinishedGame(
  state: SupportPromptState
): SupportPromptState {
  return { ...state, finishedSincePrompt: state.finishedSincePrompt + 1 };
}

/**
 * Whether the game that just ended earns the optional support ask: enough
 * games played to know whether the app is worth keeping, and no prompt within
 * the quiet period.
 */
export function shouldShowSupportPrompt(
  state: SupportPromptState,
  now: number
): boolean {
  if (state.optedOut) return false;
  if (state.finishedSincePrompt < GAMES_BEFORE_PROMPT) return false;
  // A device clock moved backwards must not silence the prompt forever.
  if (state.lastPromptAt > now) return true;
  return now - state.lastPromptAt >= DAYS_BETWEEN_PROMPTS * DAY_MS;
}

/** Restart the quiet period once the prompt has been shown. */
export function markSupportPromptShown(
  state: SupportPromptState,
  now: number
): SupportPromptState {
  return { ...state, finishedSincePrompt: 0, lastPromptAt: now };
}

/**
 * Stop asking for good. Both answers land here: someone who opened the
 * donation page has done their part, and someone who declined has said so.
 * The home screen keeps the support button either way.
 */
export function markSupportPromptAnswered(
  state: SupportPromptState
): SupportPromptState {
  return { ...state, optedOut: true };
}
