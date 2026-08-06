# Skull King Crew Ledger — working notes

An offline-first PWA (React Native + Expo web + TypeScript) for scoring Skull
King, deployed as a static site to GitHub Pages, with an optional Supabase
backend for shared tables and live score follow. `README.md` covers what the
app does and how it is built; this file covers conventions that are easy to get
wrong.

## Release notes ("What's new")

**The dialog that opens after an update shows THIS release only.** Never let the
list accumulate across versions: someone who updates wants to know what changed
today, not to re-read six months of history.

Bumping a release means:

1. Move the outgoing release's lines from `whatsNew.items` into
   `whatsNew.history` under its version number, in **all six locales**
   (`en`, `fr`, `es`, `de`, `ar`, `zh`).
2. Add that version and its date to `PAST_RELEASES` in `src/releases.ts`.
3. Put the new release's lines in `whatsNew.items`, and bump
   `CURRENT_RELEASE` / `CURRENT_RELEASE_DATE`.
4. Keep versions aligned: `package.json`, `package-lock.json` (two places),
   `app.json` (plus its iOS `buildNumber`). `npm run test:ux` checks this.

The older releases stay reachable under "Previous versions" in the Settings
copy of the dialog (`showHistory`), and only there.

### How to write a line

Players are not developers. They care about what they can now do.

- **One short sentence per new feature.** If it needs a comma-spliced clause to
  explain itself, it is too long.
- **No internals**: no schema, no RPC, no component names, no rationale, no
  "because". Those belong in the commit message and `docs/superpowers/specs/`.
- **Say the feature, not the change.** "Join a table with the 6-character code
  your friend shows you" — not "reworked the invite flow to use short codes
  minted by a new Supabase function".
- Skip lines for anything a player cannot notice. A refactor, a test, a fixed
  race: leave them out entirely rather than dress them up.
- `npm run test:ux` fails a line longer than 160 characters, which is a
  ceiling, not a target.

## Player-facing copy in general

- Every string lives in `src/i18n/*.ts`, typed by `Strings` in `types.ts`, so a
  missing key is a compile error. Six locales, always all six.
- No en dashes or em dashes in player-facing text (`npm run test:ux` enforces
  it). Use a comma, a colon, or two sentences.
- Arabic is RTL; use `marginStart`/`marginEnd`, never `marginLeft`/`Right`.

## Tests

`npm test` runs typecheck plus every suite in `scripts/`. They are plain
`node --import tsx` scripts asserting on pure functions and on source text, so
they are fast and worth running on every change. Add to the suite that already
covers the area rather than starting a new one.

## Verifying UI changes

`.claude/skills/verify/SKILL.md` has the Playwright recipe (and a list of
react-native-web gotchas learned the hard way). Screenshots beat assumptions
for anything visual.
