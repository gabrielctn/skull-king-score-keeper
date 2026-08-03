# Official Bonus Scoring Default Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make exact-bid capture bonuses the official default for new classic games while preserving every existing game's stored scoring behavior.

**Architecture:** Keep `Game.bonusesRequireBid` and its serialized meaning unchanged so old saves, backups, cloud tables, and share links remain compatible. Change only the defaults used by score helpers and new game creation, then expose the inverse house-rule choice (`bonusesOnMiss`) in setup and the in-game rules editor. Rascal scoring and the independent conditions for Loot, special 7/8 cards, and Rascal wagers remain untouched.

**Tech Stack:** TypeScript 5.9, React 19, React Native/Expo 54, Node `tsx` script tests, typed six-locale i18n dictionaries.

## Global Constraints

- Existing classic games keep their stored `bonusesRequireBid` value without migration or reinterpretation.
- Pre-v9 saves continue to normalize to `bonusesRequireBid === false` so their historical scores do not change.
- New classic games use `bonusesRequireBid === true`; Rascal games store `false` and keep their existing tiered bonus calculation.
- The visible option describes the exception: count capture bonuses even when the bid is missed; it is off by default and maps inversely to `bonusesRequireBid`.
- The option covers colored and black 14s, Mermaid/Pirate/Skull King captures, Davy Jones's Locker, and the Second only.
- Loot, special expansion 7/8 cards, Rascal wagers, backup formats, share-code formats, and `GAME_SCHEMA_VERSION = 9` do not change.
- English, French, Spanish, German, Arabic, and Chinese must retain identical typed locale structure.

---

### Task 1: Official Scoring Defaults and Save Compatibility

**Files:**
- Modify: `scripts/test-scoring.ts:1-155, 448-493, 537-554`
- Modify: `src/scoring.ts:10-33, 146-158, 292-318, 413-430, 575-615`
- Modify: `src/types.ts:110-117`
- Modify: `src/storage.ts:39-50, 78-85`
- Test: `scripts/test-scoring.ts`
- Test: `scripts/test-storage.ts:200-235`

**Interfaces:**
- Consumes: existing `scoreRound(cardsDealt, entry, lootBonus?, mode?, bonusesRequireBid?)`, `scoreRoundBreakdown(...)`, `createGame(...)`, and `normalizeGame(raw)` signatures.
- Produces: the same public signatures and persisted `Game` shape, with `true` as the default `bonusesRequireBid` value for classic score helpers and newly created classic games.

- [ ] **Step 1: Read the test-quality rules before editing tests**

Read `superpowers/test-driven-development/writing-good-tests.md` completely. Name the production changes that make the new assertions fail: the three default parameters in `scoreRoundBreakdown`, `scoreRound`, and `createGame` are currently `false`.

- [ ] **Step 2: Write failing scoring tests for the official default and explicit exception**

Replace the old unconditional-default block in `scripts/test-scoring.ts` with assertions equivalent to:

```ts
console.log("\nCapture bonuses require an exact bid by default");
eq(
  "exact bid keeps colored and black 14 bonuses",
  scoreRound(5, E(3, 3, { colored14: 1, black14: true })),
  60 + 10 + 20
);
eq(
  "missed bid loses every capture bonus by default",
  scoreRound(
    5,
    E(3, 5, {
      colored14: 1,
      black14: true,
      mermaidByPirate: 1,
      pirateBySkullKing: 1,
      mermaidCapturesSkullKing: true,
      davyJonesLeviathans: 1,
      secondCaptured: true,
    })
  ),
  -20
);
eq(
  "failed zero bid loses capture bonuses by default",
  scoreRound(9, E(0, 2, { colored14: 1 })),
  -90
);

console.log("\nHouse rule: capture bonuses count after a missed bid");
eq(
  "explicit house rule keeps a capture bonus after a miss",
  scoreRound(5, E(3, 5, { colored14: 1 }), 0, "classic", false),
  -20 + 10
);
eq(
  "explicit house rule keeps a capture bonus after a failed zero bid",
  scoreRound(9, E(0, 2, { colored14: 1 }), 0, "classic", false),
  -90 + 10
);
```

