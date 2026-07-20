# ☠️ Unofficial score keeper for Skull King

A fan-made, installable **offline-first PWA** for keeping score in the **Skull King**
card game, built with **React Native + Expo (web) + TypeScript** and deployed as a
static site to **GitHub Pages**. Add it to your home screen and it runs without any
network — perfect for a table with no wifi.

**Live:** https://gabrielctn.github.io/skull-king-score-keeper/

> **Unofficial fan project.** This app is not affiliated with, endorsed by, or
> sponsored by Grandpa Beck's Games, its publishers, or distributors. "Skull King"
> and the official game elements belong to their respective rights holders.

**Optional support:** https://buymeacoffee.com/gabrielctn — the app remains completely free.

## What it does

- Add 2+ players and choose the number of rounds (1–10, default 10).
- Start immediately with **Quick Game**, or reveal the advanced round and
  expansion settings only when they are needed.
- For each round, enter every player's **bid** and **tricks won**, plus a
  structured **bonus editor** for captured special cards — no mental math.
- Record each **Loot alliance** as it happens; the linked players stay visible
  and both bids are checked before the +20 bonuses are applied.
- Editable **cards-dealt** per round (for 7–8 players or custom round structures).
- Live per-round and running totals, with a tricks-vs-cards sanity check.
- A **live-follow QR code** (▦ button in the game header): players scan it
  with their own phone and get a read-only view of the standings and their
  full round-by-round score details, bonuses included — no more asking the
  game master. The whole snapshot travels inside the QR code (no server);
  re-scanning refreshes it.
- A built-in **rules reference** (the "?" button) covering every special card.
- Full support for the **new Skull King expansion**: conditional 7/8 points,
  Davy Jones' Locker, the Second, and a rules reference for every new card.
- Final standings with ranks (ties handled) and a winner screen.
- Every bid, trick, bonus and round option auto-saves as a draft, so you can
  close the app at any moment and resume the exact game from the home screen.
- Reopen and correct any scored round; the app then returns to the earliest
  round that still needs scoring.
- Export every game to a versioned JSON backup and merge it back safely on this
  or another device.
- Start a rematch from the final standings with the same crew, options and card
  structure.
- Complete English, French, German, Arabic (RTL), and Simplified Chinese UI,
  with first-launch device-language detection and an English fallback.
- Installed PWAs update themselves on launch, when brought back to the foreground,
  when connectivity returns, and during hourly checks while open.
- A localized **What's new** view opens once for each release and remains available
  from the home screen.

## Scoring rules (built in)

The scoring logic is designed around the **2022 Skull King** scoring rules.

Bid scoring:

- **Bid ≥ 1, hit exactly:** +20 per trick won.
- **Bid ≥ 1, missed (over or under):** −10 per trick of difference; no points for tricks made.
- **Bid 0, won 0 tricks:** +10 × **cards dealt that round**.
- **Bid 0, won any trick:** −10 × **cards dealt that round**.

(The zero-bid multiplier uses cards *dealt*, which can be fewer than the round
number in late rounds with 7–8 players — handled by the editable cards field.)

**Rascal scoring** — the rulebook's official alternate system, selectable at
game setup:

- Every round puts **10 × cards dealt** at stake for every player, whatever
  the bid. Exact bid: the full stake. Off by one: half. Off by two or more:
  nothing — bid points are never negative.
- Capture bonuses follow the same full / half / none accuracy tiers; Loot,
  the special 7s/8s and the Rascal pirate wager keep their own exact-bid
  conditions.
- Optional per-round declarations (rulebook "Optional Rascal rules"):
  **Chevrotine / Buckshot** (open hand — standard tiers) or **Boulet de canon
  / Cannonball** (closed fist — 15 × cards dealt on an exact bid, otherwise
  nothing, bonuses included).

Bonus points — **awarded for captures regardless of whether you hit your bid**,
and they go to whoever *captures* the card, no matter who played it:

- Colored 14 (yellow / purple / green): **+10** each
- Black 14 (Jolly Roger / trump): **+20**
- Mermaid captured by a pirate: **+20** each
- Pirate captured by the Skull King: **+30** each
- Mermaid captures the Skull King: **+40**
- Leviathan destroyed by Davy Jones' Locker: **+20** each
- The Second captured by Skull King or a Mermaid: **+30**

New expansion color cards — **only applied when you hit your exact bid**:

- Each new 7 captured: **-5**
- Each new 8 captured: **+5**

Conditional extras (when "Loot & Rascal wager" is on):

- **Loot / Butin alliance:** +20 to each ally, **only if both allies hit their
  exact bid**. Record who played the card and who won its trick; the app keeps
  the binding visible and applies both bonuses automatically.
- **Rascal pirate wager (0/10/20):** gained if you hit your bid, lost if you miss.

Special cards that affect *what you enter* (explained in the in-app "?" reference):

