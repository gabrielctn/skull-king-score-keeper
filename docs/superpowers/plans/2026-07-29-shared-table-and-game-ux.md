# Shared Game Table & In-Game UX Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a friends group share one named game history ("table") across scorekeeper devices, allow rule changes mid-game, and fix six smaller UX issues (expansion default, bonus wording/grouping, turn-order clarity, live button discoverability).

**Architecture:** Extend the existing Supabase capability-code cloud sync (`cloudSync.ts`, `backup.ts`) with a synced `tableName` and a `#join=` URL/QR flow; add a `GameRulesModal` editing the `Game` rule flags (scores are derived, so they recompute); the rest is i18n + component-level changes.

**Tech Stack:** Expo / React Native Web, TypeScript, Supabase JS (existing RPC only — no schema change needed), tsx test scripts.

## Global Constraints

- No em dashes or en dashes in any player-facing copy (test-ux enforces).
- All 6 locales (en, fr, es, de, ar, zh) must be updated together; `Strings` type enforces at typecheck.
- Table name: trimmed, max 60 chars, empty → null.
- Join hash param: `#join=<SKC1 code>`; existing params `#skl=`, `#live=` unchanged.
- Version bump to 1.10.0, release date 2026-07-29.
- **Do NOT commit**: the working tree carries unrelated user WIP in overlapping files. Leave everything uncommitted for user review.
- Run `npm test` (typecheck + all suites) at the end of every task; suites named per task.

---

### Task 1: `tableName` in backup data layer + local storage

**Files:**
- Modify: `src/backup.ts` (BackupData, BackupPayloadV1, createBackupPayload, parseBackup, mergeBackupData)
- Modify: `src/storage.ts` (add TABLE_NAME_KEY + helpers)
- Test: `scripts/test-backup.ts`, `scripts/test-storage.ts`

**Interfaces:**
- Produces: `BackupData.tableName: string | null`; `normalizeTableName(raw: unknown): string | null` (exported from backup.ts); `loadTableName(): Promise<string | null>`, `saveTableName(name: string | null): Promise<void>` (storage.ts).
- Consumed by Tasks 2, 4, 5.

- [ ] Add `tableName: string | null` to `BackupData`; export `normalizeTableName` (string → trimmed, sliced to 60 chars, empty → null; non-string → null). Include it in `createBackupPayload` and read it through `normalizeTableName` in `parseBackup`. In `mergeBackupData`, merged name = `remote.tableName ?? local.tableName`. Fix all existing `BackupData` literal construction sites (App.tsx compiles in Task 5; scripts updated in this task).
- [ ] Add `skullking:tableName` storage helpers following the `loadSeenRelease` pattern (store plain string; remove key when null).
- [ ] Tests in test-backup.ts: round-trip via serialize/parse keeps the name; parse drops a non-string/oversized name to null; merge prefers remote name, falls back to local; legacy payload without the field parses to null.
- [ ] Run `npm run test:backup`, `npm run test:storage`, `npm run typecheck`.

### Task 2: Join-code helpers + `peek` in cloudSync

**Files:**
- Modify: `src/cloudSync.ts`
- Test: `scripts/test-cloudsync.ts`

**Interfaces:**
- Produces: `JOIN_HASH_PARAM = "join"`; `buildJoinUrl(code: string, baseUrl: string): string`; `extractJoinCode(hash): string | null` (validates with `decodeSyncCode`); `consumeScannedJoinCode(): string | null` (mirrors `consumeScannedLiveId`: strip hash via history.replaceState, no sessionStorage — one-shot); `CloudBackupManager.peek(code: string): Promise<BackupData | null>` (decode + transport.get + parseCloudState, throws on bad code/unreachable, does NOT adopt).
- Consumes: `decodeSyncCode`, `parseCloudState` (existing).

- [ ] Implement the four helpers + `peek`.
- [ ] Tests with the existing fake-transport pattern: extract accepts `#join=SKC1...` and rejects garbage; buildJoinUrl round-trips through extract; peek returns parsed data and leaves the manager's owner untouched; peek on unknown code throws.
- [ ] Run `npm run test:cloudsync`, `npm run typecheck`.

### Task 3: All i18n changes (types + 6 locales)

**Files:**
- Modify: `src/i18n/types.ts`, `en.ts`, `fr.ts`, `es.ts`, `de.ts`, `ar.ts`, `zh.ts`

