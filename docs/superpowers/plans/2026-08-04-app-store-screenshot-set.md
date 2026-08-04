# App Store Screenshot Set Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce and validate thirty-two polished App Store screenshots for Skull King Crew Ledger 1.11.1: eight English and eight French images for both iPhone 6.9-inch and iPad 13-inch, including a dedicated two-player Greybeard's Ghost story.

**Architecture:** Build a deterministic, capture-only fixture from the application's real scoring and statistics code; seed it into disposable Release-build simulators using the native AsyncStorage 2.2.0 disk format; capture the current native UI and current spectator PWA; compose the final assets as reusable components on a new Figma page; then export and validate every PNG with a dependency-free repository check. Production navigation, scoring, cloud, and live-session behavior remain unchanged.

**Tech Stack:** Expo 54, React Native 0.81, React 19, TypeScript 5.9, iOS 26 Simulator/Xcode 26, Node `tsx` scripts, Figma MCP, Playwright for the live spectator source, and dependency-free PNG inspection via Node `zlib`.

## Global Constraints

- Use only fresh Release captures built from version `1.11.1`, build `7`, bundle ID `com.gabrielcretin.skullking`.
- Regenerate the ignored root `ios/` project before building; its current generated metadata is stale at `1.10.2` / build `5`.
- Preserve the Figma `Template` page and frames 1288–1293 unchanged. Add one page named `Skull King 1.11.1 — App Store`.
- Deliver English and French only. Keep identical numbering, visual hierarchy, and feature order across locales and devices.
- Deliver exactly eight final screenshots per locale/device combination, for thirty-two opaque PNGs total.
- Final dimensions are `1320 × 2868` for iPhone 6.9-inch and `2064 × 2752` for iPad 13-inch.
- Use the real app's `GlassSurface` UI plus restrained marketing glass; do not recreate captured application controls or text in Figma.
- Use fictional players Alex, Camille, Morgan, and Sam. Never expose personal data, a working table credential, or a live capability in a final export.
- A temporary live session may exist only long enough to capture the real host and spectator states. Stop it immediately after capture, and replace its QR in Figma with the nonfunctional fixture graphic.
- Seed only disposable simulators named with the `Skull King Capture` prefix. Never touch the user's ordinary simulator containers.
- Keep raw captures outside Git under `/private/tmp/skullking-app-store-1.11.1/`. Commit only scripts, documentation, and the thirty-two final PNGs.
- Do not upload assets to App Store Connect, push Git commits, or change production app behavior in this scope.

## File Map

- Create `src/appStoreScreenshotFixture.ts`: deterministic 1.11.1 game/history fixture and scenario seeds.
- Create `scripts/app-store-screenshots/contracts.ts`: locale, device, shot, copy, raw-source, filename, and output-path contracts.
- Create `scripts/app-store-screenshots/asyncStorageIos.ts`: exact AsyncStorage 2.2.0 manifest/external-file encoder and writer.
- Create `scripts/app-store-screenshots/seedSimulator.ts`: guarded CLI that terminates the app and seeds one disposable simulator.
- Create `scripts/app-store-screenshots/png.ts`: dependency-free PNG metadata and opacity inspection.
- Create `scripts/app-store-screenshots/validateExports.ts`: exact path/count/dimension/opacity validator for final assets.
- Create `scripts/test-app-store-screenshots.ts`: fixture, storage-layout, contract, and PNG-validator regression harness.
- Modify `package.json`: add screenshot test, seed, and validation commands; include the test in `npm test`.
- Create `marketing/app-store/screenshots/README.md`: capture, Figma, export, naming, and refresh instructions.
- Create `marketing/app-store/screenshots/{en-US,fr-FR}/{iphone-6.9,ipad-13}/*.png`: thirty-two final exports.
- Modify the external Figma file `01BZRU2WcGi6MBGGC2UPhh`: add the approved page, reusable components, and thirty-two export frames.

## Screenshot Contract

Use these exact stems in all four final directories:

| # | Stem | English | French | Raw source states |
|---|---|---|---|---|
| 1 | `01-score-every-round` | Score every round. We do the math. | Notez chaque manche. On fait les calculs. | active game, round 5 |
| 2 | `02-follow-scores-live` | Everyone follows the scores live. | Tout l’équipage suit les scores en direct. | host live sheet + spectator standings |
| 3 | `03-crown-the-winner` | Crown the winner. | Couronnez le vainqueur. | results top + chart/awards scroll |
| 4 | `04-crew-hall-of-fame` | Build your crew’s hall of fame. | Créez le palmarès de votre équipage. | statistics top + records scroll |
| 5 | `05-one-shared-ledger` | One crew. One shared ledger. | Un équipage. Un carnet partagé. | settings table + expanded invite |
| 6 | `06-classic-rascal-expansion` | Classic, Rascal and expansion cards. | Classique, Rascal et cartes d’extension. | setup scoring + expansion options |
| 7 | `07-greybeards-ghost` | Two players? Summon Greybeard’s Ghost. | À deux ? Invoquez le fantôme Barbe Grise. | two-player setup + Greybeard game |
| 8 | `08-offline-ad-free` | Every round saved. Offline. Ad-free. | Chaque manche sauvegardée. Hors ligne. Sans pub. | populated home |

The repository locale identifiers are `en` and `fr`; the App Store output directories are `en-US` and `fr-FR`.

---

### Task 1: Encode the Screenshot Contract and Deterministic Fixture

**Files:**
- Create: `scripts/app-store-screenshots/contracts.ts`
- Create: `src/appStoreScreenshotFixture.ts`
- Create: `scripts/test-app-store-screenshots.ts`
- Modify: `package.json`

**Interfaces:**

