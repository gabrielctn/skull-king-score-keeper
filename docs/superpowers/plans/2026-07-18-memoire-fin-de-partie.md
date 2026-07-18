# Game Memory & Endgame Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cross-game player statistics, score-evolution charts, a shareable end-of-game recap, and a celebratory results experience for release 1.3.0.

**Architecture:** Keep persistence and `GAME_SCHEMA_VERSION` unchanged. A new pure `stats.ts` module derives normalized identities, aggregates, records, chart series, suggestions, and awards from normalized `Game` values while reusing the scoring engine. React Native screens consume those values; the web-only chart uses inline SVG, the recap uses the browser canvas/share APIs, and every capability degrades without a backend or new dependency.

**Tech Stack:** Expo 54, React 19, React Native 0.81 / react-native-web 0.21, TypeScript 5.9, inline SVG, Canvas 2D, Web Share/Clipboard APIs, React Native `Animated`, dependency-free Node test scripts.

---

## File Structure

### New files

- `src/stats.ts` — pure name normalization, history aggregation, group records, cumulative series, setup suggestions, and per-game awards.
- `src/components/ScoreChart.tsx` — responsive inline-SVG score curve and wrapping text legend.
- `src/components/Podium.tsx` — top-three podium, reduced-motion-aware entrance, confetti, and awards display.
- `src/screens/StatsScreen.tsx` — history-backed group leaderboard and local player-detail view.
- `src/shareRecap.ts` — localized recap text, 1080×1350 canvas renderer, browser share cascade, clipboard, and PNG download.
- `scripts/test-stats.ts` — dependency-free domain contract tests.

### Modified files

- `App.tsx` — add the `"stats"` route, wire the home entry point, and pass authoritative history to stats/setup.
- `src/screens/HomeScreen.tsx` — add the 🏆 entry next to settings.
- `src/screens/SetupScreen.tsx` — show focused-field player-name suggestion chips.
- `src/screens/GameScreen.tsx` — move the total-score area into the scrollable content and add the chart after two scored rounds.
- `src/screens/ResultsScreen.tsx` — add podium, awards, chart, share action, and share status.
- `src/theme.ts` — add one shared eight-player score-series palette for SVG and canvas.
- `src/i18n/types.ts` — type the new `stats`, `share`, and `awards` namespaces plus setup/podium strings.
- `src/i18n/fr.ts`, `src/i18n/en.ts`, `src/i18n/de.ts`, `src/i18n/zh.ts`, `src/i18n/ar.ts` — add complete localized UI, award names, and release notes.
- `scripts/test-scoring.ts` — keep locale award names and the four-item release-note contract synchronized.
- `README.md` — keep the documented automated-check count accurate after adding the stats suite.
- `package.json` — add the stats test to `npm test` and bump to 1.3.0.
- `package-lock.json` — synchronize the root package version to 1.3.0.
- `app.json` — bump the Expo version to 1.3.0.
- `src/releases.ts` — publish release 1.3.0 metadata.

### Explicitly unchanged

- `src/types.ts` — `Game` remains the persisted source of truth and `GAME_SCHEMA_VERSION` stays 6.
- `src/storage.ts` — no new key, cache, or stored aggregate.
- `src/backup.ts` — backup shape and import/export behavior stay unchanged.
- `web/service-worker.js` — the production build continues to inject a content-hashed cache version.

---

## Domain Contracts

Use normalized player names as history identities and player IDs only inside one game. Keep rates as fractions from `0` to `1`; use `null` when a denominator is zero so the UI can render a localized unavailable value rather than `NaN` or a misleading `0%`.

The public surface of `src/stats.ts` should be equivalent to:

```ts
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

export function normalizePlayerName(name: string): string;
export function aggregateStats(games: readonly Game[]): StatsSnapshot;
export function cumulativeScoreSeries(game: Game): PlayerScoreSeries[];
export function playerNameSuggestions(
  games: readonly Game[],
  excludedNames?: readonly string[]
): string[];
export function gameAwards(game: Game): GameAward[];
```

Domain rules to preserve throughout implementation:

- `aggregateStats` filters to `status === "finished"`; suggestions intentionally scan all supplied history entries.
- `normalizePlayerName` trims, lowercases, normalizes to NFD, removes combining marks, and collapses internal whitespace. Empty normalized identities are ignored defensively.
- The display spelling is the newest spelling among finished games for statistics and the newest spelling among all games for suggestions.
- Each same-name player seat writes to the same identity bucket. A same-game collision is intentionally not repaired; both seat appearances contribute to that shared row, matching the documented limitation.
- A finished player appearance with no recorded round history is ignored. This prevents defensive/degenerate saves from turning zero-score `standings` ties into invented games, wins, streaks, or records.
- Exact-bid attempts are recorded entries only and successes use `madeBid`; successful zero bids are recorded entries with `bid === 0` and `madeBid === true`.
- Every `standings(game)` row at rank 1 is a winner. Current streak scans that identity's appearances newest-first and stops at the first non-win.
- Leaderboard order is wins, win rate, games played, most-recent play, then normalized identity.
- Group-record ties are deterministic: metric first, then sample size for exact-rate ties, then newest occurrence, then normalized identity. The award-only “omit unresolved ties” rule does not apply to group records.
- Scores, round totals, and series always come from `playerScoreHistory`/`standings`; `playerScoreHistory` already delegates each round to `scoreRoundBreakdown`, so do not reproduce scoring, Loot, or tie-ranking logic.

