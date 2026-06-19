# ☠️ Skull King Scorekeeper

A cross-platform (iOS + Android) score-keeping app for the **Skull King** card game,
built with **React Native + Expo + TypeScript**. One codebase runs on both phones.

## What it does

- Add 2+ players and choose the number of rounds (1–10, default 10).
- For each round, enter every player's **bid** and **tricks won**, plus a
  structured **bonus editor** for captured special cards — no mental math.
- Editable **cards-dealt** per round (for 7–8 players or custom round structures).
- Live per-round and running totals, with a tricks-vs-cards sanity check.
- A built-in **rules reference** (the "?" button) covering every special card.
- Final standings with ranks (ties handled) and a winner screen.
- Games auto-save, so you can close the app mid-game and resume.

## Scoring rules (built in)

Implements Grandpa Beck's **2022 Skull King** rules exactly.

Bid scoring:

- **Bid ≥ 1, hit exactly:** +20 per trick won.
- **Bid ≥ 1, missed (over or under):** −10 per trick of difference; no points for tricks made.
- **Bid 0, won 0 tricks:** +10 × **cards dealt that round**.
- **Bid 0, won any trick:** −10 × **cards dealt that round**.

(The zero-bid multiplier uses cards *dealt*, which can be fewer than the round
number in late rounds with 7–8 players — handled by the editable cards field.)

Bonus points — **awarded for captures regardless of whether you hit your bid**,
and they go to whoever *captures* the card, no matter who played it:

- Colored 14 (yellow / purple / green): **+10** each
- Black 14 (Jolly Roger / trump): **+20**
- Mermaid captured by a pirate: **+20** each
- Pirate captured by the Skull King: **+30** each
- Mermaid captures the Skull King: **+40**

Conditional extras (in the bonus editor when "Loot & Rascal wager" is on):

- **Loot / Butin alliance:** +20 to each ally, **only if both allies hit their
  exact bid**. Enter it only when the alliance succeeded.
- **Rascal pirate wager (0/10/20):** gained if you hit your bid, lost if you miss.

Special cards that affect *what you enter* (explained in the in-app "?" reference):

- **Kraken:** the trick is destroyed — nobody wins it, no captures count. (So the
  round's tricks can total fewer than the cards dealt.)
- **White Whale:** specials are nullified and the highest *number* wins; no
  special-card capture bonuses happen in a whale trick.

The scoring engine is covered by 29 unit tests (`npm run test:scoring`),
including the rulebook's worked examples and edge cases.

---

## Run it on your phone (fastest way)

You don't need Xcode to start — just the **Expo Go** app.

1. Install **Expo Go** on your phone (App Store / Google Play).
2. In a terminal, from this folder:

   ```bash
   npm install
   npx expo install --fix   # aligns dependency versions to the Expo SDK
   npx expo start
   ```

3. A QR code appears in the terminal.
   - **iPhone:** open the Camera app, point it at the QR code, tap the banner.
   - **Android:** open Expo Go → "Scan QR code".

The app loads on your phone and hot-reloads as the code changes.

## Run in a simulator (optional, needs the SDKs)

- **iOS Simulator** (Mac + Xcode): press `i` in the `expo start` terminal.
- **Android Emulator** (Android Studio): press `a`.

---

## Building for the App Store / Play Store (later)

Use **EAS Build** — Expo's cloud build service. It can build the **iOS** app even
without a Mac.

```bash
npm install -g eas-cli
eas login                     # create a free Expo account if needed
eas build:configure
eas build --platform ios      # or: android, or: all
eas submit --platform ios     # uploads to App Store Connect / Play Console
```

App Store submission still requires a paid **Apple Developer Program** membership
($99/yr); Google Play requires a one-time $25 developer account.

---

## Project structure

```
Skull-King/
├── App.tsx                 # Root: screen routing + load/save game
├── index.ts                # Expo entry point
├── app.json                # Expo app config (name, bundle ids, etc.)
├── package.json
├── tsconfig.json
├── babel.config.js
├── src/
│   ├── types.ts            # Shared types (Player, Game, RoundEntry)
│   ├── scoring.ts          # Pure scoring engine (fully unit-tested)
│   ├── storage.ts          # AsyncStorage save/load/clear
│   ├── theme.ts            # Colors + spacing tokens
│   ├── components/
│   │   └── Stepper.tsx     # Reusable +/- number input
│   └── screens/
│       ├── HomeScreen.tsx
│       ├── SetupScreen.tsx
│       ├── GameScreen.tsx  # Round entry + live scoreboard
│       └── ResultsScreen.tsx
└── scripts/
    └── test-scoring.ts     # Scoring engine tests
```

## Developer scripts

```bash
npm run test:scoring   # run the scoring engine tests (19 checks)
npm run typecheck      # tsc --noEmit
```

---

## Note on the old Swift files

This folder previously held an empty native Xcode template (`Skull-King.xcodeproj`
and the Swift files in `Skull-King/`). The cross-platform Expo project replaces it.
You can safely delete `Skull-King.xcodeproj/` and the `Skull-King/` Swift folder
once you've confirmed the Expo app runs.