**Interfaces (new/changed keys):**
- `settings.cloud`: retitle `title` ("Shared game table" / "Table de jeu partagée"); add `tableNameLabel`, `tableNamePlaceholder`, `tableNameHint` (name is shared with the whole table), `shareTitle`, `shareHint` (scan or send the link; anyone with it can read and write this table), `copyLink`, `linkCopied`, `qrLabel`; reword `linkTitle`/`linkHint` to the fallback framing ("No camera at hand? Use the code below.").
- New `joinTable` section: `title`, `named(name)`, `unnamed`, `message(count)` ("Its N games and the games already on this phone will be merged into one shared history."), `confirm`, `cancel`, `busy`, `success`, `error`.
- New `gameSettings` section: `open` (a11y label for ⚙), `title` ("Game rules"), `recomputeHint` ("Changes apply to the whole game: rounds already scored are recalculated with the new rules."), `close`.
- `game`: replace `playOrderHint: string` with `playOrderLead: (name: string) => string` ("Play order · {name} leads the first trick" / "Ordre de jeu · {name} entame la manche").
- `liveShare`: add `badge: "Live"`; reword `open` to "Live score sharing".
- `bonus` renames (same keys, new copy, A-takes-B): en: `mermaidByPirate` "Pirate takes a mermaid", `pirateBySkullKing` "Skull King takes a pirate", `mermaidCapturesSkullKing` "Mermaid takes the Skull King", `secondCaptured` "Skull King or a mermaid takes the Second", `davyJonesLeviathans` "Davy Jones destroys a leviathan". fr: "Un pirate prend une sirène", "Le Skull King prend un pirate", "Une sirène prend le Skull King", "Skull King ou une sirène prend le Second", "Davy Jones détruit un léviathan". es/de/ar/zh: same actor-first order in each language's existing style.
- `scoreBreakdown.items`: mirror the same actor-first phrasing (past tense): en "Pirate took N mermaid(s)", "Skull King took N pirate(s)", "Mermaid took the Skull King", "Skull King or a mermaid took the Second", "Davy Jones destroyed N leviathan(s)".
- `rules.bonusEntries` titles: "Pirate takes a mermaid (+20 each)", "Skull King takes a pirate (+30 each)", "Mermaid takes the Skull King (+40)"; expansion entries for Davy Jones / the Second keep their body but actor-first titles.
- `whatsNew.items`: rewritten for 1.10.0 in every locale (shared table, mid-game rules, expansion default, clearer live button and play order, uniform bonus wording).

- [ ] Update `types.ts` first, then `en.ts` and `fr.ts` fully, then es/de/ar/zh translations.
- [ ] Run `npm run typecheck` (proves all locales complete) and `npm run test:branding`.

### Task 4: Settings screen — shared table panel

**Files:**
- Modify: `src/screens/SettingsScreen.tsx`
- Modify: `App.tsx` (new props only; full wiring in Task 5)

**Interfaces:**
- Consumes: `qrCodeDataUrl` (qr.ts), `buildJoinUrl` + `cloudBackupManager().syncCode()` (Task 2), `appBaseUrl` from shareLink.ts, i18n keys (Task 3).
- Produces (props on SettingsScreen): `tableName: string | null`, `onRenameTable(name: string | null): void`.

- [ ] In the cloud panel: table-name `TextInput` (defaultValue tableName, maxLength 60, commit on blur/submit via `onRenameTable(normalized)`), share block with QR `<Image>` of `buildJoinUrl(code, appBaseUrl())` + copy-link button (navigator.clipboard, "copied" feedback like `copySyncCode`), keep raw code + paste flow below under the fallback label.
- [ ] Run `npm run typecheck`.

### Task 5: App wiring — table state, join modal, stats display

**Files:**
- Modify: `App.tsx`
- Create: `src/components/JoinTableModal.tsx`
- Modify: `src/screens/StatsScreen.tsx` (accept + show `tableName`)
- Test: `scripts/test-ux.ts`

**Interfaces:**
- Consumes: Task 1 storage helpers, Task 2 `consumeScannedJoinCode`/`peek`, Task 4 props.
- Produces: `JoinTableModal({ code, visible, onClose, onJoin: (code) => Promise<number | null> })` — fetches preview via `peek` on open (name, game count, error state), confirm button runs `onJoin`.