Change the new-game assertions to:

```ts
eq(
  "new classic games require an exact bid for capture bonuses",
  defaultGame.bonusesRequireBid ? 1 : 0,
  1
);
eq(
  "createGame stores the unconditional-bonus house rule",
  createGame(
    rascalPlayers,
    2,
    true,
    false,
    true,
    undefined,
    "classic",
    false,
    false
  ).bonusesRequireBid
    ? 1
    : 0,
  0
);
```

Keep the existing Rascal assertion and pass `false` explicitly in the missed-bid Davy Jones/Second assertion so that it continues to test the optional unconditional behavior instead of the default:

```ts
scoreRound(
  5,
  E(2, 0, { davyJonesLeviathans: 1, secondCaptured: true }),
  0,
  "classic",
  false
)
```

Also remove the explicit final `true` argument from the existing missed-bid
`scoreRoundBreakdown` fixture. Its zero-point, `applied: false`, and preserved
count assertions must exercise the new default rather than an explicit flag.

- [ ] **Step 3: Run the focused test and verify RED**

Run: `npm run test:scoring`

Expected: FAIL because missed bids still receive capture bonuses by default and `createGame(rascalPlayers, 2).bonusesRequireBid` is still `false`. Confirm the failures are assertion mismatches, not syntax or type errors.

- [ ] **Step 4: Implement the minimal default changes**

In `src/scoring.ts`, change the three defaults and correct the rule comments without changing the boolean's serialized meaning:

```ts
export function scoreRoundBreakdown(
  cardsDealt: number,
  entry: RoundEntry,
  lootBonus = 0,
  lootAttempts = Math.floor(lootBonus / BONUS_VALUES.loot),
  lootSelfWins = 0,
  mode: ScoringMode = "classic",
  bonusesRequireBid = true
): RoundScoreBreakdown {
```

```ts
export function scoreRound(
  cardsDealt: number,
  entry: RoundEntry,
  lootBonus = 0,
  mode: ScoringMode = "classic",
  bonusesRequireBid = true
): number {
```

```ts
export function createGame(
  players: Player[],
  totalRounds = 10,
  advancedCards = true,
  twoPlayerGhost = false,
  newExpansion = true,
  cardsPerRound?: number[],
  scoringMode: ScoringMode = "classic",
  rascalBets = false,
  bonusesRequireBid = true
): Game {
```

Update the surrounding comments to say that classic capture bonuses require an exact bid by default and `false` enables the unconditional house rule. Keep `captureBonusScale` unchanged:

```ts
return bonusesRequireBid && !madeBid(entry) ? 0 : 1;
```

In `src/types.ts`, describe `bonusesRequireBid` as the official classic rule and explain that `false` enables the optional unconditional behavior. In `src/storage.ts`, retain this normalization exactly:

```ts
const bonusesRequireBid =
  scoringMode === "classic" && raw.bonusesRequireBid === true;
```

Only revise its comments to document why absent/pre-v9 values intentionally remain `false`; do not bump `GAME_SCHEMA_VERSION`.

- [ ] **Step 5: Run focused scoring and storage checks and verify GREEN**

Run: `npm run test:scoring && npm run test:storage`

Expected: both PASS. The storage output must still include passing checks for pre-v9 `false`, stored classic `true`, Rascal `false`, and invalid non-boolean `false`.

- [ ] **Step 6: Commit the scoring unit**

```bash
git add scripts/test-scoring.ts src/scoring.ts src/types.ts src/storage.ts
git diff --cached --check
git commit -m "Fix official capture bonus defaults"
```

---

### Task 2: Inverted House-Rule Option and Correct Six-Locale Guidance

**Files:**
- Modify: `scripts/test-ux.ts:36-51, 190-245`
- Modify: `scripts/test-scoring.ts:900-930`
- Modify: `src/screens/SetupScreen.tsx:48-56, 122-155, 425-443`
- Modify: `src/components/GameRulesModal.tsx:39-50, 120-144`
- Modify: `src/i18n/types.ts:246-251`
- Modify: `src/i18n/en.ts:255-257, 697-700`
- Modify: `src/i18n/fr.ts:257-259, 709-712`
- Modify: `src/i18n/es.ts:260-262` and the final `rules.bonusEntries` item
- Modify: `src/i18n/de.ts:256-258` and the final `rules.bonusEntries` item
- Modify: `src/i18n/ar.ts:324-326, 717`
- Modify: `src/i18n/zh.ts:239-241, 610`
- Test: `scripts/test-ux.ts`
- Test: `scripts/test-scoring.ts`