---

### Task 1: Define the statistics contract with failing tests

**Files:**
- Create: `scripts/test-stats.ts`
- Modify: `package.json:5-18`

- [ ] **Step 1: Add the dependency-free test harness and fixtures**

Follow `scripts/test-scoring.ts`: keep `passed`/`failed` counters, small `check`, equality, approximate-number, and non-throwing helpers, section headings, and `process.exit(1)` when failures exist.

Build fixtures with `createGame` and `emptyBonus`, then explicitly assign IDs, timestamps, rounds, `status = "finished"`, and `currentRound`. A compact entry helper should allow recorded and unrecorded entries without duplicating bonus defaults.

- [ ] **Step 2: Write normalization, aggregation, and ordering cases**

Import the proposed APIs from `../src/stats` and cover:

- trimming, lowercasing, accent stripping, apostrophe preservation, and whitespace collapse (`"  ÉLISE \t de   L’Île "` → `"elise de l’ile"`);
- case/accent/whitespace variants across games merging into one identity;
- two same-game seats with the same normalized name contributing two appearances/recent items to the explicitly shared identity bucket;
- the newest finished-game spelling winning while a newer in-progress spelling is ignored by statistics;
- in-progress games not changing games, wins, points, records, or streaks;
- shared rank-1 finishes crediting every tied winner and extending each tied player's current win streak;
- exact-bid and zero-bid numerators/denominators using recorded entries only;
- `null` rates when no applicable attempt exists;
- final score average, best score, newest-first recent games, and current win streak;
- leaderboard order: wins → win rate → games played → deterministic fallback.

- [ ] **Step 3: Write records, series, suggestions, and defensive cases**

Cover:

- best final score with player/game/date metadata;
- worst Loot/bonus-aware round via the canonical round history, including its round number; use at least three players and an active Loot alliance so the fixture exercises the engine's real Loot path;
- best exact-bid percentage, excluding players with no attempts and preferring the larger sample on equal rates;
- cumulative totals that retain original round numbers and skip unrecorded/sparse rounds;
- suggestions ordered by `updatedAt`, deduplicated by normalized identity, keeping the newest spelling, and excluding currently entered normalized names;
- suggestions including an in-progress historical game while aggregates exclude it;
- empty players, zero rounds, and missing round slots/entries without throwing;
- a finished player/game with no recorded history contributing no aggregate row, win, streak, or group record;
- a two-player ghost game exposing only the two real `Player` entries.

- [ ] **Step 4: Wire the focused test into package scripts**

Add:

```json
"test:stats": "node --import tsx scripts/test-stats.ts"
```

Insert `npm run test:stats` into the aggregate `test` command after `test:scoring`.

- [ ] **Step 5: Run the new contract and verify it fails for the missing module**

Run:

```bash
npm run test:stats
```

Expected: FAIL because `src/stats.ts` does not exist yet.

- [ ] **Step 6: Commit the failing contract**

```bash
git add scripts/test-stats.ts package.json
git commit -m "test: define game memory statistics contract"
```

---

### Task 2: Implement identity, aggregates, records, series, and suggestions

**Files:**
- Create: `src/stats.ts`
- Test: `scripts/test-stats.ts`

- [ ] **Step 1: Add exported types and defensive pure helpers**

Implement the Domain Contracts above. Work on sorted copies rather than mutating caller arrays. Add internal helpers for finished games newest-first, safe rate construction, recorded history extraction, and deterministic comparisons.

Implement normalization with Unicode combining-mark removal. Prefer the broadly supported combining-mark range over locale-dependent casing behavior:

```ts
name
  .trim()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/\s+/g, " ");
```

- [ ] **Step 2: Implement cumulative score series and suggestions**

For each real player, map `playerScoreHistory(game, player.id)` to `{ roundNumber, total: runningTotal }`. Keep sparse round numbers; do not invent zero points for unrecorded rounds.

For suggestions, sort all supplied games newest-first, scan players in seating order, retain the first spelling for each normalized identity, and filter a normalized `Set` of current setup names. Ignore empty normalized names.

- [ ] **Step 3: Aggregate player appearances from finished games**

For every player row in each finished game with a non-empty `playerScoreHistory`:

- use `standings(game)` for final total/rank and shared wins;
- use `playerScoreHistory` for recorded bid counts and round totals;
- add a newest-first recent-game item;
- retain the first encountered spelling as the display name;
- finalize rates, average, best score, and the leading run of wins.

Sort the exported players by the approved leaderboard order. Ensure zero denominators never produce `NaN`/`Infinity`.

- [ ] **Step 4: Derive all three group records**

Track final-score and round-score candidates while walking finished games. Derive the exact-bid record from finalized player aggregates. Apply the deterministic tie policy in Domain Contracts rather than relying on input or `Map` iteration order.

- [ ] **Step 5: Run the focused and regression tests**

Run:

```bash
npm run test:stats
npm run test:scoring
npm run typecheck
```

Expected: all commands PASS and the stats summary reports `0 failed`.

- [ ] **Step 6: Commit the pure statistics module**

```bash
git add src/stats.ts
git commit -m "feat: aggregate cross-game player statistics"
```

---

### Task 3: Add deterministic per-game awards

**Files:**
- Modify: `scripts/test-stats.ts`
- Modify: `src/stats.ts`

- [ ] **Step 1: Append failing tests for priority and uniqueness**

Create a fixture where one player leads both exact bids and successful zero bids. Assert that the player receives The Lookout and the next best still-eligible player receives Zero-bid Royalty. Assert no player ID and no award kind appears twice.

- [ ] **Step 2: Append criterion and tie-break tests**

Cover each rule independently:

- The Lookout: maximum exact bids and at least one;
- Zero-bid Royalty: maximum successful zero bids and at least one;
- The Comeback: `halfwayRank - finalRank` at `Math.ceil(totalRounds / 2)`, strictly positive;
- The Reckless: maximum sum of recorded bids and at least one recorded round;
- The Castaway: minimum canonical single-round score and at least one recorded round;
- equal criterion values resolved by higher final total;
- equal criterion and final totals omitting that award even when a lower-valued unique candidate exists (never fall through to third place);
- a previously awarded criterion leader being filtered before the next award's winner is selected;
- in-progress, empty, and no-recorded-round games returning `[]`.

Run `npm run test:stats` and confirm the new award assertions FAIL.

- [ ] **Step 3: Implement the priority-ordered award selector**

Compute final standings once. For each award in the approved order:

1. build candidates only from real players with recorded data;
2. exclude IDs already awarded;
3. find the best criterion value (minimum only for Castaway, maximum otherwise);
4. among criterion ties, retain the highest final total;
5. if more than one player still remains, emit no award;
6. otherwise emit the award and reserve that player ID.

Use `standings(game, Math.ceil(game.totalRounds / 2))` for halfway ranks and `playerScoreHistory(...).total` for Castaway. Do not call `scoreRound` directly or copy its rules.

- [ ] **Step 4: Re-run tests and typechecking**

```bash
npm run test:stats
npm run typecheck
```

Expected: PASS with `0 failed`.

- [ ] **Step 5: Commit awards**

```bash
git add src/stats.ts scripts/test-stats.ts
git commit -m "feat: compute deterministic endgame awards"
```

---

### Task 4: Add the complete localization contract

**Files:**
- Modify: `src/i18n/types.ts`
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/de.ts`
- Modify: `src/i18n/zh.ts`
- Modify: `src/i18n/ar.ts`
- Modify: `scripts/test-scoring.ts`

- [ ] **Step 1: Extend `Strings` with the new namespaces**

Import `AwardKind` with `import type` and add the following semantic contract:

```ts
stats: {
  open: string;
  title: string;
  groupTitle: string;
  playerTitle: (name: string) => string;
  emptyTitle: string;
  emptyBody: string;
  leaderboard: string;
  records: string;
  scoreEvolution: string;
  gamesPlayed: string;
  wins: string;
  winRate: string;
  exactBidRate: string;
  zeroBidRate: string;
  averagePoints: string;
  bestScore: string;
  winStreak: string;
  recentGames: string;
  bestFinalScore: string;
  worstRound: string;
  bestExactBid: string;
  unavailable: string;
  chartLabel: (leader: string, rounds: number) => string;
  playerSummary: (games: number, wins: number) => string;
  bidSummary: (successes: number, attempts: number) => string;
  scoreRecordHolder: (name: string, score: number, date: string) => string;
  roundRecordHolder: (
    name: string,
    score: number,
    round: number,
    date: string
  ) => string;
  rateRecordHolder: (
    name: string,
    rate: string,
    successes: number,
    attempts: number
  ) => string;
  recentGame: (date: string, rank: number, score: number) => string;
};

share: {
  button: string;
  preparing: string;
  busy: string;
  fileShared: string;
  textShared: string;
  copiedDownloaded: string;
  copied: string;
  downloaded: string;
  error: string;
  summaryTitle: string;
  awardsHeading: string;
  gameDate: (date: string) => string;
  rankingLine: (medal: string, name: string, score: number) => string;
  awardLine: (award: string, name: string) => string;
  cancelled: string;
};

