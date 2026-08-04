/**
 * Throttle rules for the optional end-of-game support ask.
 * Run with: npm run test:support
 */
import {
  APP_STORE_ANNUAL_COST_EUR,
  DAYS_BETWEEN_PROMPTS,
  GAMES_BEFORE_PROMPT,
  NEW_SUPPORT_PROMPT_STATE,
  PROMPT_DELAY_MS,
  SUPPORT_URL,
  SupportPromptState,
  markSupportPromptAnswered,
  markSupportPromptShown,
  normalizeSupportPrompt,
  registerFinishedGame,
  shouldShowSupportPrompt,
} from "../src/support";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}${detail ? `: ${detail}` : ""}`);
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 7, 4, 20, 0, 0);

/** Play `count` games in a row, showing the prompt whenever it is earned. */
function playGames(
  state: SupportPromptState,
  count: number,
  now = NOW
): { state: SupportPromptState; prompts: number } {
  let current = state;
  let prompts = 0;
  for (let i = 0; i < count; i++) {
    current = registerFinishedGame(current);
    if (shouldShowSupportPrompt(current, now)) {
      prompts++;
      current = markSupportPromptShown(current, now);
    }
  }
  return { state: current, prompts };
}

console.log("Published cost and destination");
check(
  "the yearly App Store cost is the amount the developer actually pays",
  APP_STORE_ANNUAL_COST_EUR === 100
);
check(
  "the donation page is the developer's own",
  SUPPORT_URL === "https://buymeacoffee.com/gabrielctn"
);
check(
  "the ask waits for the two-second podium celebration",
  PROMPT_DELAY_MS > 2000
);

console.log("\nFirst prompt");
check(
  "a fresh device has never been asked",
  !shouldShowSupportPrompt(NEW_SUPPORT_PROMPT_STATE, NOW)
);
const beforeThreshold = playGames(
  NEW_SUPPORT_PROMPT_STATE,
  GAMES_BEFORE_PROMPT - 1
);
check(
  "a newcomer plays uninterrupted until the threshold",
  beforeThreshold.prompts === 0
);
const firstRun = playGames(NEW_SUPPORT_PROMPT_STATE, GAMES_BEFORE_PROMPT);
check(
  `the ask appears once after ${GAMES_BEFORE_PROMPT} finished games`,
  firstRun.prompts === 1
);
check(
  "showing the ask restarts the game count",
  firstRun.state.finishedSincePrompt === 0 && firstRun.state.lastPromptAt === NOW
);

console.log("\nQuiet period");
const sameEvening = playGames(firstRun.state, 20);
check(
  "a long session is never interrupted twice",
  sameEvening.prompts === 0,
  `${sameEvening.prompts} prompts`
);
const justBefore = playGames(
  sameEvening.state,
  1,
  NOW + DAYS_BETWEEN_PROMPTS * DAY_MS - 1
);
check("the quiet period is respected to the day", justBefore.prompts === 0);
const justAfter = playGames(
  sameEvening.state,
  1,
  NOW + DAYS_BETWEEN_PROMPTS * DAY_MS
);
check(
  `the ask returns after ${DAYS_BETWEEN_PROMPTS} days and enough games`,
  justAfter.prompts === 1
);
check(
  "a month of silence is not enough on its own",
  !shouldShowSupportPrompt(
    markSupportPromptShown(firstRun.state, NOW),
    NOW + DAYS_BETWEEN_PROMPTS * DAY_MS
  )
);
check(
  "a device clock moved backwards does not silence the ask forever",
  shouldShowSupportPrompt(
    { finishedSincePrompt: GAMES_BEFORE_PROMPT, lastPromptAt: NOW, optedOut: false },
    NOW - 365 * DAY_MS
  )
);

console.log("\nAnswering the ask");
const answered = markSupportPromptAnswered(firstRun.state);
check("an answer opts the device out", answered.optedOut);
check(
  "an answered ask never comes back, however long the device plays",
  playGames(answered, 200, NOW + 5 * 365 * DAY_MS).prompts === 0
);

console.log("\nStored state");
check(
  "a missing record starts a fresh count",
  normalizeSupportPrompt(null).finishedSincePrompt === 0 &&
    normalizeSupportPrompt(null).lastPromptAt === 0 &&
    !normalizeSupportPrompt(null).optedOut
);
check(
  "corrupt records fall back to defaults rather than nagging",
  normalizeSupportPrompt("nonsense").finishedSincePrompt === 0 &&
    normalizeSupportPrompt({ finishedSincePrompt: "many" }).finishedSincePrompt ===
      0 &&
    normalizeSupportPrompt({ lastPromptAt: Number.NaN }).lastPromptAt === 0
);
check(
  "negative counters cannot force an early ask",
  normalizeSupportPrompt({ finishedSincePrompt: -5 }).finishedSincePrompt === 0
);
check(
  "an opt-out survives a reload",
  normalizeSupportPrompt({ optedOut: true }).optedOut
);
check(
  "a stored count survives a reload",
  normalizeSupportPrompt({
    finishedSincePrompt: 2,
    lastPromptAt: NOW,
    optedOut: false,
  }).finishedSincePrompt === 2
);
check(
  "unknown fields from newer versions are dropped",
  Object.keys(normalizeSupportPrompt({ optedOut: true, future: 1 }))
    .sort()
    .join(",") === "finishedSincePrompt,lastPromptAt,optedOut"
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