```ts
export const APP_STORE_SCREENSHOT_LOCALES = ["en", "fr"] as const;
export const APP_STORE_SCREENSHOT_DEVICES = {
  "iphone-6.9": { width: 1320, height: 2868 },
  "ipad-13": { width: 2064, height: 2752 },
} as const;

export type AppStoreScreenshotLocale =
  (typeof APP_STORE_SCREENSHOT_LOCALES)[number];
export type AppStoreScreenshotDevice =
  keyof typeof APP_STORE_SCREENSHOT_DEVICES;

export interface AppStoreScreenshotShot {
  index: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  stem: string;
  headline: Readonly<Record<AppStoreScreenshotLocale, string>>;
  rawSources: readonly string[];
}

export function finalScreenshotPath(
  root: string,
  locale: AppStoreScreenshotLocale,
  device: AppStoreScreenshotDevice,
  stem: string
): string;
```

```ts
export const APP_STORE_FIXTURE_EPOCH =
  Date.parse("2026-08-04T18:00:00.000Z");

export const APP_STORE_FIXTURE_SCENARIOS = [
  "active",
  "greybeard",
  "featured-results",
] as const;

export type AppStoreFixtureScenario =
  (typeof APP_STORE_FIXTURE_SCENARIOS)[number];

export interface AppStoreScreenshotFixture {
  locale: AppStoreScreenshotLocale;
  tableName: string;
  history: Game[];
  activeGame: Game;
  greybeardGame: Game;
  featuredFinishedGameId: string;
}

export interface AppStoreScreenshotSeed extends BackupData {
  scenario: AppStoreFixtureScenario;
  locale: AppStoreScreenshotLocale;
  currentGame: Game;
  history: Game[];
  tableName: string;
  settings: AppSettings;
  seenRelease: string;
  supportPrompt: SupportPromptState;
}

export function createAppStoreScreenshotFixture(
  locale: AppStoreScreenshotLocale
): AppStoreScreenshotFixture;

export function createAppStoreScreenshotSeed(
  locale: AppStoreScreenshotLocale,
  scenario?: AppStoreFixtureScenario
): AppStoreScreenshotSeed;
```

- [ ] **Step 1: Read the test-quality instructions**

Read `superpowers:test-driven-development` and its linked `writing-good-tests.md` completely before editing the harness. The production gap is explicit: neither contract nor fixture module exists.

- [ ] **Step 2: Add the focused command and failing imports**

Add to `package.json`:

```json
"test:app-store-screenshots": "node --import tsx scripts/test-app-store-screenshots.ts"
```

Insert `npm run test:app-store-screenshots` after `npm run test:stats` in the main `test` chain.

Create `scripts/test-app-store-screenshots.ts` using the repository's `passed` / `failed` / `check` / `eq` harness. Import the missing contract and fixture modules normally so the first run fails for the intended reason.

- [ ] **Step 3: Run the focused test and verify RED**

Run: `npm run test:app-store-screenshots`

Expected: a module-not-found error for `scripts/app-store-screenshots/contracts.ts` or `src/appStoreScreenshotFixture.ts`, not a syntax error in the test.

- [ ] **Step 4: Implement the exact eight-shot contract**

In `contracts.ts`, encode the table above, the `en → en-US` and `fr → fr-FR` directory mapping, the two required dimensions, and these raw source IDs:

```ts
[
  ["game-active"],
  ["live-host", "live-spectator"],
  ["results-top", "results-details"],
  ["stats-top", "stats-records"],
  ["settings-invite"],
  ["setup-scoring", "setup-expansion"],
  ["greybeard-setup", "greybeard-game"],
  ["home"],
] as const;
```

`finalScreenshotPath(...)` must return, for example:

```text
marketing/app-store/screenshots/fr-FR/ipad-13/07-greybeards-ghost.png
```

- [ ] **Step 5: Build the canonical fixture through app domain functions**

Use `createGame()` and `emptyBonus()`, overwrite every `Date.now()`-derived field, and pass finished objects through `normalizeUntrustedGame()` before returning them.

Use these stable players and winner sequence:

```ts
const PLAYERS = [
  { id: "alex", name: "Alex" },
  { id: "camille", name: "Camille" },
  { id: "morgan", name: "Morgan" },
  { id: "sam", name: "Sam" },
] as const;

const WINNERS = [
  "camille", "alex", "camille", "morgan",
  "sam", "camille", "alex", "morgan",
  "sam", "camille", "alex", "camille",
] as const;
```

Use stable IDs `app-store-finished-01` through `app-store-finished-12`, weekly timestamps ending at `APP_STORE_FIXTURE_EPOCH`, ten recorded rounds per finished game, and a single untied winner in every game. Set the in-progress IDs to `app-store-active` and `app-store-greybeard`, and set `featuredFinishedGameId` to `app-store-finished-12`.

Build each finished round deterministically. For round `r` (1–10), the designated winner takes all `r` tricks and bids exactly `r`. Of the three remaining players, the player at `r % 3` in clockwise non-winner order bids zero exactly; the other two bid one and take zero tricks. This accounts for every trick, guarantees the designated untied winner, and distributes successful zero bids across every player. Apply the game-specific round-8 bonus block to the designated winner only. Give each player at least three zero bids across the history so both statistics qualification gates are populated.

Use this entry helper:

```ts
function entry(
  bid: number,
  tricks: number,
  bonus: Partial<BonusInput> = {},
  recorded = true
): RoundEntry {
  return {
    bid,
    tricks,
    bonus: { ...emptyBonus(), ...bonus },
    legacyLoot: 0,
    recorded,
    rascalBet: "buckshot",
  };
}
```

Give round 8 of the twelve games these deterministic bonus blocks in order:

```ts
[
  { colored14: 1 },
  { black14: true },
  { mermaidByPirate: 1 },
  { pirateBySkullKing: 1 },
  { mermaidCapturesSkullKing: true },
  { davyJonesLeviathans: 1 },
  { secondCaptured: true },
  { expansion8: 2 },
  { colored14: 2 },
  { black14: true, mermaidByPirate: 1 },
  { pirateBySkullKing: 2 },
  { mermaidCapturesSkullKing: true, black14: true },
]
```

The active round-5 state is exactly:

```ts
active.rounds[4] = {
  alex: entry(2, 1, {}, false),
  camille: entry(2, 2, { colored14: 1, black14: true }, false),
  morgan: entry(0, 0, {}, false),
  sam: entry(1, 2, {}, false),
};
active.lootUses[4] = [{
  id: "app-store-active-loot-r5",
  playedById: "camille",
  boundToId: "morgan",
}];
active.currentRound = 5;
```

Record active rounds 1–4 with no bonuses using these exact trick vectors in player order `[Alex, Camille, Morgan, Sam]`: `[1,0,0,0]`, `[0,1,1,0]`, `[1,0,0,2]`, and `[1,1,2,0]`. Set each bid equal to the corresponding trick count so those rounds are complete. Leave rounds 6–10 as the untouched `createGame()` entries. Keep classic scoring, official exact-bid bonuses, advanced cards, and the new expansion enabled.

The Greybeard round-5 state is exactly:

```ts
greybeard.rounds[4] = {
  alex: entry(2, 2, { colored14: 1 }, false),
  camille: entry(1, 1, {}, false),
};
greybeard.currentRound = 5;
greybeard.twoPlayerGhost = true;
greybeard.advancedCards = false;
```

Record Greybeard rounds 1–4 with real-player trick vectors `[0,0]`, `[1,0]`, `[1,1]`, and `[2,1]`, bids equal to tricks, and no bonuses. Greybeard therefore takes one trick in each of those rounds. Leave rounds 6–10 untouched. The round-5 real-player total is three of five, so `ghostTricks(...)` is exactly two and Greybeard remains outside `game.players`.

Use localized table names and seed metadata:

```ts
const TABLE_NAMES = {
  en: "Friday Night Crew",
  fr: "L’équipage du vendredi",
} as const;

settings: { keepAwake: true },
seenRelease: CURRENT_RELEASE,
supportPrompt: {
  finishedSincePrompt: 0,
  lastPromptAt: APP_STORE_FIXTURE_EPOCH,
  optedOut: true,
},
deletions: {},
```

`active` uses `activeGame`, `greybeard` uses `greybeardGame`, and `featured-results` uses the finished game referenced by `featuredFinishedGameId`. Keep only the twelve finished games in the persisted `history` array.

- [ ] **Step 6: Complete the fixture contracts and verify GREEN**

Assert all of the following in `scripts/test-app-store-screenshots.ts`:

1. Two builder calls serialize identically.
2. English and French game data is identical apart from locale/table name.
3. There are exactly twelve unique finished four-player games and 120 recorded history rounds.
4. Every normal round satisfies `sum(tricks) + discardedTricks === cardsDealt`.
5. `serializeBackup()` then `parseBackup()` preserves the selected current game, history, and table name.
6. Camille has five wins, Alex three, Morgan two, and Sam two.
7. Every player clears `MIN_RATED_ROUNDS` and `MIN_ZERO_BIDS`; exact-bid and zero-bid records are non-null.
8. The featured result has one untied winner and populated awards.
9. Active rounds 1–4 are complete; round 5 is entered but unrecorded and contains one valid Loot alliance.
10. Greybeard has exactly two real players, two ghost tricks in round 5, and never appears as a scoring player.
11. The screenshot contract has exactly eight unique stems and all copy shown in the Screenshot Contract table.
12. The four output combinations resolve to exactly thirty-two unique paths.

Run: `npm run test:app-store-screenshots && npm run typecheck`

Expected: the screenshot harness reports `0 failed`; TypeScript exits without diagnostics.

- [ ] **Step 7: Commit the fixture unit**

```bash
git add package.json src/appStoreScreenshotFixture.ts scripts/app-store-screenshots/contracts.ts scripts/test-app-store-screenshots.ts
git diff --cached --check
git commit -m "Add deterministic App Store screenshot fixture"
```

---

### Task 2: Add the Guarded iOS AsyncStorage Seeder

**Files:**
- Create: `scripts/app-store-screenshots/asyncStorageIos.ts`
- Create: `scripts/app-store-screenshots/seedSimulator.ts`
- Modify: `scripts/test-app-store-screenshots.ts`
- Modify: `package.json`

**Interfaces:**

```ts
export type AsyncStorageEntries = Readonly<Record<string, string>>;

export interface AsyncStorageLayout {
  manifest: Record<string, string | null>;
  files: ReadonlyMap<string, string>;
}

export function asyncStorageFileName(key: string): string;
export function buildAsyncStorageLayout(
  entries: AsyncStorageEntries
): AsyncStorageLayout;
export function writeAsyncStorageLayout(
  dataContainer: string,
  bundleId: string,
  entries: AsyncStorageEntries
): void;
```

```ts
export interface SeedSimulatorOptions {
  udid: string;
  simulatorName: string;
  locale: AppStoreScreenshotLocale;
  scenario: AppStoreFixtureScenario;
  destination: "home" | "continueGame" | "statistics" | "newGame";
}

export function buildSeedEntries(
  options: Pick<SeedSimulatorOptions, "locale" | "scenario">
): AsyncStorageEntries;
```

- [ ] **Step 1: Add failing storage-layout tests**

Extend the focused harness with assertions for:

- Inline storage at exactly 1024 JavaScript characters.
- External storage at 1025 characters.
- Lowercase MD5 filename generation.
- Inline manifest strings versus `null` for external values.
- External-file content equality.
- Exact paths under the app data container.
- Refusal when the simulator name does not start with `Skull King Capture `.
- Exact seed-key set and fake-table identity.

Use these MD5 expectations:

```text
skullking:currentGame    23de68dede465d087edb3ffd085091cd
skullking:gameHistory    ae61df700b16e324c47167cd29307fe1
skullking:gameDeletions  770a39b70d6dede264461c66545b38d0
skullking:lang           879adda3a78cbfeab7420ff9d1d33418
skullking:seenRelease    aad16e0dfe5f2bd16bff3658acb22478
skullking:settings       c36c0fd69bb47d212326ec95a7f4fa48
skullking:supportPrompt  c8a89cb6b811af97bdcdec6d3426f526
skullking:tableName      43ad2a37e67ffcce639fa596c8ccb677
skullking:tables         7e3594786f3d82501220bb90e209e3b5
skullking:cloudOwner     be51e2486c1d835a13887a01164428e1
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:app-store-screenshots`

Expected: module-not-found or missing-export failures for `asyncStorageIos.ts` / `seedSimulator.ts`.

- [ ] **Step 3: Implement AsyncStorage 2.2.0 encoding exactly**

Use the native format from `RNCAsyncStorage.mm`:

```ts
const INLINE_VALUE_THRESHOLD = 1024;

export function asyncStorageFileName(key: string): string {
  return createHash("md5").update(key, "utf8").digest("hex");
}
```

Values whose JavaScript string length is `<= 1024` are strings in `manifest.json`. Longer values set the manifest value to `null` and are written as raw UTF-8 to the MD5 filename. The target directory is exactly:

```text
<data-container>/Library/Application Support/com.gabrielcretin.skullking/RCTAsyncLocalStorage_V1
```

Before replacing that directory, resolve and assert that it is contained by the data container and ends in the exact bundle-specific path. The caller must terminate the app first.

- [ ] **Step 4: Build the exact seed entry set**

Write these ten keys:

```text
skullking:currentGame
skullking:gameHistory
skullking:gameDeletions
skullking:lang
skullking:seenRelease
skullking:settings
skullking:supportPrompt
skullking:tableName
skullking:tables
skullking:cloudOwner
```

Use this deliberately nonexistent local identity for Settings/Invite layout:

```ts
const FIXTURE_OWNER = {
  ownerId: "00000000-0000-4000-8000-000000000111",
  writerKey: "7".repeat(64),
};
```

The one table membership uses the same owner plus the localized table name. It is a syntactically valid but non-production capability; its QR and text are still scrubbed from the final artwork.

- [ ] **Step 5: Implement the guarded simulator CLI**

Add to `package.json`:

```json
"screenshots:seed": "node --import tsx scripts/app-store-screenshots/seedSimulator.ts"
```

The CLI requires all five flags:

```text
--udid <UDID>
--simulator-name "Skull King Capture ..."
--locale en|fr
--scenario active|greybeard|featured-results
--destination home|continueGame|statistics|newGame
```

It must:

1. Verify `package.json`, root `package-lock.json`, and `app.json` all report `1.11.1`, and `app.json` reports build `7`.
2. Refuse any simulator name without the exact prefix.
3. Call `xcrun simctl terminate <UDID> com.gabrielcretin.skullking` with `execFileSync`, allowing only the normal “not running” status.
4. Resolve the data container with `xcrun simctl get_app_container`.
5. Replace only the exact AsyncStorage directory with the tested layout.
6. Set or delete `skullkingcrewledger.appIntents.pendingDestination` in the `com.gabrielcretin.skullking` defaults domain, equivalent to `xcrun simctl spawn <UDID> defaults write com.gabrielcretin.skullking skullkingcrewledger.appIntents.pendingDestination <destination>`.
7. Print the locale, scenario, destination, container, current-game ID, and history count without printing the fake writer key.

- [ ] **Step 6: Verify seeding code and existing storage compatibility**

Run:

```bash
npm run test:app-store-screenshots
npm run test:storage
npm run test:backup
npm run typecheck
```

Expected: all commands exit 0 and each test harness reports `0 failed`.

- [ ] **Step 7: Commit the seeder unit**

```bash
git add package.json scripts/app-store-screenshots/asyncStorageIos.ts scripts/app-store-screenshots/seedSimulator.ts scripts/test-app-store-screenshots.ts
git diff --cached --check
git commit -m "Add guarded App Store simulator seeding"
```

---

### Task 3: Add Dependency-Free Final PNG Validation and Workflow Documentation

**Files:**
- Create: `scripts/app-store-screenshots/png.ts`
- Create: `scripts/app-store-screenshots/validateExports.ts`
- Modify: `scripts/test-app-store-screenshots.ts`
- Modify: `package.json`
- Create: `marketing/app-store/screenshots/README.md`

**Interfaces:**

```ts
export interface PngInspection {
  width: number;
  height: number;
  bitDepth: 8;
  colorType: 2 | 6;
  opaque: boolean;
}

export function inspectPng(buffer: Buffer): PngInspection;
export function validateAppStoreScreenshotExports(root: string): void;
```

- [ ] **Step 1: Add failing PNG tests**

Generate tiny in-memory non-interlaced PNG fixtures inside the test harness and assert:

- Bad signature is rejected.
- RGB is opaque.
- RGBA with every alpha byte `255` is opaque.
- RGBA with one alpha byte below `255` is rejected by the export validator.
- Wrong dimensions are rejected.
- Missing, extra, or misnamed final files are rejected.
- A complete synthetic thirty-two-file tree passes.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:app-store-screenshots`

Expected: missing-module/missing-export failures for `png.ts` or `validateExports.ts`.

- [ ] **Step 3: Implement non-interlaced PNG inspection**

Use only Node built-ins. Verify the eight-byte PNG signature, parse `IHDR` and concatenated `IDAT` chunks, require bit depth 8 and color type 2 (RGB) or 6 (RGBA), require no interlace, inflate with `node:zlib`, and reverse PNG filters 0–4 row by row. For RGBA, inspect every fourth reconstructed byte and require it to be `255`.

Reject indexed, grayscale, 16-bit, and interlaced files with a clear message; Figma's standard exports are 8-bit RGB/RGBA and do not need those variants.

- [ ] **Step 4: Implement the exact final-tree validator**

Add to `package.json`:

```json
"validate:app-store-screenshots": "node --import tsx scripts/app-store-screenshots/validateExports.ts"
```

The validator must derive all expected paths from `contracts.ts`, assert exactly thirty-two PNG files below the four locale/device directories, inspect dimensions and opacity, and print one line per file followed by:

```text
32 App Store screenshots valid
```

- [ ] **Step 5: Write the regeneration README**

Document:

- Source version/build and the two accepted dimensions.
- The disposable-simulator naming guard.
- Fixture and seed commands.
- Raw capture root `/private/tmp/skullking-app-store-1.11.1/`.
- Figma file URL, new page name, section names, and exact export stems.
- The requirement to replace/obscure live and table QR/codes.
- `npm run validate:app-store-screenshots` as the final gate.
- The fact that App Store Connect upload is deliberately manual and out of scope.

- [ ] **Step 6: Verify and commit validation tooling**

Run:

```bash
npm run test:app-store-screenshots
npm run typecheck
git diff --check
```

Expected: tests and typecheck pass; no whitespace errors.

Commit:

```bash
git add package.json marketing/app-store/screenshots/README.md scripts/app-store-screenshots/png.ts scripts/app-store-screenshots/validateExports.ts scripts/test-app-store-screenshots.ts
git diff --cached --check
git commit -m "Add App Store screenshot export validation"
```

---

### Task 4: Regenerate and Verify the 1.11.1 Release Build

**Files:**
- Regenerate, ignored: `ios/`
- Produce, temporary: `/private/tmp/skullking-app-store-1.11.1/DerivedData/`
- Test: built `SkullKingCrewLedger.app/Info.plist`

- [ ] **Step 1: Load the iOS execution instructions**

Read `build-ios-apps:ios-debugger-agent` completely before invoking XcodeBuildMCP. Use it for simulator boot/install/launch/UI inspection rather than inventing unverified UI commands.

- [ ] **Step 2: Confirm the source revision and run the repository gates**

Run:

```bash
git status --short --branch
node -e "const p=require('./package.json');const a=require('./app.json').expo;console.log(p.version,a.version,a.ios.buildNumber,a.ios.bundleIdentifier)"
npm test
npm run build:web
```

Expected metadata line:

```text
1.11.1 1.11.1 7 com.gabrielcretin.skullking
```

Expected: clean worktree, full test suite exit 0, and a successful current web export for the spectator source.

- [ ] **Step 3: Regenerate the stale ignored iOS project**

Run:

```bash
npx expo prebuild --platform ios --clean
cd ios && pod install --repo-update
```

Return to the repository root, then run:

```bash
npm run test:xcode-cloud
rg -n 'MARKETING_VERSION = 1.11.1|CURRENT_PROJECT_VERSION = 7' ios/SkullKingCrewLedger.xcodeproj/project.pbxproj
plutil -p ios/SkullKingCrewLedger/Info.plist
```

Do not continue if any generated file still reports `1.10.2` or build `5`.

- [ ] **Step 4: Build one Release simulator app**

Use workspace `ios/SkullKingCrewLedger.xcworkspace`, scheme `SkullKingCrewLedger`, configuration `Release`, generic iOS Simulator destination, and derived data at:

```text
/private/tmp/skullking-app-store-1.11.1/DerivedData
```

Equivalent command:

```bash
xcodebuild \
  -workspace ios/SkullKingCrewLedger.xcworkspace \
  -scheme SkullKingCrewLedger \
  -configuration Release \
  -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath /private/tmp/skullking-app-store-1.11.1/DerivedData \
  CODE_SIGNING_ALLOWED=NO \
  build
