# Game memory & endgame experience — design

Date: 2026-07-18
Status: approved

## Goal

Everything the app does today stops at the end of a game: no statistics, no
charts, no sharing, no memory of players across games. This design adds four
features that turn the scorekeeper into the group's memory and give the
finished game an emotional, shareable payoff:

1. **Cross-game player statistics** — "who is the best pirate among us?"
2. **Score-evolution chart** — the story of the game, round by round.
3. **Shareable end-of-game recap** — the app's viral loop.
4. **Endgame celebration** — podium and confetti on the results screen.

All four ship together as release **1.3.0**.

## Constraints

- **No schema change.** `GAME_SCHEMA_VERSION` stays 6; backups export/import
  are untouched. Statistics are recomputed on the fly from
  `loadGameHistory()` — a few dozen games of 10 rounds is trivial to
  aggregate at screen-open time.
- **No new dependency, no backend.** The app is a web-only offline PWA;
  everything below works offline with the packages already installed.
- Existing engine functions are reused, not duplicated:
  `playerScoreHistory` (cumulative totals per recorded round), `standings`
  (ranking with ties), `scoreRoundBreakdown` (per-round detail).

## Decisions

### Player identity (hybrid)

- `normalizePlayerName(name)`: trim, lowercase, strip accents (NFD),
  collapse internal whitespace. A player's cross-game identity **is** the
  normalized name; the displayed spelling is the most recently used one.
- Only **finished** games feed statistics. Greybeard (two-player ghost) is
  never a `Player`, so it is excluded by construction.
- Documented limitation: two players sharing a normalized name in the same
  game merge into one identity in the stats. No warning UI; the spec of the
  stats screen mentions it in the empty/help text only if needed.
- **Setup autocomplete**: while a player-name field is focused,
  `SetupScreen` shows suggestion chips with known names from past games
  (most recent first, names already entered in this setup excluded). A tap
  fills the field. No profile-management UI anywhere.

### `src/stats.ts` — pure aggregation module

Pure functions taking `Game[]` (or one `Game`) — no storage access, fully
unit-testable:

- **Per-player aggregates**: games played, wins, win rate, exact-bid
  percentage, zero-bid attempts/successes, average points per game, best
  final score, current win streak, recent games list.
- **Wins and ties**: the winner of a game is every player ranked 1 by
  `standings` (shared victories count for each).
- **Group records**: best final score ever, worst single round ever, best
  exact-bid percentage (with the holder's name and the game date where
  relevant).
- **Cumulative series** for the chart (wraps `playerScoreHistory`).
- **Per-game awards** (see below).

### Score chart — `src/components/ScoreChart.tsx`

- **Inline SVG.** The app renders through react-dom (react-native-web,
  web-only), so a component can return a DOM `<svg>` directly: crisp
  vector output, theme colors, zero dependencies.
- One line per player (distinct color palette; legend below), X axis =
  recorded rounds, Y axis auto-scaled with a marked zero line (negative
  totals are common), ~200 px tall, full card width.
- Placement: **ResultsScreen** below the winner headline, and
  **GameScreen** inside the "Total score" card once ≥ 2 rounds are
  recorded.
- Accessibility: the SVG carries an `aria-label` summarizing the current
  leader and round count; the legend is regular text.

### Celebration — ResultsScreen

- **Podium** for the top 3 (steps, medals, names, totals) with a staggered
  entrance animation using React Native `Animated` (works on web).
- **Confetti overlay**: a small hand-rolled particle burst (~2 s), played
  once per mount.
- `prefers-reduced-motion` → static podium, no confetti.
- The existing full standings list stays below the podium (needed from 4
  players up, and it opens the per-player score breakdown as today).

### Awards

Computed in `stats.ts` for one finished game. Deterministic attribution
algorithm: walk the awards in priority order; each award goes to the best
qualifying player **not yet holding an award** (so at most one award per
player and one player per award); ties on a criterion are broken by final
total score, and a still-undecided tie means the award is not given.

Priority order and criteria:

1. **The Lookout** — most exactly-made bids (requires ≥ 1).
2. **Zero-bid Royalty** — most successful zero bids (requires ≥ 1).
3. **The Comeback** — biggest rank improvement between the halfway
   standings (after round ⌈totalRounds / 2⌉) and the final standings
   (requires a strictly positive climb).
4. **The Reckless** — largest sum of tricks bid across the game.
5. **The Castaway** — worst single-round score of the game (consolation
   title, deliberately humorous).

Shown under the podium and embedded in the share image. All five localized.

### Share recap — `src/shareRecap.ts`

- A 1080×1350 PNG drawn with the 2D canvas API: theme background, app
  title and date, podium, mini score curve, awards, and the app URL as a
  footer (the viral loop). System fonts only, so it works offline.
- Sharing cascade on the ResultsScreen "Share recap" button:
  1. `navigator.canShare({ files })` → share the PNG (plus a short text);
  2. else `navigator.share` with a text summary (ranking with medals,
     awards, app URL);
  3. else copy the text summary to the clipboard **and** download the PNG.
- Canvas or share failures fall through to the next step; the button shows
  a small confirmation/error status line like the backup buttons do.

### Stats screen — `src/screens/StatsScreen.tsx`

- Entry point: a 🏆 button on the home screen next to the ⚙ button; new
  `"stats"` value of the `Screen` union in `App.tsx` (screen, not modal,
  matching the app's navigation pattern).
- Loads the history once on mount, aggregates via `stats.ts`.
- **Group view**: player leaderboard (sorted by wins, then win rate, then
  games played) and group record cards.
- **Player detail**: tapping a row switches to a detail view inside the
  same screen (local state + back affordance): games/wins, exact-bid %,
  zero-bid success, average points, best score, current win streak, recent
  games.
- Empty state when no finished game exists.

### Errors and edge cases

- No finished games → stats empty state; chart hidden below 2 recorded
  rounds; awards need a finished game.
- Unrecorded rounds are ignored everywhere (already `playerScoreHistory`'s
  behavior).
- Up to 8 players: legend wraps, podium stays top-3 with the list below.
- Two-player ghost games: ghost excluded by construction; nothing special.
- Old imported saves: `normalizeGame` already sanitizes them; stats code
  stays defensive about short/missing arrays.
- Share APIs absent (desktop browsers) → cascade ends at clipboard +
  download, which always works.

### i18n

New namespaces: `stats.*`, `share.*`, `awards.*`, plus podium strings under
`results.*`. All five locales (fr, en, de, zh, ar) are updated — the
`Strings` type enforces completeness. Award names are creative strings and
get real translations, not literal ones.

### Testing

- New `scripts/test-stats.ts` wired into `npm test`: name normalization,
  identity merging, aggregates, shared wins, award priorities and
  tie-breaks, cumulative series, suggestion ordering, defensive handling
  of degenerate games.
- `npm run typecheck` covers the SVG/canvas typing.
- UI verified through the existing browser verification workflow
  (`/verify`): results screen (podium, chart, share fallback), stats
  screen navigation, setup autocomplete, reduced-motion behavior.

### Release

Version 1.3.0 (package.json, app.json, `releases.ts`) with localized
What's new items covering the four features. The PWA cache version is
content-hashed at build time; no service-worker change.

## Files

- `src/stats.ts` (new) — identity, aggregates, records, awards, series
- `src/shareRecap.ts` (new) — canvas rendering + share cascade
- `src/components/ScoreChart.tsx` (new) — SVG line chart
- `src/components/Podium.tsx` (new) — podium + confetti + awards row
- `src/screens/StatsScreen.tsx` (new) — group view + player detail
- `src/screens/ResultsScreen.tsx` — podium, chart, awards, share button
- `src/screens/GameScreen.tsx` — chart inside the Total score card
- `src/screens/SetupScreen.tsx` — name suggestion chips
- `src/screens/HomeScreen.tsx` — 🏆 stats button
- `App.tsx` — `"stats"` screen routing
- `src/i18n/*` — new strings, five locales
- `scripts/test-stats.ts` (new), `package.json` — test wiring
- `src/releases.ts`, `package.json`, `app.json` — 1.3.0