**Interfaces:**
- Consumes: persisted `Game.bonusesRequireBid: boolean` from Task 1.
- Produces: typed locale keys `setup.bonusesOnMissTitle` and `setup.bonusesOnMissHint`; setup and in-game switches whose visible value is `!bonusesRequireBid` and whose update writes the inverse back to the game.

- [ ] **Step 1: Write failing UX source checks for the inverse mapping**

Add checks to `scripts/test-ux.ts` equivalent to:

```ts
check(
  "new games keep the unconditional-bonus exception off",
  setupSource.includes(
    "const [bonusesRequireBid, setBonusesRequireBid] = useState(true)"
  ) &&
    setupSource.includes("scoringMode === \"classic\" && !bonusesRequireBid") &&
    setupSource.includes("value={!bonusesRequireBid}") &&
    setupSource.includes("setBonusesRequireBid(!bonusesOnMiss)")
);

check(
  "mid-game bonus exception maps inversely to the persisted official rule",
  gameRulesSource.includes("value={!game.bonusesRequireBid}") &&
    gameRulesSource.includes("bonusesRequireBid: !bonusesOnMiss")
);

check(
  "switching from Rascal to classic selects the official bonus rule",
  /game\.scoringMode === "rascal"\s*&&\s*next\.scoringMode === "classic"/.test(
    gameRulesSource
  ) && gameRulesSource.includes("next.bonusesRequireBid = true")
);
```

Replace the existing positive-option invariant check with one that still verifies Rascal clears the stored classic flag but does not require the obsolete title/key names.

- [ ] **Step 2: Write failing typed-copy checks**

In `scripts/test-scoring.ts`, add an exact title table and assert both the setup option and the official rule entry exist in each locale:

```ts
const bonusOnMissCopy = {
  en: {
    option: "Count bonuses after a missed bid",
    official: "Capture bonuses require an exact bid",
  },
  fr: {
    option: "Compter les bonus malgré une mise ratée",
    official: "Les bonus exigent une mise réussie",
  },
  es: {
    option: "Contar bonificaciones aunque falle el envite",
    official: "Las bonificaciones exigen un envite exacto",
  },
  de: {
    option: "Boni trotz verfehlter Ansage zählen",
    official: "Boni erfordern eine exakte Ansage",
  },
  ar: {
    option: "احتساب المكافآت رغم إخفاق المزايدة",
    official: "تتطلب المكافآت مزايدة دقيقة",
  },
  zh: {
    option: "叫牌失败时仍计入奖励",
    official: "奖励要求叫牌准确",
  },
} as const;

for (const [locale, strings] of Object.entries({ en, fr, es, de, ar, zh })) {
  const expected = bonusOnMissCopy[locale as keyof typeof bonusOnMissCopy];
  eqs(`${locale} bonus exception title`, strings.setup.bonusesOnMissTitle, expected.option);
  eq(
    `${locale} official bonus rule is present`,
    strings.rules.bonusEntries.some((entry) => entry.title === expected.official)
      ? 1
      : 0,
    1
  );
}
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run: `npm run test:ux && npm run test:scoring`

Expected: FAIL because setup still starts with `false`, both switches still map directly to `bonusesRequireBid`, and `bonusesOnMissTitle` does not exist yet.

- [ ] **Step 4: Invert the setup and in-game controls**

In `src/screens/SetupScreen.tsx`, initialize the official stored rule and expose the exception:

```ts
const [bonusesRequireBid, setBonusesRequireBid] = useState(true);
```

```ts
...(scoringMode === "classic" && !bonusesRequireBid
  ? [t.setup.bonusesOnMissTitle]
  : []),