awards: {
  title: string;
  names: Record<AwardKind, string>;
};

// Add to the existing namespaces:
setup: {
  // ...existing keys
  knownPlayers: string;
  useKnownPlayer: (name: string) => string;
};

results: {
  // ...existing keys
  podiumTitle: string;
  podiumPlace: (rank: number, name: string, total: number) => string;
};
```

Keep raw dates and numeric values outside dictionaries; format them with the active browser locale before passing them into the semantic formatter functions.

- [ ] **Step 2: Fill English and French copy**

Add every key in both base locales. Do not add a profile warning or profile-management copy; the normalized-name collision remains a documented implementation limitation. Keep share status messages short enough to sit under a button.

- [ ] **Step 3: Add complete German, Simplified Chinese, and Arabic copy**

Translate the full contract. Give all five awards idiomatic, creative names in every language rather than retaining English labels or mechanical word-for-word translations. Check Arabic strings in an RTL layout.

- [ ] **Step 4: Strengthen the existing locale checks**

Add one compact loop in `scripts/test-scoring.ts` that asserts every locale has a non-empty name for every `AwardKind`. Do not duplicate the full `Strings` type at runtime.

- [ ] **Step 5: Verify completeness**

```bash
npm run typecheck
npm run test:scoring
```

Expected: all five dictionaries satisfy `Strings`; release-note array checks still PASS.

- [ ] **Step 6: Commit localization**

```bash
git add src/i18n scripts/test-scoring.ts
git commit -m "feat: localize game memory and endgame copy"
```

---

### Task 5: Build and integrate the score-evolution chart

**Files:**
- Create: `src/components/ScoreChart.tsx`
- Modify: `src/theme.ts`
- Modify: `src/screens/GameScreen.tsx`
- Modify: `src/screens/ResultsScreen.tsx`

- [ ] **Step 1: Add the shared eight-player palette**

Export an ordered `scoreSeriesColors` tuple from `src/theme.ts`. Use eight distinct colors that remain legible against `colors.card`/`colors.bg`; both SVG and canvas must index this same tuple by player order.

- [ ] **Step 2: Implement the inline-SVG component**

Have `ScoreChart` accept `game: Game`, derive `cumulativeScoreSeries(game)`, and return `null` until the union of recorded round numbers contains at least two rounds.

Use a fixed LTR `viewBox` and responsive `width="100%"` with a height near 200 px. Include:

- plot padding for axis labels;
- X positions based on actual recorded round numbers;
- a Y domain containing zero plus every cumulative total, with padding for a flat domain;
- a marked zero line;
- one polyline/path per player and optional point markers;
- compact round and min/zero/max labels;
- a visible localized `t.stats.scoreEvolution` heading;
- `<svg role="img" aria-label={...}>` and a matching `<title>`;
- a normal React Native `View`/`Text` legend that wraps up to eight entries.

Determine the current leader from canonical standings at the last recorded round and build the localized label with `t.stats.chartLabel`. Set `dir="ltr"` plus explicit LTR direction styling on the SVG and legend container so Arabic document direction cannot reverse chronology or player-color order; allow each player-name text node to use its natural writing direction. Set the root to `alignSelf: "stretch"` so it fills centered results content.

- [ ] **Step 3: Put the live chart inside a scrollable Total score card**

In `GameScreen`, move the existing total heading and compact standings strip from the fixed area below the main `ScrollView` into a bordered, full-width card at the end of that scroll content, after the tricks hint. Add `ScoreChart` beneath the strip; it self-hides for zero or one recorded round.

Keep current total semantics unchanged: the board still uses the persisted `game`, so an uncommitted displayed round remains excluded. In the desktop two-column layout, make the card span both columns. Do not place a 200 px chart in the fixed footer above the score button.

- [ ] **Step 4: Add the finished chart to results**

In `ResultsScreen`, render `ScoreChart` after the winner/celebration area and before the full standings card. Keep the standings tap targets and `ScoreBreakdownModal` unchanged.

- [ ] **Step 5: Check SVG/DOM typing and existing tests**

```bash
npm run typecheck
npm run test:stats
npm run test:responsive
```

Expected: PASS with no SVG dependency added.

- [ ] **Step 6: Commit chart integration**

```bash
git add src/components/ScoreChart.tsx src/theme.ts src/screens/GameScreen.tsx src/screens/ResultsScreen.tsx
git commit -m "feat: chart score evolution by round"
```

---

### Task 6: Add the podium, awards display, and reduced-motion celebration

**Files:**
- Create: `src/components/Podium.tsx`
- Modify: `src/screens/ResultsScreen.tsx`

- [ ] **Step 1: Build the static podium and awards layout**

Accept precomputed `rows: readonly Standing[]` and `awards: readonly GameAward[]`. Render `t.results.podiumTitle`, then take the first three canonical standing rows. Keep source/accessibility order canonical, but assign visual flex `order` values so row 0 is centered, row 1 is left, and row 2 is right (normal visual order 2nd/1st/3rd); a two-player podium retains an empty right placeholder for balance. Derive step height and medal from the actual `row.rank`, so `1,1,3` and `1,2,2` ties keep equal heights and announce the same shared place. Truncate long names on narrow screens.

Give the component root `alignSelf: "stretch"`, an explicit width, and `position: "relative"`; Results centers its children, so these styles are required for a stable three-column row and bounded absolute confetti overlay. Keep physical column direction LTR under Arabic while allowing each name to use its natural writing direction.

Below the steps, render the awarded player's name with `t.awards.names[award.kind]` in priority order. Let the row wrap and render fewer than five items when criteria or tie rules omit awards.

- [ ] **Step 2: Detect reduced motion safely**

Add an SSR-safe internal hook around:

```ts
window.matchMedia("(prefers-reduced-motion: reduce)")
```

Initialize static values when reduction is requested, subscribe to media changes with modern and legacy listener fallbacks, and remove listeners on unmount. If the preference changes to reduced while motion is active, immediately stop animations/timers, set the podium to its final static state, and remove confetti.

- [ ] **Step 3: Add the staggered podium entrance**

Use one `Animated.Value` per visible step for opacity and vertical translation. Start one `Animated.stagger` sequence on mount with `useNativeDriver: false`, matching the existing web animation convention. Stop animations in cleanup.

- [ ] **Step 4: Add a two-second decorative confetti burst**

Generate a small fixed set of particle descriptors once per mount, animate them across the podium overlay, and remove/stop them after roughly two seconds. The overlay must not intercept input and must be hidden from accessibility. When reduced motion is active, create no particles and run no entrance animation.

- [ ] **Step 5: Integrate the celebration into results**

Compute `rows`, `winner`, and `gameAwards(game)` once in `ResultsScreen` (use `useMemo` keyed by `game`). Render in this order:

1. existing chest, title, and winner headline;
2. `Podium` (including awards);
3. `ScoreChart`;
4. existing full standings list.

The full list remains interactive for every player. Do not remove the existing treasure art, score breakdown, install prompt, or action buttons.

- [ ] **Step 6: Verify typing and domain behavior**

```bash
npm run typecheck
npm run test:stats
```

Expected: PASS.

- [ ] **Step 7: Commit the celebration**

```bash
git add src/components/Podium.tsx src/screens/ResultsScreen.tsx
git commit -m "feat: celebrate finished games with podium and awards"
```

---

### Task 7: Render and share the end-of-game recap

**Files:**
- Create: `src/shareRecap.ts`
- Modify: `src/screens/ResultsScreen.tsx`

- [ ] **Step 1: Define the share inputs and outcome contract**

Export a pure text builder, a PNG renderer, and the cascade coordinator. Pass the already-computed game awards, active `Strings`, browser locale, and RTL flag from `ResultsScreen`; do not use React hooks inside the module.

Use a typed outcome such as:

```ts
type ShareRecapOutcome =
  | "file-shared"
  | "text-shared"
  | "copied-downloaded"
  | "copied"
  | "downloaded"
  | "cancelled";