- [ ] App state `tableName` (loaded on boot with the other storage reads); `handleRenameTable` saves locally + `pushCloud`. Thread `tableName` into every `BackupData` literal (`pushCloud` gains the name, launch reconcile and `handleLinkDevice` apply `merged.tableName` via `applyBackupData` + `saveTableName`, import/export include it).
- [ ] Join flow: lazy-init `pendingJoin` from `consumeScannedJoinCode()` (before spectator resolution — a join link is not a spectator link), also handle it in the `hashchange` listener; render `JoinTableModal` when set; on success show the joined name.
- [ ] StatsScreen: `tableName` prop shown under the title when non-null.
- [ ] test-ux additions: App consumes join codes; SettingsScreen renders the QR share block; StatsScreen receives tableName.
- [ ] Run `npm run test:ux`, `npm run typecheck`.

### Task 6: GameRulesModal (mid-game rules)

**Files:**
- Create: `src/components/GameRulesModal.tsx`
- Modify: `src/screens/GameScreen.tsx` (⚙ header button + modal)
- Test: `scripts/test-ux.ts`

**Interfaces:**
- Produces: `GameRulesModal({ visible, game, onClose, onChange: (game: Game) => void })`.
- Consumes: `t.setup.*` labels, `t.gameSettings.*`, `ToggleSwitch`.

- [ ] Modal (pattern: RulesModal) with: scoring-mode radio (labels/hints from setup), rascalBets toggle (rascal only), bonusesRequireBid toggle (classic only), advancedCards, newExpansion, twoPlayerGhost (only `game.players.length === 2`), recompute hint text. Each change builds `{ ...game, updatedAt: Date.now() }` with invariants: `rascalBets: mode === "rascal" && value`, `bonusesRequireBid: mode === "classic" && value`, then `onChange`.
- [ ] GameScreen: add ⚙ `headerIconButton` before the Live button; `onChange` → existing `onUpdateGame` (persists + syncs live/cloud).
- [ ] test-ux: GameScreen references GameRulesModal; modal normalizes rascalBets/bonusesRequireBid on mode switch.
- [ ] Run `npm run test:ux`, `npm run typecheck`.

### Task 7: Small UX fixes (defaults, bonus grouping, turn order, live pill)

**Files:**
- Modify: `src/screens/SetupScreen.tsx` (newExpansion default true)
- Modify: `src/components/BonusEditor.tsx` (row order: counts then toggles per section)
- Modify: `src/screens/GameScreen.tsx` (numbered chips + `playOrderLead`; live pill)
- Test: `scripts/test-ux.ts`

- [ ] `useState(true)` for newExpansion in SetupScreen.
- [ ] BonusEditor main section order: colored14, mermaidByPirate, pirateBySkullKing, black14, mermaidCapturesSkullKing (expansion section already ends with its single toggle).
- [ ] Turn banner: chip text prefixed with `${i + 1} · `; hint uses `t.game.playOrderLead(leadName)` where leadName = first slot's player name (ghost slot never leads: order[0] is always a player — leaderIndex construction), font 12, non-italic.
- [ ] Live button: pill (borderRadius 22, paddingHorizontal) containing `📡 {t.liveShare.badge}`; subscribe to `liveSessionManager()` state; when status is live/syncing use gold background + dark text. Accessibility label `t.liveShare.open`.
- [ ] test-ux: `useState(true)` on the newExpansion line; BonusEditor source order check (indexOf black14 row > indexOf pirateBySkullKing row); GameScreen contains `playOrderLead` and `liveShare.badge`.
- [ ] Run `npm run test:ux`, `npm run typecheck`.

### Task 8: Release bump + full verification

**Files:**
- Modify: `src/releases.ts` (1.10.0 / 2026-07-29), `package.json`, `package-lock.json` (2 places), `app.json` (expo.version)
- Test: full `npm test`

- [ ] Bump versions everywhere test-ux checks alignment.
- [ ] Run `npm test` — every suite green.
- [ ] Browser verification via the project `verify` skill: build/launch web app; check setup defaults, bonus editor wording/grouping, turn banner, ⚙ modal (toggle expansion mid-game and confirm bonus rows appear), live pill, settings table panel (QR renders), and a `#join=` URL showing the modal (peek will fail offline-configured — verify the modal + error path).

## Self-review

- Spec coverage: §1 → Tasks 1,2,4,5; §2 → 6; §3 → 7; §4/§5 → 3,7; §6/§7 → 3,7; release/tests → 8. Covered.
- Types consistent: `tableName: string | null` everywhere; `peek`/`consumeScannedJoinCode` names match between Tasks 2 and 5.
- No placeholders remain.
