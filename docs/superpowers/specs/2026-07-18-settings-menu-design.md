# Settings menu — design

Date: 2026-07-18
Status: implemented

## Goal

The home screen currently hosts three app-level concerns that are not about
playing: the language switcher, the "Your data" backup section, and the
"What's new" entry point. Move them into a dedicated **Settings** screen and
add the general (non-per-game) settings that make sense for a score keeper.

## Decisions

### Entry point

A gear button (⚙) replaces the language switcher in the top-right corner of
the home screen. It opens a new full `SettingsScreen` (new `"settings"` value
of the `Screen` union in `App.tsx`). A screen — not a modal — because it hosts
several sections, its own confirmation dialog and the What's new modal, and it
matches the app's existing screen-based navigation.

The home screen keeps: hero, play buttons, history, the support button and the
legal disclaimer (support/legal are not settings and should stay visible), the
offline footer, and the **automatic** What's new dialog shown once per release.

### Settings screen content

1. **Language** — one row per supported language, labelled with its native
   name (Français, English, Deutsch, العربية, 中文). Radio semantics, current
   language checked. Replaces the cramped 5-chip switcher.
2. **During a game** — "Keep the screen awake" toggle (default **on**).
   Implemented with the web Screen Wake Lock API; the lock is held only while
   `GameScreen` is mounted and is re-acquired when the tab becomes visible
   again. The row is hidden on browsers without `navigator.wakeLock`.
3. **Your data** — the existing Export / Import buttons and status messages,
   moved as-is, plus a new destructive **Delete all games** action guarded by
   a confirmation dialog (disabled when there is nothing to delete).
4. **What's new** — a row (with the "New" badge when the current release is
   unseen) opening the changelog modal, now extracted into a shared
   `WhatsNewModal` component used by both Home (auto-open) and Settings.
5. Footer — version + release date and the offline note.

Considered and rejected: theme switching (single dark nautical theme is a
design choice), sounds/haptics (none exist; vibration unsupported on iOS
Safari), default game options (the user explicitly scoped this menu to
app-general settings, and game options live in game setup).

### Persistence

New `skullking:settings` AsyncStorage key holding `AppSettings`
(`{ keepAwake: boolean }`), with `normalizeSettings()` filling defaults so
future fields degrade gracefully. Loaded at boot next to the language.
Deleting all games clears the current game and history through the existing
save queues and surfaces failures through the existing storage warning.

### i18n

The `home.data*` strings move to a new `settings.*` namespace; new strings for
the screen title, keep-awake, delete-all and its dialog. All five locales are
updated (the `Strings` type enforces completeness). Native language names live
in a single static map in `i18n/context.tsx` — they are deliberately not
translated per locale.

### Release

Version bump to 1.2.0 (package.json, app.json, `releases.ts`) with new
localized What's new items covering the settings menu, the keep-awake option
and delete-all. The PWA cache version is content-hashed at build time, so no
service-worker change is needed.

## Files

- `src/screens/SettingsScreen.tsx` (new)
- `src/components/WhatsNewModal.tsx` (new, extracted from HomeScreen)
- `src/wakeLock.ts` (new)
- `src/storage.ts` — settings load/save/normalize
- `src/screens/HomeScreen.tsx` — remove moved sections, add gear button
- `src/screens/GameScreen.tsx` — hold the wake lock while mounted
- `App.tsx` — settings state, screen routing, delete-all handler
- `src/i18n/*` — restructured strings, five locales
- `scripts/test-storage.ts` — `normalizeSettings` coverage
- `src/releases.ts`, `package.json`, `app.json` — 1.2.0
