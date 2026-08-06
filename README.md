# ☠️ Skull King Crew Ledger

A fan-made, installable **offline-first PWA** for keeping score in the **Skull King**
card game, built with **React Native + Expo (web) + TypeScript** and deployed as a
static site to **GitHub Pages**. Add it to your home screen and it runs without any
network — perfect for a table with no wifi.

**Live:** https://gabrielctn.github.io/skull-king-crew-ledger/

> **Unofficial fan project.** This app is not affiliated with, endorsed by, or
> sponsored by Grandpa Beck's Games, its publishers, or distributors. "Skull King"
> and the official game elements belong to their respective rights holders.

**Optional support:** https://buymeacoffee.com/gabrielctn — the app remains completely
free, with no ads and no accounts. Keeping it published on the App Store costs the
developer €100 a year (Apple Developer Program); contributions go towards that bill
first. The home screen states this next to the support button, and a game that ends
occasionally repeats the invitation — at most once every 30 days, never before the
third finished game, and never again once it has been answered. The throttle lives in
[`src/support.ts`](src/support.ts).

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
- **Live score follow** (Live button in the game header): the game master
  starts a Supabase-backed session and players scan its QR code with their own
  phones. Every bid, trick and bonus then appears automatically in a read-only
  view with full round-by-round details, no refresh needed.
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
- Share a table in seconds: the host taps **Invite** and reads out a
  six-character code (`K7M-4QP`, valid 15 minutes), the friend taps **Join** in
  the app they already have and types it in. A scanned QR code can never open an
  installed PWA or the iOS app, so it stays available one level down, where it
  belongs: for a friend who has not installed anything yet and lands on the web
  version. Both entry points sit on the home screen and in Settings.
- Deleting a game deletes it for the whole crew: the shared table records the
  deletion, so a crew mate's device cannot push its own copy back into the
  history and the statistics. Restoring a backup file still brings its games
  back — an explicit restore outranks an earlier deletion.
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

A setup option, **"Bonuses only on an exact bid"**, switches those capture
bonuses to the widespread house rule instead: miss your bid and you score
nothing for the cards you captured. It is off by default (the rulebook keeps
them), applies to classic scoring only — Rascal already scales bonuses by
accuracy — and is stored per game, so existing games keep the scores they were
played with.

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
dev server. The export is served under the `/skull-king-crew-ledger/` sub-path
(set by `experiments.baseUrl` in `app.json`), so to test it the way GitHub Pages
serves it, expose `dist/` at that path — e.g. symlink it into a folder named
`skull-king-crew-ledger/` and serve the parent.

## Native iOS companion

The PWA remains available and unchanged. A separate native iOS target reuses
the same React Native screens, scoring engine, translations, and local game
storage:

```bash
npm install
npm run prebuild:ios  # generates ios/ and installs CocoaPods
npm run ios           # builds and launches the iOS app
```

The generated `ios/` directory is intentionally ignored. The native App
Intents and React Native handoff are tracked under `native/ios/` and injected
on every prebuild by `plugins/withSkullKingCrewLedgerAppIntents.js`, so
regenerating the Xcode project does not erase them.

Prebuild names the Xcode project, its shared scheme and its workspace after
`expo.name`, and the Xcode Cloud workflow in App Store Connect stores those
names. They are deliberately aligned with the product name: prebuild generates
`ios/SkullKingCrewLedger.xcworkspace` and the shared `SkullKingCrewLedger`
scheme, and the Xcode Cloud workflow stores those exact values. The app is also
titled "Skull King Crew Ledger" through `ios.infoPlist.CFBundleDisplayName` on
iOS and `web.name` on the web. `ios/ci_scripts/ci_post_clone.sh`, which generates
the project on Xcode Cloud, verifies the workspace before Xcode resolves it.

The iOS app targets iOS 16 or later and exposes three App Shortcuts to Siri,
Spotlight, and Shortcuts: start a new game, continue the current game, and open
player statistics.

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

> **Note (iOS PWA only):** Safari may evict a PWA's stored data after ~7 days of
> no use, so an in-progress PWA game isn't guaranteed to survive a long break.
> The separate native iOS app uses native application storage and is not subject
> to that Safari limitation.

## Deploying to GitHub Pages

Deployment is automatic via **GitHub Actions** (`.github/workflows/deploy.yml`):
every push to `main` builds the PWA and publishes `dist/` to Pages.

**One-time setup:** in the repo, go to **Settings → Pages → Build and deployment**
and set **Source** to **"GitHub Actions"**. The site then lives at
https://gabrielctn.github.io/skull-king-crew-ledger/.

If you fork/rename the repo, update `experiments.baseUrl` in `app.json` and the
`start_url`/`scope`/icon paths in `web/manifest.webmanifest` to the new sub-path.

## Live score follow (optional Supabase backend)

Live score follow needs a tiny backend; the app stays a static PWA on GitHub
Pages either way. A fork without a configured backend does not expose the Live
sharing action.

To enable live mode on a fork:

1. Create a free **Supabase** project.
2. In the dashboard, open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql)
   (idempotent). It creates the `live_games` session table, row-level security,
   the writer-key-protected `create/update/end` functions, the Realtime
   publication, the private `user_backups` mirror, and the `table_invites` short
   codes.
3. Put the project URL and the **publishable / anon** key in
   [`src/liveConfig.ts`](src/liveConfig.ts) (both are public client values by
   design — the secret `service_role` key is never used).
4. The [`supabase-keepalive`](.github/workflows/supabase-keepalive.yml) workflow
   pings the project weekly so the free tier is not paused for inactivity.

Table invites are the one place where a table's credentials are stored in clear,
because the guest has to walk away with them. No API role can read that table:
`create_table_invite` (writer key required) mints a code, `redeem_table_invite`
trades it back, rows die after 15 minutes, and a global per-minute ceiling on
failed redemptions keeps six characters out of reach of guessing.

Only the game master's device writes (it holds a per-session writer key whose
hash lives server-side); spectators read their session by its unguessable id.
Session rows carry the player names and auto-expire 24 h after the last update,
so nothing lingers on the server. Everything a spectator receives is re-validated
through the same hardening as backup imports before it reaches the UI.

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
│   ├── appUrl.ts                 # Canonical PWA URL + share-link URL helpers
│   ├── liveSession.ts            # Live-follow sync (Supabase transport + manager)
│   ├── liveConfig.ts             # Supabase URL + publishable key (public)
│   ├── qr.ts                     # QR image (data URL) rendering
│   ├── tableInvites.ts           # Short invite codes (alphabet, parsing, TTL)
│   ├── storage.ts                # AsyncStorage (→ localStorage on web)
│   ├── backup.ts                 # Versioned, validated JSON import/export
│   ├── deletions.ts              # Deletion tombstones (a delete survives a sync)
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