```

The app path is:

```text
/private/tmp/skullking-app-store-1.11.1/DerivedData/Build/Products/Release-iphonesimulator/SkullKingCrewLedger.app
```

- [ ] **Step 5: Inspect the built product, not only generated sources**

Run:

```bash
plutil -p /private/tmp/skullking-app-store-1.11.1/DerivedData/Build/Products/Release-iphonesimulator/SkullKingCrewLedger.app/Info.plist
```

Verify:

```text
CFBundleIdentifier             com.gabrielcretin.skullking
CFBundleShortVersionString     1.11.1
CFBundleVersion                7
```

Confirm the built product contains a non-empty `main.jsbundle`. Old version numbers may legitimately appear in the in-app release-history copy, so version acceptance comes from the built `Info.plist` and the visible-capture audit rather than a bundle-wide string grep.

- [ ] **Step 6: Create and normalize two dedicated simulators**

Use these exact names:

```text
Skull King Capture iPhone 1.11.1
Skull King Capture iPad 1.11.1
```

Prefer the installed current-runtime types:

```text
com.apple.CoreSimulator.SimDeviceType.iPhone-17-Pro-Max
com.apple.CoreSimulator.SimDeviceType.iPad-Pro-13-inch-M5-12GB
com.apple.CoreSimulator.SimRuntime.iOS-26-5
```

If one identifier is unavailable, list current device types/runtimes and select the closest current simulator only if a raw screenshot confirms the required pixel dimensions. Never substitute an enlarged phone screenshot for the iPad set.

Boot, install the same Release `.app`, and normalize each simulator:

```bash
xcrun simctl ui "$UDID" appearance dark
xcrun simctl ui "$UDID" increase_contrast disabled
xcrun simctl ui "$UDID" content_size large
xcrun simctl spawn "$UDID" defaults write com.apple.Accessibility ReduceTransparencyEnabled -bool false
xcrun simctl status_bar "$UDID" clear
xcrun simctl status_bar "$UDID" override --time 9:41 --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4 --operatorName "" --batteryState charged --batteryLevel 100
```

Take one probe PNG from each and verify `1320 × 2868` and `2064 × 2752` before proceeding.

---

### Task 5: Capture Every Fresh English and French Raw State

**Files:**
- Produce, temporary: `/private/tmp/skullking-app-store-1.11.1/raw/{en-US,fr-FR}/{iphone-6.9,ipad-13}/`
- Consume: Release `.app`, deterministic fixture, generated web `dist/`

**Capture matrix:**

| Raw ID | Seed/destination | Required visible state |
|---|---|---|
| `game-active` | `active` / `continueGame` | Round 5, four players, bids/tricks/bonus, real glass header |
| `live-host` | `active` / `continueGame` | Real live-sharing sheet after session start |
| `live-spectator` | current built PWA | Read-only live standings from the same temporary session |
| `results-top` | `featured-results` / `home` | Settled winner and podium |
| `results-details` | same | Score evolution and awards after scrolling |
| `stats-top` | `active` / `statistics` | Table name, summary, leaderboard |
| `stats-records` | same | Qualified fame/record cards after scrolling |
| `settings-invite` | `active` / `home` | Named table and expanded invite panel, fake code only |
| `setup-scoring` | `active` / `newGame` | Four names, customization open, Classic and Rascal visible |
| `setup-expansion` | same | Loot/Rascal and new expansion options visible |
| `greybeard-setup` | `active` / `newGame` | Alex + Camille and enabled Greybeard explanation |
| `greybeard-game` | `greybeard` / `continueGame` | Round 5, ghost turn order and two ghost tricks visible |
| `home` | `active` / `home` | Active game, recent history, real glass top actions |

- [ ] **Step 1: Define raw output paths before launching**

Create the temporary directory tree and use filenames `<raw-id>.png`. Raw sources may exceed the final count, but every file must remain at the native device resolution.

- [ ] **Step 2: Capture stable base screens on iPhone and iPad**

For each device and locale:

1. Run `npm run screenshots:seed --` with the exact UDID, simulator name, locale, scenario, and destination.
2. Launch with `-AppleLanguages '(en)' -AppleLocale en_US` or `-AppleLanguages '(fr)' -AppleLocale fr_FR`.
3. Use XcodeBuildMCP `describe_ui` / accessibility labels to confirm the intended screen and language.
4. Wait for image loading and native transitions to settle; do not use a blind sleep as the readiness check.
5. Capture with `xcrun simctl io <UDID> screenshot --type=png --display=internal --mask=ignored <path>`.

Capture `game-active`, `stats-top`, `stats-records`, `greybeard-game`, and `home` this way. Inspect every raw PNG immediately with `view_image`.

- [ ] **Step 3: Capture the featured results states**

Seed `featured-results` with destination `home`. On Home, target the first finished game using its accessible `Open game from …` / `Ouvrir la partie du …` label. Wait until the podium animation is settled, capture `results-top`, scroll to the chart/award area, confirm headings in the UI tree, and capture `results-details`.

No support prompt may appear because the seed has `optedOut: true`.

- [ ] **Step 4: Capture setup modes without changing production defaults**

Seed `active` with destination `newGame`. Use the real setup UI:

- Enter Alex, Camille, Morgan, and Sam in clockwise order.
- Expand `Customize game` / `Personnaliser la partie`.
- Capture `setup-scoring` with both official scoring choices visible.
- Scroll to the expansion controls and capture `setup-expansion` with `Loot & Rascal wager` / `Butin et pari Rascal` and `New expansion` / `Extension` visible and enabled.

For `greybeard-setup`, reseed/relaunch `newGame`, enter only Alex and Camille, dismiss the keyboard, and capture the default enabled `Greybeard ghost 👻` / `Fantôme Barbe Grise 👻` card. Do not start this draft; the separate seeded Greybeard game supplies the gameplay source.

- [ ] **Step 5: Capture Settings/Invite with a non-production identity**

Seed `active`, launch Home, open Settings using the accessible `Settings` / `Paramètres` action, scroll to Data, and expand `Invite your crew` / `Invitez votre équipage`.

The seeded fake owner produces the authentic code/QR layout but points to no production row. Capture `settings-invite`, then record the exact rectangle containing the QR and code so the Figma replacement covers all capability pixels. Prefer a crop where any transient cloud-status line is outside the final device mask.

- [ ] **Step 6: Capture a temporary real live session and spectator**

Seed `active`, open the live-sharing action, start a session, and wait until the native status pill confirms live. Capture `live-host`.

Read `skullking:liveSession:app-store-active` from the simulator's AsyncStorage layout to obtain the temporary session ID without decoding the QR. Do not print the writer key.

Serve the current Release web export from a temporary base-path directory:

```text
/private/tmp/skullking-app-store-1.11.1/web/skull-king-crew-ledger/
```

Use the Playwright skill to open:

```text
http://127.0.0.1:4173/skull-king-crew-ledger/#live=<temporary-session-id>
```

Set `localStorage['skullking:analyticsConsent'] = 'declined'` before the app renders. Capture the current spectator standings at the corresponding phone/tablet viewport without browser chrome as `live-spectator`.

Wrap the live capture in `try/finally`: immediately return to the native sharing sheet and tap Stop whether capture succeeds or fails. Verify the session is ended before continuing. The final Figma artwork must replace the host QR regardless.

- [ ] **Step 7: Audit all raw captures**

For every raw file, verify:

- Correct locale and native layout.
- Correct device pixel dimensions.
- Current `Skull King Crew Ledger` branding and current 1.11.1 UI.
- No debug/Metro banner, keyboard, support prompt, changelog, cookie banner, personal data, VPN badge, or refresh spinner.
- Glass blur is genuinely translucent; Reduce Transparency did not fall back to opaque cards.
- French text is fully visible.
- Greybeard is visibly non-scoring.

Delete and recapture only a failed raw file. Do not compensate for clipped or stale native UI in Figma.

---

### Task 6: Build the Reusable Figma Page and Component System

**External file:**
- Modify: Figma file `01BZRU2WcGi6MBGGC2UPhh`
- Preserve: page `Template`, node `0:1`, frames `26:1132`, `26:1177`, `26:1262`, `26:1387`, `26:1553`, `26:1598`

- [ ] **Step 1: Load all required Figma instructions**

Before the first mutation, read `figma:figma-use`, `figma:figma-generate-design`, and `figma:figma-generate-library` completely, plus the full Figma gotchas reference they require. Include all three skill names in `use_figma` calls that create components.

- [ ] **Step 2: Reconfirm the source template read-only**

Use one consolidated read-only call to inspect page `0:1`, frames 1288–1293, available fonts, variables, text styles, and effects. Confirm their normalized rhythms:

- 1288: headline upper-left, oversized device cropped on the right.
- 1289: upper-left headline, two diagonally offset devices.
- 1290: device cropped above, headline low.
- 1291/1293: headline high, straight device low.
- 1292: device high, headline low.

Do not clone, reparent, rename, or edit any Template node.

- [ ] **Step 3: Create the exact new hierarchy**

```text
Page: Skull King 1.11.1 — App Store
  Section: Components
    ComponentSet: Canvas/Background
    Component: Marketing/Glass Caption
    ComponentSet: Marketing/Feature Badge
    Component: Marketing/Invalid QR
    Component: Device/iPhone 6.9 Screen
    Component: Device/iPad 13 Screen
  Section: EN — iPhone 6.9
  Section: FR — iPhone 6.9
  Section: EN — iPad 13
  Section: FR — iPad 13
