# Shared game table & in-game UX refinements — design

Date: 2026-07-29
Status: approved for implementation (user requested plan-then-implement)

## Goals

1. A friends group ("table") can share one game history and leaderboard, so any
   member can be the scorekeeper and the games still land in the shared record.
2. Game rules can be changed during a running game (e.g. enable the new
   expansion after round 3) without losing the game.
3. The new expansion is on by default for new games.
4. Bonus labels read uniformly as "A takes B" (actor first) instead of a mix of
   passive and active forms.
5. Toggle-style bonuses are grouped together, count-style bonuses together.
6. The player list at the top of the game screen clearly means "play order,
   first chip leads".
7. The live-session entry point is discoverable (labeled "Live" button instead
   of a cryptic ▦ grid icon).

## 1. Shared game tables ("tables de jeu partagées")

**A device belongs to several tables.** One player often has several crews
(family, friday-night friends). Each crew is one cloud row with its own
history and leaderboard; the device keeps a list of memberships
(`skullking:tables`, hardened by `normalizeTableMemberships`) and exactly one
is active. Pure helpers in `src/tables.ts` (upsert / rename / remove /
`nextActiveAfterRemoval`) hold the bookkeeping rules.

Consequences, deliberately chosen:

- **Joining a table no longer merges histories.** It adds the table and opens
  it; the games already on the phone stay in their own table. Merging two
  crews' histories was the old single-table behaviour and is not what a player
  with several groups wants. (Export + switch + import still allows a
  deliberate merge.)
- **Switching is replace, not merge**, so `CloudBackupManager` gains
  `switchTo(owner)`, `createTable()` and `flushPending()`. Every table change
  is gated on `flushPending()` succeeding: an unsent game must reach its own
  table's row before the local store is overwritten, otherwise it would be
  lost. Offline, the switch is refused with a "check your connection" message.
- **Within one table, the launch reconcile still merges** local and remote:
  both sides are the same table seen from different phones.
- Removing a table only forgets it on this device (the crew keeps playing);
  the last remaining table cannot be removed, and removing the active one
  falls back to another membership first.
- Pre-1.10 devices migrate on first sync: the existing cloud identity plus its
  stored name become the first membership.



### Approach

Extend the existing cloud backup + sync-code mechanism (Supabase `user_backups`
row + `SKC1.` capability code, already merged both ways by
`App.handleLinkDevice` and the launch reconcile) into a first-class, named,
shareable **table**. No accounts.

Alternatives considered and rejected:

- **Supabase Auth accounts + membership tables**: real logins per player.
  Rejected: heavy new backend surface (auth flows, RLS policies, account
  recovery), contradicts the app's local-first/anonymous design, and the group
  outcome (shared history any member can extend) does not need per-player
  identity. Player names inside games remain free text.
- **Manual export/import only**: already exists, but one-shot; devices drift
  apart. Rejected as the primary flow; it stays as offline fallback.

The capability code IS the credential: anyone holding it reads and writes the
table. That is the right trust model for a group of friends; the UI says so.

### Data model

- `BackupData` (and payload v1) gains `tableName: string | null`.
  - `createBackupPayload` includes it; `parseBackup` accepts it when it is a
    string (trimmed, ≤ 60 chars) and drops anything else. Older payloads
    without the field parse as `null` (backward compatible; format version
    stays 1 because unknown fields were always ignored on import).
  - `mergeBackupData(local, remote)`: the merged name is `remote.tableName ??
    local.tableName` — the shared row is authoritative, so a rename by any
    member propagates; a device that has never set a name adopts the table's.
- New AsyncStorage key `skullking:tableName` with load/save helpers in
  `storage.ts`, so the name survives offline restarts.

### Join links

- New URL hash parameter `#join=<SKC1 code>` (same consume-before-paint pattern
  as `#live=` / `#skl=`). Helpers in `cloudSync.ts`: `buildJoinUrl`,
  `extractJoinCode`, `consumeScannedJoinCode`.