```

```tsx
<Text style={styles.advancedTitle}>{t.setup.bonusesOnMissTitle}</Text>
<Text style={styles.advancedHint}>{t.setup.bonusesOnMissHint}</Text>
<ToggleSwitch
  value={!bonusesRequireBid}
  onValueChange={(bonusesOnMiss) =>
    setBonusesRequireBid(!bonusesOnMiss)
  }
  accessibilityLabel={t.setup.bonusesOnMissTitle}
/>
```

Continue passing `scoringMode === "classic" && bonusesRequireBid` to `createGame`.

In `src/components/GameRulesModal.tsx`, add the classic-mode transition before the existing invariant normalization:

```ts
if (
  game.scoringMode === "rascal" &&
  next.scoringMode === "classic" &&
  updates.bonusesRequireBid === undefined
) {
  next.bonusesRequireBid = true;
}
next.bonusesRequireBid =
  next.scoringMode === "classic" && next.bonusesRequireBid;
```

Render the exception switch with:

```tsx
<ToggleSwitch
  value={!game.bonusesRequireBid}
  onValueChange={(bonusesOnMiss) =>
    apply({ bonusesRequireBid: !bonusesOnMiss })
  }
  accessibilityLabel={t.setup.bonusesOnMissTitle}
/>
```

Use `bonusesOnMissTitle` and `bonusesOnMissHint` for its visible copy. Do not change `BonusEditor`: its `bonusesRequireBid` prop already displays the correct warning only when a missed bid voids captured bonuses.

- [ ] **Step 5: Rename the typed UI keys and replace all localized guidance**

In `src/i18n/types.ts`, replace the old keys with:

```ts
/** Optional rule that awards capture bonuses even after a missed bid. */
bonusesOnMissTitle: string;
bonusesOnMissHint: string;
```

Use the following exact setup copy:

| Locale | `bonusesOnMissTitle` | `bonusesOnMissHint` |
| --- | --- | --- |
| en | `Count bonuses after a missed bid` | `Optional variant: capture bonuses (14s, Mermaids, Pirates, Skull King...) still count after a missed bid. Leave this off to follow the official exact-bid rule.` |
| fr | `Compter les bonus malgré une mise ratée` | `Variante optionnelle : les bonus de capture (14, sirènes, pirates, Skull King...) restent acquis après une mise ratée. Laissez cette option désactivée pour suivre la règle officielle.` |
| es | `Contar bonificaciones aunque falle el envite` | `Variante opcional: las bonificaciones por captura (14, sirenas, piratas, Skull King...) se conservan tras fallar el envite. Déjala desactivada para seguir la regla oficial.` |
| de | `Boni trotz verfehlter Ansage zählen` | `Optionale Variante: Fangboni (14er, Meerjungfrauen, Piraten, Skull King ...) zählen auch nach einer verfehlten Ansage. Ausgeschaltet gilt die offizielle Regel.` |
| ar | `احتساب المكافآت رغم إخفاق المزايدة` | `قاعدة اختيارية: تُحتسب مكافآت الأسر (أوراق 14 وحوريات البحر والقراصنة وSkull King...) حتى بعد إخفاق المزايدة. اتركها متوقفة لاتباع القاعدة الرسمية.` |
| zh | `叫牌失败时仍计入奖励` | `可选变体：叫牌失败后仍计入俘获奖励（14、美人鱼、海盗、Skull King 等）。关闭此选项则遵循官方规则。` |

Replace the final `rules.bonusEntries` item in each locale with the exact
title from the `official` values in Step 2 and the corresponding exact body:

| Locale | Body |
| --- | --- |
| en | `Official rules award capture bonuses only when you make your bid exactly. They go to whoever captures the card, no matter who played it. The setup option enables the opposite variant: capture bonuses still count after a missed bid.` |
| fr | `Selon le livret officiel, les bonus de capture ne sont accordés que si vous réussissez exactement votre mise. Ils vont à celui qui capture la carte, peu importe qui l’a jouée. Une option à la création de la partie permet la variante inverse : les bonus comptent même après une mise ratée.` |
| es | `Según el reglamento oficial, las bonificaciones por captura solo se conceden si aciertas exactamente el envite. Las recibe quien captura la carta, sin importar quién la haya jugado. Una opción al crear la partida permite la variante contraria: las bonificaciones cuentan incluso tras fallar el envite.` |
| de | `Nach den offiziellen Regeln werden Fangboni nur bei exakt getroffener Ansage vergeben. Sie gehen an die Person, die die Karte fängt, unabhängig davon, wer sie gespielt hat. Eine Option beim Erstellen des Spiels aktiviert die umgekehrte Variante: Fangboni zählen auch nach einer verfehlten Ansage.` |
| ar | `وفق القواعد الرسمية، لا تُمنح مكافآت الأسر إلا عند تحقيق المزايدة بدقة. تذهب المكافأة إلى من يأسر الورقة بصرف النظر عمن لعبها. يتيح خيار عند إنشاء المباراة النسخة المعاكسة: تُحتسب مكافآت الأسر حتى بعد إخفاق المزايدة.` |
| zh | `按官方规则，只有准确完成叫牌时才会获得俘获奖励。奖励归俘获该牌的玩家，无论谁打出了它。创建对局时可启用相反的变体：叫牌失败后仍计入俘获奖励。` |

Do not alter the Rascal rule entry or the separate Loot, 7/8, and wager text.

- [ ] **Step 6: Run focused tests, type checking, and verify GREEN**

Run: `npm run test:ux && npm run test:scoring && npm run typecheck`

Expected: all PASS with no stale `bonusesRequireBidTitle` or `bonusesRequireBidHint` references.

Run: `rg -n "bonusesRequireBidTitle|bonusesRequireBidHint|rulebook.*keeps|livret.*conserv" src scripts`

Expected: no matches.

- [ ] **Step 7: Run full regression and production-build verification**

Run: `npm test && npm run build:web && git diff --check`

Expected: the full suite, TypeScript validation, and PWA export/build all PASS; `git diff --check` reports no whitespace errors.

Review `git diff --stat` and `git diff` to confirm no schema bump, share-code change, backup-format change, release-version change, or unrelated edits.

- [ ] **Step 8: Commit the interface and localization unit**

```bash
git add scripts/test-ux.ts scripts/test-scoring.ts \
  src/screens/SetupScreen.tsx src/components/GameRulesModal.tsx \
  src/i18n/types.ts src/i18n/en.ts src/i18n/fr.ts src/i18n/es.ts \
  src/i18n/de.ts src/i18n/ar.ts src/i18n/zh.ts