```

Hard-code the canonical viral-loop URL:

```ts
export const APP_URL =
  "https://gabrielctn.github.io/skull-king-score-keeper/";
```

Never derive it from `window.location`, which would share localhost during verification.

- [ ] **Step 2: Build the localized text summary before canvas work**

Create a concise text block containing the localized recap heading/date, medal ranking from `standings(game)`, awarded names/players, and `APP_URL`. Use `t.share.gameDate`, `rankingLine`, and `awardLine` so non-English punctuation/word order is not assembled ad hoc. Use `game.updatedAt`, matching home history. Building text first ensures a canvas failure can still reach text sharing and clipboard fallback.

- [ ] **Step 3: Draw the 1080×1350 PNG**

Guard DOM globals at call time, create a canvas with exact backing dimensions, and use system fonts only. Draw:

- theme-colored background and localized app title/date;
- top three standings with medals, names, and totals;
- a mini cumulative score curve using `cumulativeScoreSeries` and `scoreSeriesColors`;
- localized awards in priority order;
- the canonical app URL footer.

Include zero in chart scaling, skip the mini curve cleanly below two recorded rounds, fit/truncate long names, and set canvas direction/alignment for Arabic. Convert with an awaited `canvas.toBlob(..., "image/png")` wrapper and reject a null blob.

- [ ] **Step 4: Pre-render and cache the PNG before the button can be pressed**

Web Share requires transient user activation. In `ResultsScreen`, build text synchronously with `useMemo`, then start `renderShareRecapPng` in an effect keyed by game/language/awards. Store a three-state result: `"preparing"`, `{ blob }`, or `"failed"`. Disable the share button with `t.share.preparing` only while preparation is pending; a canvas failure enables text-only sharing.

Do not await canvas encoding inside the press handler before the first `navigator.share()` invocation. Ignore stale render completion after the effect cleans up.

- [ ] **Step 5: Implement the activation-safe capability cascade**

The coordinator accepts already-built text plus `Blob | null`. On the original button call stack, before its first `await`:

1. when a PNG exists, synchronously construct `skull-king-recap-YYYY-MM-DD.png`; if `navigator.canShare({ files: [file] })` is true, immediately invoke `navigator.share({ title, files: [file], text })`;
2. only when file share was not invoked (no PNG/File support, `canShare` false, or a pre-call capability error), immediately invoke `navigator.share({ title, text })` if available;
3. if no share method was invoked, or an invoked share rejects for a non-cancellation reason, attempt clipboard and PNG download independently.

An invoked share consumes activation, so do not make a second `navigator.share()` call after the first invocation rejects; go directly to copy/download. Treat an `AbortError` as user cancellation and return `"cancelled"` rather than unexpectedly copying or downloading.

Try `navigator.clipboard.writeText` first, then a hidden textarea plus `document.execCommand("copy")`; the latter counts as success only when it returns `true`. Reuse the safe browser-download pattern from `src/backup.ts`: Blob URL, hidden anchor with `download`, click/remove, and `URL.revokeObjectURL` in `finally`.

If canvas fails but copying succeeds, return `"copied"`; if copying fails but PNG download succeeds, return `"downloaded"`. Throw only when no fallback completed. The module must remain safe to import when `document`, `navigator`, `File`, or `URL.createObjectURL` is absent.

- [ ] **Step 6: Add ResultsScreen share state and UI**

Place a full-width, gold-accented Share recap action directly after the recap chart and before the potentially long full standings list, visually tying the viral CTA to the recap while leaving the existing game-flow actions unchanged. Follow `SettingsScreen`'s data-action pattern:

- `shareBusy` disables repeated presses and exposes disabled accessibility state;
- a success/error message is cleared before each attempt;
- the outcome maps to the corresponding localized confirmation;
- cancellation clears or shows only the neutral `t.share.cancelled` message;
- failures use `t.share.error`;
- the status line uses positive/negative colors and `accessibilityRole="alert"`.

Pass the same memoized awards displayed by `Podium` into the share renderer. Keep install-prompt state independent.

- [ ] **Step 7: Check type safety and production bundling**

```bash
npm run typecheck
npm run build:web
```

Expected: both commands PASS without a new package or service-worker source change.

- [ ] **Step 8: Commit recap sharing**

```bash
git add src/shareRecap.ts src/screens/ResultsScreen.tsx
git commit -m "feat: share a finished-game recap"
```

---

### Task 8: Add the cross-game statistics screen and home route

**Files:**
- Create: `src/screens/StatsScreen.tsx`
- Modify: `src/screens/HomeScreen.tsx`
- Modify: `App.tsx`

- [ ] **Step 1: Build the screen shell around App's authoritative history**

Mirror the `SettingsScreen` shell: `SafeAreaView`, centered responsive header, back affordance, and scroll content bounded by `layout.formMaxWidth`.

Accept `gameHistory: Game[]` plus `onBack`. App already calls `loadGameHistory()` once during startup and immediately updates this in-memory list on finish, delete, and import; consuming it avoids racing the asynchronous history save with a second storage read. Memoize `aggregateStats(gameHistory)`.

- [ ] **Step 2: Render the empty state**

When no finished game contributes players, show the localized empty title/body and a back affordance. In-progress or degenerate no-record history must not make the empty state disappear.

- [ ] **Step 3: Render the group leaderboard and records**

Render aggregate rows in the order already supplied by `aggregateStats`. Each row shows name, wins, win rate, and games played, uses `accessibilityRole="button"` plus a complete localized label/hint, and selects the normalized identity. Mark screen/section titles as headings where React Native web supports it.

Below it, render cards for best final score, worst single round, and best exact-bid percentage. Handle nullable records with localized unavailable copy, format dates with `browserLocale(lang)`, and pass values through the typed `scoreRecordHolder`, `roundRecordHolder`, or `rateRecordHolder` functions rather than concatenating English punctuation.

- [ ] **Step 4: Render the local player-detail view**

Store `selectedIdentity: string | null`. In detail mode, show:

- games/wins and win rate;
- exact-bid percentage with successes/attempts;
- zero-bid success with successes/attempts;
- average points, best score, and current streak;
- newest-first recent games with localized date, rank/win, and final score.

Use `t.stats.playerSummary`, `bidSummary`, and `recentGame` for combined phrases and accessibility labels.

The header back action clears selection first; only group-mode back returns home. When replacing the group with detail content, move accessibility focus to the detail heading or announce the localized player title so keyboard/screen-reader users receive the context change. Do not add a normalized-name warning or profile-management control.

Format percentages with `Intl.NumberFormat(browserLocale(lang), { style: "percent", maximumFractionDigits: 0 })` and average points with a locale-aware number formatter capped at one decimal. Render `t.stats.unavailable` for `null` rates/records.

- [ ] **Step 5: Add the home trophy action**

Add `onOpenStats` to `HomeScreen`. Replace the standalone absolute gear button with an absolute `topActions` row containing two shared 44×44 icon buttons: 🏆 and ⚙. Give the trophy `t.stats.open` as its accessibility label and preserve safe-area spacing/borders.

- [ ] **Step 6: Route the new screen**

In `App.tsx`:

- import `StatsScreen`;
- extend `Screen` with `"stats"`;
- pass `onOpenStats={() => setScreen("stats")}` to home;
- render `<StatsScreen gameHistory={gameHistory} onBack={handleHome} />` alongside settings.

Do not add a navigation package or modal.

- [ ] **Step 7: Verify the screen compiles and domain tests remain green**

```bash
npm run typecheck
npm run test:stats
npm run test:responsive
```

Expected: PASS.

- [ ] **Step 8: Commit stats navigation and UI**

```bash
git add src/screens/StatsScreen.tsx src/screens/HomeScreen.tsx App.tsx
git commit -m "feat: browse group and player statistics"
```

---

### Task 9: Add setup autocomplete from known players

**Files:**
- Modify: `src/screens/SetupScreen.tsx`
- Modify: `App.tsx`
- Test: `scripts/test-stats.ts`

- [ ] **Step 1: Supply the live in-memory history**

Add `gameHistory: Game[]` to `SetupScreen` props and pass the already loaded `gameHistory` from `App.tsx`. Do not reread AsyncStorage; App state includes recent unsaved-in-the-debounce-window updates.

- [ ] **Step 2: Derive focused-field suggestions**

Track `focusedPlayerId`. Memoize `playerNameSuggestions(gameHistory, players.map(({ name }) => name))`, so every non-empty name already entered in this setup is excluded by normalized identity.

Suggestions use finished and in-progress past games, most recent first. Do not change player IDs or introduce profiles.

- [ ] **Step 3: Render and select suggestion chips safely**

Wrap each horizontal player row in a vertical container. Immediately below only the focused input, render the localized known-player label and a horizontal, scrollable row of chips outside the crowded reorder controls. Keep every known identity available without allowing a long history to expand the setup form by dozens of wrapped rows; the newest suggestions appear first.

Tapping a chip calls the existing `setName(focusedPlayerId, suggestion)`. Because input blur fires before a browser click, either select on press-in or defer blur with a short cancellable timer; preserve keyboard activation via the normal button press path and clean up any timer on unmount.

Cap only the chip's visual width and use a one-line label for unusually long imported names; do not silently truncate the selected identity value to the current input's 20-character typing limit.

Keep `keyboardShouldPersistTaps="handled"`, 44 px targets, narrow-screen reorder behavior, and the existing two-player/start logic unchanged.

- [ ] **Step 4: Re-run focused tests and typechecking**

```bash
npm run test:stats
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit autocomplete**