- **Kraken:** the trick is destroyed — nobody wins it, no captures count. (So the
  round's tricks can total fewer than the cards dealt.)
- **White Whale:** specials are nullified and the highest *number* wins; no
  special-card capture bonuses happen in a whale trick.
- **0/14, wild 15, Mary Throne, Final Salvo, Walk the Plank and Spotted Ray:**
  their complete trick-play rules are included in the in-app reference.
- **Davy Jones' Locker:** destroys all leviathans in its trick; the app records
  +20 per destroyed leviathan.
- **The Second:** beats everything except Skull King and Mermaids; capturing it
  with either awards +30.

The project is covered by automated checks (`npm test`) across scoring,
player-history statistics, saved game migrations, backup validation,
responsive layout, assets and branding, including the rulebook's worked
examples and Loot edge cases.

---

## Run it locally

```bash
npm install
npm run web        # Expo dev server (opens the app in your browser)
```

To exercise the **production PWA** (service worker + offline) locally:

```bash
npm run build:web  # expo export -p web  +  scripts/build-pwa.mjs
```

The service worker and manifest only exist in this production export, not in the
dev server. The export is served under the `/skull-king-score-keeper/` sub-path
(set by `experiments.baseUrl` in `app.json`), so to test it the way GitHub Pages
serves it, expose `dist/` at that path — e.g. symlink it into a folder named
`skull-king-score-keeper/` and serve the parent.

## How it becomes a PWA

`expo export -p web` produces a plain static SPA with no PWA shell. The
`scripts/build-pwa.mjs` post-step turns it into an installable, offline app:

- copies `web/manifest.webmanifest` and `web/icons/` into `dist/`
- generates `dist/service-worker.js` from `web/service-worker.js`, injecting a
  **precache list of every built file** (app shell, JS bundle, illustrations) and a
  content-hash cache version (so each deploy gets a fresh cache, old ones are purged)
- injects the manifest link + apple-touch / web-app meta tags into `index.html`
- writes `.nojekyll` so GitHub Pages serves the `_expo/` directory

The worker is registered from `src/registerServiceWorker.ts` (web + production only).
The app shell and assets are precached, so the whole app works with no network.
The registration bypasses the browser's HTTP cache when checking the worker. A new
worker installs immediately, removes old caches, takes control, and reloads an open
installed app exactly once. Like every PWA, it needs a network connection and an
opportunity for the browser to run; a closed offline device updates on its next
online launch.

### Publishing release notes

For each user-visible release:

1. Bump `CURRENT_RELEASE` and its date in `src/releases.ts`.
2. Replace the localized `whatsNew.items` entries in every file under `src/i18n/`.
3. Keep the package and Expo versions aligned in `package.json`, `package-lock.json`,
   and `app.json`.

The typed `Strings` contract prevents a locale from omitting the release-note UI,
and `npm run test:scoring` verifies that all localized rules and note lists remain
structurally synchronized.

> **Note (iOS):** Safari may evict a PWA's stored data after ~7 days of no use, so
> an in-progress game saved on iOS isn't guaranteed to survive a long break. This is
> an iOS PWA limitation, accepted as part of the move off the native app.

## Deploying to GitHub Pages

Deployment is automatic via **GitHub Actions** (`.github/workflows/deploy.yml`):
every push to `main` builds the PWA and publishes `dist/` to Pages.

**One-time setup:** in the repo, go to **Settings → Pages → Build and deployment**
and set **Source** to **"GitHub Actions"**. The site then lives at
https://gabrielctn.github.io/skull-king-score-keeper/.

If you fork/rename the repo, update `experiments.baseUrl` in `app.json` and the
`start_url`/`scope`/icon paths in `web/manifest.webmanifest` to the new sub-path.

---

## Project structure

```
Skull-King/
├── App.tsx                       # Root: screen routing + load/save game
├── index.ts                      # Expo entry point
├── app.json                      # Expo config (web + experiments.baseUrl)
├── package.json
├── tsconfig.json
├── babel.config.js
├── .github/workflows/deploy.yml  # CI: build + deploy to GitHub Pages
├── web/                          # PWA shell (source, committed)
│   ├── manifest.webmanifest
│   ├── service-worker.js         # template; precache list filled at build
│   └── icons/                    # 192 / 512 / 512-maskable / apple-touch
├── src/
│   ├── types.ts                  # Shared types (Player, Game, RoundEntry)
│   ├── scoring.ts                # Pure scoring engine (fully unit-tested)
│   ├── storage.ts                # AsyncStorage (→ localStorage on web)
│   ├── backup.ts                 # Versioned, validated JSON import/export
│   ├── pwaInstall.ts             # Deferred install prompt + iOS guidance
│   ├── registerServiceWorker.ts  # Registers the SW (web + prod only)
│   ├── theme.ts                  # Colors + spacing tokens
│   ├── components/
│   │   └── Stepper.tsx           # Reusable +/- number input
│   └── screens/
│       ├── HomeScreen.tsx
│       ├── SetupScreen.tsx
│       ├── GameScreen.tsx        # Round entry + live scoreboard
│       └── ResultsScreen.tsx
└── scripts/
    ├── build-pwa.mjs             # Post-export PWA build step
    ├── test-backup.ts            # Backup validation and merge tests
    └── test-scoring.ts           # Scoring engine tests
```

## Developer scripts

```bash
npm run web            # Expo web dev server
npm run build:web      # production PWA build → dist/
npm test               # typecheck + every automated test suite
npm run test:scoring   # scoring engine tests
npm run test:backup    # backup validation, migration and merge tests
npm run typecheck      # tsc --noEmit
```