```

Use a 4 × 2 grid with 160-pixel section padding and gaps. Phone sections are `6080 × 6216`, with frames at `x = 160, 1640, 3120, 4600` and `y = 160, 3188`. iPad sections are `9056 × 5984`, with frames at `x = 160, 2384, 4608, 6832` and `y = 160, 3072`. Place the sections at `Components (0,0)`, `EN phone (0,3600)`, `FR phone (0,10216)`, `EN iPad (0,16832)`, and `FR iPad (0,23216)`. Create no more than ten logical operations per mutation call, return every created/mutated node ID, and validate each batch with metadata and a rendered screenshot.

- [ ] **Step 4: Create the approved reusable visual system**

Use these component values:

- `Canvas/Background`: variants `Device=iPhone 6.9|iPad 13`; booleans `Show gold bloom`, `Show cyan bloom`; opaque 145° gradient `#0b1722 → #13283a at 54% → #173347`; existing leather/map texture at `0.075` opacity; gold/cyan blooms at approximately `0.20` / `0.24` opacity.
- `Marketing/Glass Caption`: variants `Device=Phone|iPad`, `Accent=None|Gold|Cyan`; text properties `Title`, `Body`; boolean `Show Body`; fill `#13283a` at `0.42`; background blur radius `44`; 1-pixel `#9fb4c4` border at `0.24`; 1-pixel top highlight `#f3f7fa` at `0.08`; radius `36` phone / `44` iPad.
- `Marketing/Feature Badge`: `Device=Phone|iPad`, `Tone=Neutral|Gold|Cyan`; text property `Label`; pill radius `999`.
- `Device/iPhone 6.9 Screen`: `1050 × 2211`; exact-ratio capture slot `990 × 2151` at `(30,30)`; outer radius `120`; mask radius `92`.
- `Device/iPad 13 Screen`: `1660 × 2192`; exact-ratio capture slot `1596 × 2128` at `(32,32)`; outer radius `96`; mask radius `72`.

Use `SF Pro Display` if the connected Figma runtime confirms it. Otherwise use Inter Bold/Semi Bold/Regular for marketing copy only. Phone headline is `112/120`, tracking `-2.4`, max width `1096`; iPad is `128/136`, tracking `-2.8`, max width `1776`. French wraps; it never uses a smaller size than English.

- [ ] **Step 5: Create the safe QR component**

Create a deliberately non-scannable square graphic that matches the native QR's apparent density but has no finder-pattern triplets and carries a centered crossed-anchor mark. Name it `Marketing/Invalid QR`. Use it only as a privacy/safety replacement over the real host/table QR regions; do not place it over spectator content.

- [ ] **Step 6: Upload and map raw assets once**

Upload the texture, safe QR, and all approved raw PNGs in one asset batch. Keep a deterministic source path → image hash → target `Capture` node ledger. Override only the nested `Capture` rectangle's image fill. Because source and mask ratios match, use `FILL` without non-proportional scaling; create crops by clipping/positioning the device instance.

---

### Task 7: Compose the Thirty-Two Final Figma Frames

**External file:**
- Modify: the four locale/device sections on `Skull King 1.11.1 — App Store`