```bash
git add src/screens/SetupScreen.tsx App.tsx
git commit -m "feat: suggest known players during setup"
```

---

### Task 10: Publish release 1.3.0 metadata and notes

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app.json`
- Modify: `src/releases.ts`
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/de.ts`
- Modify: `src/i18n/zh.ts`
- Modify: `src/i18n/ar.ts`
- Modify: `scripts/test-scoring.ts`
- Modify: `README.md`

- [ ] **Step 1: Bump every app/package version**

Set:

- `package.json` version to `1.3.0`;
- `app.json` Expo version to `1.3.0`;
- `CURRENT_RELEASE` to `1.3.0`;
- `CURRENT_RELEASE_DATE` to `2026-07-18`.

Synchronize both root version fields in `package-lock.json` to `1.3.0`; they are currently stale at 1.1.0. Running `npm install --package-lock-only --ignore-scripts` after the package bump is acceptable, but inspect the diff and keep dependency versions unchanged.

- [ ] **Step 2: Replace all five localized What's new lists**

Use four synchronized items covering:

1. cross-game player statistics and memory;
2. round-by-round score curves;
3. the shareable recap;
4. podium, confetti, and awards.

Keep the existing automatic-update explanation outside the item list.

- [ ] **Step 3: Lock the four-item release-note contract**

