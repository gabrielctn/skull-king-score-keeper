# Rascal scoring ("Les scores selon Rascal") — design

**Date:** 2026-07-18
**Source of truth:** Grandpa Beck's / Blackrock Games official 2022 French
rulebook, pages 18–20 ("Les scores selon Rascal" + "Règles optionnelles de
Rascal"), the same rulebook the classic engine is built on.

## Goal

Let a table choose, at game setup, between the two official scoring systems:

- **Skull King scoring** (classic, already implemented): bid-based, negative
  points possible.
- **Rascal scoring**: every player has the same potential each round —
  **10 points per card dealt** — and earns all / half / none of it based on
  bid accuracy. Never negative from the bid itself.

Both systems share bids, tricks, bonuses, Loot, Kraken, structures, the
2-player ghost, stats and backups.

## Official rules being implemented

Per round, with `diff = |tricks − bid|` and `potential = 10 × cards dealt`:

| Outcome | Rulebook name (FR / EN) | Bid points | Bonus points |
|---|---|---|---|
| `diff === 0` | Coup direct / Direct hit | full potential | full |
| `diff === 1` | Frappe à revers / Glancing blow | half potential | **half** |
| `diff >= 2` | Échec cuisant / Total whiff | 0 | none |

There is **no special zero-bid rule** in Rascal scoring: the rulebook example
explicitly gives the same potential "que vous misiez sur 0, 3, 1 ou 5".

**Optional Rascal rules** (rulebook p.20, table-level opt-in): after bidding,
each player declares simultaneously:

- **Chevrotine (main ouverte) / Buckshot (open hand):** standard Rascal
  scoring above.
- **Boulet de canon (poing fermé) / Cannonball (closed fist):**
  **15 points per card dealt** on an exact bid, **0 otherwise** — and bonus
  points also require the exact bid (no half tier).

Worked examples used as test fixtures:

- p.19 Exemple A: 3 cards, everyone exact → +30 each.
- p.19 Exemple B: 4 cards → direct +40, écart 1 → +20, écart 2 → 0.
- p.20: 6 cards, bid 3 — buckshot: exact 60 / écart 1 → 30;
  cannonball: exact 90 / écart 1 → 0.

### Interaction with the app's conditional extras

"Les mêmes règles s'appliquent aux bonus" applies to **capture bonuses**
(colored/black 14s, mermaid/pirate/Skull King captures, leviathans, the
Second): full on a direct hit, half on a glancing blow, none on a whiff
(cannonball: full on exact, else none). All capture values are even, so the
half tier always yields integers.

Extras that already carry their own exact-bid condition keep it, unchanged in
both modes:

- **Loot alliance (+20):** requires both allies exact — a glancing player has
  already failed the alliance, so no half tier can arise.
- **Expansion 7/8 (−5/+5):** the 2025 expansion's own rule is "exact bid
  only"; a half tier cannot arise.
- **Rascal of Roatán pirate wager (0/10/20):** official FAQ — won only on an
  exact bid, lost otherwise (the only way Rascal-mode round points can go
  negative, which is the pirate card's own rule).

## Approaches considered

1. **Mode-aware pure engine (chosen).** Add `scoringMode` to `Game`, thread it
   through `scoreRoundBreakdown`. One source of truth, the itemized breakdown
   and history stay consistent, tests remain pure-function.
2. Parallel `rascalScoring.ts` module with switches at every call site —
   duplicates the breakdown/Loot machinery; rejected.
3. Score post-processing (transform classic totals) — impossible: the two
   systems disagree on sign and magnitude per line; rejected.

## Data model (schema v6 → v7)

```ts
// types.ts
export type ScoringMode = "classic" | "rascal";
export type RascalBet = "buckshot" | "cannonball";

interface Game {
  // ...
  /** Official scoring system chosen at setup ("Les scores selon..."). */
  scoringMode: ScoringMode;          // default "classic"
  /** Rascal optional rules: per-round Chevrotine/Boulet declarations. */
  rascalBets: boolean;               // default false
}

interface RoundEntry {
  // ...
  /** Rascal optional rules: this player's declaration for the round. */
  rascalBet: RascalBet;              // default "buckshot"
}
```

- `GAME_SCHEMA_VERSION` 6 → 7.
- `storage.normalizeGame`: default `scoringMode: "classic"`,
  `rascalBets: false`, `rascalBet: "buckshot"`; force `rascalBet` back to
  `"buckshot"` unless the game is rascal-mode **with** bets on, so stale
  declarations can never affect scores.
- `backup.ts`: validate the two enums + boolean, add the fields to
  `cleanEntry` / `normalizeBackupGame` whitelists. Older backups
  (gameSchemaVersion ≤ 6) import as classic games.
- `createGame(...)` gains trailing optional `scoringMode` / `rascalBets`;
  the rematch path copies both.

## Scoring engine (scoring.ts)

- `RASCAL_POINTS_PER_CARD = 10`, `RASCAL_CANNONBALL_POINTS_PER_CARD = 15`.
- `rascalOutcome(entry): "directHit" | "glancingBlow" | "whiff"`.
- `bidScore(cardsDealt, entry, mode = "classic")`: rascal branch implements
  the table above, reading `entry.rascalBet` for the cannonball rule.
- `scoreRoundBreakdown` / `scoreRound` gain a trailing
  `mode: ScoringMode = "classic"` parameter (all existing call sites and
  tests keep working). In rascal mode capture-bonus items are scaled ×1, ×½
  or ×0; zeroed items keep `applied: false` so the UI shows the "ignored"
  caption, halved items stay `applied: true` with halved points.
- Breakdown output gains `scoringMode`, `rascalOutcome` and `rascalBet` so
  the UI can label rounds without recomputing.
- `playerScoreHistory` passes `game.scoringMode`; totals/standings unchanged.

## UI

- **SetupScreen** (inside the existing customization block, before round
  structures): "Scoring" section with two radio cards mirroring the round
  structure picker — "Skull King scoring" and "Rascal scoring", each with a
  one-line hint. Selecting Rascal reveals a ToggleSwitch row for the optional
  Chevrotine/Boulet rules. Quick Game keeps classic defaults.
- **GameScreen**: in rascal mode the turn banner shows the round's stake
  ("Rascal scoring · 50 pts at stake"). With bets on, each player card gets a
  two-chip selector (🖐 open hand / ✊ closed fist) next to the bid steppers.
  `scoreRound` call sites pass the game's mode.
- **ScoreBreakdownModal**: bid-line labels per mode + outcome (direct hit /
  glancing blow / whiff, and the two cannonball variants); the round status
  badge shows the outcome name with a third "glancing" color; timeline dot
  matches (green / gold / red).
- **RulesModal**: new "Rascal scoring" section (4 entries: the system, the
  three outcomes, bonuses, optional rules), added to the locale sync test.
- **BonusEditor / Loot / stats / awards / share**: unchanged — they read
  breakdown totals and `madeBid`, both still meaningful.

## i18n

New keys in all five locales (en, fr, de, zh, ar), using official terminology
where a localized rulebook exists (fr: Coup direct, Frappe à revers, Échec
cuisant, Chevrotine, Boulet de canon; en: Direct hit, Glancing blow, Total
whiff, Buckshot, Cannonball; de/zh/ar: descriptive translations). The typed
`Strings` contract keeps locales structurally complete.

## Release

Version 1.4.0: bump `package.json` / `app.json` / `releases.ts`, replace
`whatsNew.items` in every locale, adjust the release-note count test.

## Tests (written before the implementation)

1. Rulebook fixtures: Exemples A, B and the p.20 optional-rule example.
2. Zero bids in rascal mode (0/0 → 10×cards; 0/1 → 5×cards; 0/2 → 0).
3. Capture-bonus scaling per outcome, incl. cannonball's exact-only rule.
4. Conditional extras keep exact gates (Loot, 7/8, pirate wager) in rascal.
5. Breakdown integrity: items sum to total; mode/outcome fields; halved and
   ignored lines.
6. Classic mode regression: every existing test unchanged and green.
7. Migration: v6 saves/backups load as classic; rascal fields round-trip
   through backup export/import; invalid `scoringMode`/`rascalBet` rejected.
8. i18n: new structures present in all locales; rules sections stay in sync.