- [ ] **Step 1: Create all export frames and settings**

Create eight `1320 × 2868` frames in each phone section and eight `2064 × 2752` frames in each iPad section. Name each frame with the exact stem, and assign:

```js
exportSettings = [{
  format: "PNG",
  constraint: { type: "SCALE", value: 1 },
}]
```

Every frame contains, back-to-front:

```text
INSTANCE Canvas/Background
FRAME Artwork (clipsContent=true)
  INSTANCE Device/... Screen
    FRAME Screen Mask
      RECTANGLE Capture (IMAGE fill)
TEXT Headline
INSTANCE Marketing/Glass Caption (optional)
FRAME Badge Row (optional)
  INSTANCE Marketing/Feature Badge
```

- [ ] **Step 2: Compose the opening triptych (#1–#3)**

- #1 follows 1288: oversized active-game device cropped on the right; headline upper-left; gold bloom behind the scoring area.
- #2 follows 1289: host live sheet and spectator standings as two diagonally offset screens; cyan live glow; a small glass card explains scan-and-follow without claiming offline behavior.
- #3 follows 1290: results/podium screen cropped from above; headline low; use `results-details` only as a restrained authentic inset if the chart/awards are not readable in the primary crop.

Each frame must make sense by itself when the other two are not visible.

- [ ] **Step 3: Compose the feature frames (#4–#8)**

- #4 uses a straight stats screen plus a clipped native records inset; keep the real glass Stats header visible.
- #5 uses the named table/invite screen and replaces every QR/code pixel with `Marketing/Invalid QR`; add one restrained glass explanation card.
- #6 combines scoring and expansion setup captures without recreating switches; the phone uses a primary device plus glass inset, while iPad uses two native panes.
- #7 makes Greybeard unmistakable: phone uses the Greybeard game as primary plus setup inset; iPad uses a setup/game split. Alex and Camille remain the only scoring players.
- #8 uses the populated Home screen with three badges: `Saved locally`, `Works offline`, `Ad-free` in English and `Sauvegardé localement`, `Hors ligne`, `Sans pub` in French. Do not show live/cloud UI in this frame.

- [ ] **Step 4: Preserve hierarchy across locale and device variants**

Duplicate only completed component-instance compositions within the new page, then replace copy and image fills. Keep identical feature order and relative emphasis. Reflow French to an extra line where needed. Design iPad with its native wide captures and two-panel opportunities; never enlarge the iPhone composition.

- [ ] **Step 5: Validate every Figma frame at full resolution**

For each frame, inspect a rendered full-resolution image and its metadata. Verify:

- Correct dimensions, name, and export setting.
- No clipped French text or native UI.
- No distorted capture.
- Glass contrast and visible translucency.
- QR/code replacement completely covers the capability.
- Device/caption balance follows the approved template rhythm.
- The Template page remains unchanged.

Correct only the failed nodes and re-render; do not rebuild completed frames wholesale.

---

### Task 8: Export, Validate, Inspect, and Commit the Final Set

**Files:**
- Add: `marketing/app-store/screenshots/en-US/iphone-6.9/*.png`
- Add: `marketing/app-store/screenshots/en-US/ipad-13/*.png`
- Add: `marketing/app-store/screenshots/fr-FR/iphone-6.9/*.png`
- Add: `marketing/app-store/screenshots/fr-FR/ipad-13/*.png`

- [ ] **Step 1: Export in bounded batches**

Export at exactly 1× in batches of four frames, writing the exact paths derived by `finalScreenshotPath(...)`. Do not export Figma previews or scale phone art to iPad dimensions.

- [ ] **Step 2: Run the automated final gate**

Run:

```bash
npm run validate:app-store-screenshots
find marketing/app-store/screenshots -name '*.png' | sort
```

Expected final validator line:

```text
32 App Store screenshots valid
```

Expected: eight files in each of the four directories, with identical stems.

- [ ] **Step 3: Perform the visual contact-sheet review**

Create temporary contact sheets for each locale/device set and inspect them with `view_image`, then inspect all thirty-two individual files at full resolution. Specifically compare:

- English versus French hierarchy and wrapping.
- Phone versus iPad native layout.
- Opening triptych continuity and individual readability.
- Glass rendering and headline contrast.
- Greybeard's non-scoring role.
- Complete absence of working QR/codes, old branding, debug UI, and personal data.

- [ ] **Step 4: Run the complete repository verification**

Read `superpowers:verification-before-completion` completely, then run fresh:

```bash
npm test
npm run typecheck
npm run build:web
npm run test:xcode-cloud
npm run validate:app-store-screenshots
git diff --check
git status --short
```

Expected: every command exits 0; only the planned scripts/docs/final PNGs are changed or untracked.

- [ ] **Step 5: Commit only the final screenshot deliverables**

Stage an explicit allowlist:

```bash
git add \
  marketing/app-store/screenshots/README.md \
  marketing/app-store/screenshots/en-US \
  marketing/app-store/screenshots/fr-FR \
  package.json \
  scripts/app-store-screenshots \
  scripts/test-app-store-screenshots.ts \
  src/appStoreScreenshotFixture.ts
git diff --cached --check
git diff --cached --stat
git commit -m "Add 1.11.1 App Store screenshots"
```

If the tooling was already committed in Tasks 1–3, the final commit contains only the README refinement and thirty-two PNGs. Do not stage generated `ios/`, `dist/`, temporary raw captures, or unrelated user work.

- [ ] **Step 6: Hand off without uploading**

Report the Figma page name, four repository directories, validator result, and commit IDs. State explicitly that App Store Connect upload was not performed. Keep the disposable simulators until the user confirms the assets, then offer to delete only the two exact `Skull King Capture … 1.11.1` devices.