In `scripts/test-scoring.ts`, add an explicit assertion that `en.whatsNew.items.length === 4`; the existing cross-locale equality loop then proves every locale has four items rather than merely matching one another.

- [ ] **Step 4: Remove the stale fixed test count from documentation**

`README.md` currently claims exactly 285 checks. Replace that brittle number with wording that the project is covered by the complete automated suite, or update it from the actual final `npm test` summaries after the new stats checks exist.

- [ ] **Step 5: Verify release invariants**

Confirm explicitly:

- `GAME_SCHEMA_VERSION` is still 6;
- no backup format constant changed;
- no dependency was added;
- `web/service-worker.js` is untouched.

- [ ] **Step 6: Run release-facing checks**

```bash
npm run typecheck
npm run test:scoring
npm run test:stats
```

Expected: all commands PASS and every locale has four release-note items.

- [ ] **Step 7: Commit the release metadata**

```bash
git add package.json package-lock.json app.json src/releases.ts src/i18n scripts/test-scoring.ts README.md
git commit -m "chore: prepare release 1.3.0"
```

---

### Task 11: Verify all branches, layouts, accessibility, and offline output

**Files:**
- Modify only if verification reveals defects:
  - `src/stats.ts`
  - `src/shareRecap.ts`
  - `src/components/ScoreChart.tsx`
  - `src/components/Podium.tsx`
  - `src/screens/HomeScreen.tsx`
  - `src/screens/SetupScreen.tsx`
  - `src/screens/GameScreen.tsx`
  - `src/screens/ResultsScreen.tsx`
  - `src/screens/StatsScreen.tsx`
  - `src/i18n/*`