git diff --cached --check
git commit -m "Present unconditional bonuses as an optional rule"
```

---

### Task 3: Final Behavioral Audit

**Files:**
- Verify only: all files changed by Tasks 1 and 2

**Interfaces:**
- Consumes: the official defaults and inverse house-rule UI delivered by Tasks 1 and 2.
- Produces: evidence that new games, old games, classic scoring, Rascal scoring, localization, and production web output agree with the approved design.

- [ ] **Step 1: Inspect the final repository state**

Run:

```bash
git status --short
git log -3 --oneline
git diff HEAD~2 --check
git diff HEAD~2 --stat
```

Expected: only the planned scoring, UI, i18n, and test files are present across the two implementation commits; no generated `dist/`, `ios/`, dependency, version, or unrelated files are committed.

- [ ] **Step 2: Re-run completion evidence from a clean command**

Run: `npm test && npm run build:web`

Expected: all automated checks pass and the web production build completes successfully.

- [ ] **Step 3: Manually trace the four required data paths**

Confirm from the final code and tests:

```text
New classic game -> bonusesRequireBid true -> missed capture bonus is 0.
New classic game + visible exception on -> bonusesRequireBid false -> missed capture bonus counts.
Loaded old classic game with false -> remains false -> historical totals remain unchanged.
Rascal game -> bonusesRequireBid false -> Rascal direct/glancing/whiff scaling remains authoritative.
```

- [ ] **Step 4: Apply the verification-before-completion checklist**

Invoke `superpowers:verification-before-completion`, verify every completion claim against the fresh command output, and report the exact tests/build run plus the commits created. Do not push unless the user separately requests publication.
