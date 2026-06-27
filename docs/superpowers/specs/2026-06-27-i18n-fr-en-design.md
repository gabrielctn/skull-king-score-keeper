# Internationalization (French / English) — Design

**Date:** 2026-06-27
**Status:** Approved by user; implement.

## Goal

Let the user switch the whole UI between **English** and **French**. The choice
persists across launches. French uses the official Grandpa Beck 2022 rulebook
vocabulary.

## Approach — hand-rolled, typed, no dependency

A typed dictionary + React context. No i18n library, no `expo-localization`
(this ships as an offline web PWA).

- **One shared `Strings` interface**; `en` and `fr` are both annotated
  `: Strings`. A missing/renamed key is a **compile error** — that is the
  completeness check. (Types can't see array-length drift in the rules lists, so
  one cheap assert covers that.)
- **Parameterized strings are function members**, e.g.
  `winner: (name: string, total: number) => string`,
  `ghostTook: (n: number) => string`, `roundOf: (players, round, total) => string`.
- **`en.ts` / `fr.ts` / `types.ts` are pure data** (no React import) so the test
  harness can import them; `context.tsx` holds the React parts.

## Persistence & startup

- Stored under `skullking:lang` (mirrors `skullking:currentGame`), with
  `loadLang` / `saveLang` in `storage.ts`.
- Loaded in the **same** `App.tsx` async startup block that already gates render
  on `loading`, so there's no wrong-language flash. The provider gates on it.
- **Language is an app preference, NOT part of the `Game` schema** — no
  migration, no version bump.
- First launch with no stored choice: detect via `navigator.language`
  (`startsWith("fr")` → `fr`, else `en`), guarded for non-web. Manual choice
  always wins thereafter.

## Switcher

A compact `FR | EN` segmented control at the top of the **Home** screen.
Reachable before any game; mid-game you return Home (the game stays saved),
toggle, and resume. Not threaded into every screen.

## French terminology (rulebook-exact)

Perroquet / Coffre / Carte au trésor (the colored 14s), **Drapeau pirate** (not
"Jolly Roger"), Sirène, Pirate, Tigresse, Fuite, Butin, Kraken, Baleine
blanche; pli / manche / mise. The ghost is **« Barbe Grise »**. "Skull King"
stays as-is. The ghost label is localized at the view — `turnOrder.ts` (which
returns `{kind:"ghost"}` with no name) is untouched.

## Touch list

- **`src/i18n/types.ts`** — `Lang`, `Strings` interface, `Entry` type.
- **`src/i18n/en.ts`**, **`src/i18n/fr.ts`** — the two dictionaries.
- **`src/i18n/context.tsx`** — `I18nProvider`, `useI18n()` → `{ lang, setLang, t }`,
  `detectLang()`.
- **`src/storage.ts`** — `loadLang` / `saveLang`.
- **`App.tsx`** — load lang in the startup gate; wrap the app in `I18nProvider`.
- **Screens/components** — `HomeScreen` (+ switcher), `SetupScreen`,
  `GameScreen` (incl. dealer banner + ghost chip label), `ResultsScreen`,
  `RulesModal`, `BonusEditor`, `Stepper` (a11y labels).
- **`scripts/test-scoring.ts`** — assert `en`/`fr` rules arrays have equal
  lengths (the one parity check types can't give).

## Out of scope (YAGNI)

- No third language, no i18n library, no `expo-localization`.
- Player names are never translated.
- No per-screen language controls beyond Home.

## Testing

Type-check is the primary guarantee (both dicts satisfy `Strings`). Add the
rules-array parity assert to `npm run test:scoring`. Manual: toggle FR/EN on
Home and walk every screen + the rules modal in both languages; relaunch to
confirm the choice persisted.