- [ ] **Step 1: Run focused and complete automated validation**

```bash
npm run test:stats
npm run typecheck
npm test
npm run build:web
```

Expected: every command exits successfully; all test summaries report `0 failed`; the production export resolves SVG/canvas/Web Share code.

- [ ] **Step 2: Start the app and create deterministic browser fixtures**

Run `npm run web`, then use the existing `/verify` workflow. Create or inject enough normalized history to cover:

- no finished games;
- at least three finished games with recurring accent/case variants;
- a shared win;
- negative scores and a comeback;
- two, three, and eight-player games;
- at least one unfinished game whose names are suggestions but not stats.

- [ ] **Step 3: Verify chart behavior and responsive placement**

At 390×844 and a desktop width:

- zero/one recorded round hides the chart;
- two or more show correct round labels, zero baseline, negative range, leader label, and wrapping legend;
- the Game screen's Total score card scrolls without covering the score button;
- Results keeps podium/chart/list within the content width;
- eight colors remain distinguishable and names truncate/wrap safely.

- [ ] **Step 4: Verify podium, ties, and reduced motion**

Confirm normal top-three order, rank medals, equal-height tied steps, awards priority, and the still-interactive full standings list. Emulate `prefers-reduced-motion: reduce` and confirm a static podium with no confetti; restore normal motion and confirm one short burst per mount.

- [ ] **Step 5: Exercise every share cascade branch**

With browser stubs/interception where needed, verify:

- file sharing when `canShare({ files })` succeeds;
- text sharing when the file branch is unavailable and therefore was not invoked;
- a rejected non-cancelled share going to copy/download without a second activation-bound share call;
- `AbortError` leaving the action cancelled without a surprise download;
- clipboard plus intercepted PNG download when Web Share is absent;
- copied/shared text containing medal ranking, localized awards, and the canonical URL;
- `document.execCommand("copy") === false` being treated as copy failure rather than success;
- canvas failure still reaching text/clipboard fallback;
- share/copy failures still downloading when a PNG exists;
- the button remaining disabled only while the PNG is pre-rendering and the first share invocation occurring directly from the click;
- exact downloaded dimensions of 1080×1350 and readable title/date/podium/curve/awards/canonical URL;
- busy state prevents double activation and status messages announce success/error.

- [ ] **Step 6: Verify stats navigation and setup autocomplete**

Check trophy → group leaderboard → player detail → local back → home back, correct empty state, record cards, localized rates, streak, and recent ordering. In setup, confirm newest-first deduplication, exclusion of names already entered, tap/keyboard fill despite blur, and horizontal chip scrolling on narrow screens.

- [ ] **Step 7: Verify localization and RTL**

Inspect Arabic plus at least one LTR locale. Confirm chronology remains left-to-right in both curves, Arabic text/canvas alignment is readable, award names are localized, podium/legend layout does not reverse incorrectly, and accessibility labels name leaders/places/actions.

- [ ] **Step 8: Verify the production PWA remains offline-capable**

Serve the production export under its configured `/skull-king-score-keeper/` base path, load it once, switch the browser offline, and reopen the app. Confirm stats, chart, podium, and recap generation still work from cached local code/data. No network request or service-worker source edit should be necessary.

- [ ] **Step 9: Apply only observed fixes and rerun the full suite**

After any correction, rerun:

```bash
npm test
npm run build:web
```

- [ ] **Step 10: Commit verification fixes only if needed**

If no corrections were needed, skip this commit. Otherwise stage only the measured fixes and commit:

```bash
git commit -m "fix: polish game memory and endgame experience"
```