- `CloudBackupManager.peek(code)`: fetch and parse the table's state WITHOUT
  adopting the identity, so the join prompt can show the table name and game
  count before the user commits.
- App boot (and `hashchange`): a join code sets `pendingJoin`; a modal shows
  "Join table «name»? Its N games and the games on this phone will be merged"
  with explicit confirm/cancel. Confirm runs the existing adopt + merge + push
  flow. Never auto-adopt: switching identity must be a deliberate act.

### UI

- Settings: the cloud panel becomes "Shared game table": status card, a
  "Your tables" list (one row per crew, active row badged, tap to switch,
  ✕ to forget with confirmation, "+ Start a new table" below), the active
  table's name field (save pushes immediately), a QR code of the join URL plus
  a copy link button, and the existing raw code + paste fallback underneath.
  One busy flag and one error line cover switch / create / remove.
- Stats screen shows the active table's name under the title when set.

## 2. Change rules during a running game

- New ⚙ button in the GameScreen header (with Live and ?) opening a
  `GameRulesModal`.
- Editable mid-game: scoring mode (classic/rascal, with its dependent toggle:
  Rascal optional rules OR "bonuses require exact bid"), Loot & Rascal wager
  (`advancedCards`), new expansion (`newExpansion`), Greybeard ghost (2-player
  games only). Invariants are re-normalized on save exactly like `createGame`
  (rascalBets only with rascal, bonusesRequireBid only with classic).
- Not editable: players, round structure (cards per round is already editable
  round by round).
- All scores are derived at render time from the recorded entries, so recorded
  rounds recompute automatically; the modal says so.

## 3. New expansion on by default

`SetupScreen`: `newExpansion` initial state becomes `true`.

## 4. Homogeneous bonus wording — "A takes B"

All locales (en, fr, es, de, ar, zh), in `bonus.*`, `scoreBreakdown.items.*`
and the rules-modal bonus entries:

- "Pirate taken by Skull King" → "Skull King takes a pirate"
- "Mermaid taken by a pirate" → "Pirate takes a mermaid"
- "Mermaid captures Skull King" → "Mermaid takes the Skull King"
- "Second taken by Skull King / Mermaid" → "Skull King or a mermaid takes the
  Second"
- "Leviathan destroyed by Davy Jones" → "Davy Jones destroys a leviathan"
  (actor-first; "destroys" kept because nothing is captured)

Plain captures with no second actor (colored 14s, black 14, new 7/8) keep
their current concise labels.

## 5. Bonus editor grouping

Rows reordered: count rows first, then toggle rows, in both sections.
Main: colored 14s, pirate-takes-mermaid, SK-takes-pirate, then black 14,
mermaid-takes-SK. Expansion: 7s, 8s (with their hint), Davy Jones, then the
Second toggle. No scoring change.

## 6. Turn-order banner

- Chips get their play position number ("1 · Ana", "2 · Ben", …).
- The tiny italic hint is replaced by a dynamic, larger line naming the
  leader: `playOrderLead(name)` → "Play order · Ana leads the first trick"
  (localized). Dealer line unchanged.

## 7. Live button

- The ▦ icon button becomes a labeled pill "📡 Live"; when a live session is
  running it fills gold with the status dot, driven by subscribing to
  `liveSessionManager`. Accessibility label updated ("Live score sharing").

## Release & tests

- Version 1.10.0 (package.json, package-lock ×2, app.json, releases.ts, date
  2026-07-29); what's-new items rewritten in all locales.
- Tests: backup round-trip/merge of `tableName`; join-code extract/build and
  `peek`; storage helpers; UX source checks (expansion default, bonus grouping
  order, live pill, numbered chips, game-rules modal). `npm test` (includes
  typecheck, which enforces i18n completeness through the `Strings` type).

## Error handling

- Join: bad/unreachable code → modal shows the existing linkError copy and
  leaves the device identity untouched (guaranteed by `adopt`'s null-state
  guard).
- Table name: trimmed, capped (60 chars) at input and at parse; empty string
  clears to null.
- Everything remains functional offline; cloud failures degrade exactly as
  today (status chip, retries).
