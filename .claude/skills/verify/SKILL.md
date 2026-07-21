---
name: verify
description: Build, launch, and drive this Expo web app to verify changes end-to-end.
---

# Verifying the Skull King score keeper

## Build & launch

```bash
npm ci                                  # node_modules is not preinstalled in fresh containers
npx expo start --web --port 8081 &      # Metro dev server; first bundle takes ~20-60s
curl -s -o /dev/null -w "%{http_code}" http://localhost:8081   # 200 once up
```

Static checks (CI territory, not verification): `npm run typecheck`,
`npm run test:scoring`, `npm run test:storage`.

## Driving with Playwright

Global Playwright lives at `/opt/node22/lib/node_modules/playwright` (import it
by absolute path in an `.mjs` script); Chromium is at `/opt/pw-browsers`.

Gotchas learned the hard way:

- Wait for `getByText("New game", { exact: true })` before interacting — the
  first Metro bundle is slow and `networkidle` fires too early.
- A "What's new" release-notes modal may cover the home screen; dismiss it via
  its "Got it" button first.
- Each browser launch has fresh localStorage, so there is never a "Resume game"
  button in a new session — recreate the game in-script.
- The in-game next/previous round chevrons are `›` / `‹` text nodes, but the
  play-order banner uses the same `›` character as separators. The header
  chevron is the FIRST exact `›` in DOM order: `getByText("›", { exact: true }).nth(0)`.
- Text inputs are plain `input` elements; fill the first two with player names
  before starting a game.
- A cookie-consent banner overlays the bottom of the screen on each fresh
  browser context and intercepts clicks on footer buttons; dismiss it via its
  "Decline" button right after load.
- Buttons whose visible label starts with an emoji (e.g. "🔗 Copy link") do
  not match `getByText("Copy link", { exact: true })` — drop `exact`.
- RN-web modal sheets slide in: text waits succeed before the animation ends,
  so `waitForTimeout(~700)` before screenshots of an open sheet.
- Live score sync (`liveSession.ts`) talks to Supabase. To drive the live UI
  without the deployed schema, stub the RPCs with Playwright route
  interception: `**/rest/v1/rpc/create_live_game` → fulfill with a bare
  JSON-string UUID; `**/rest/v1/live_games**` → fulfill with
  `{state, updated_at}` for the spectator's initial fetch. The realtime
  WebSocket is not stubbed (the spectator "Live" badge only lights up against a
  real deployed publication); the initial REST fetch still delivers the game.
- `isVisible()` returns immediately — use `.waitFor()` to await async-loaded
  content (e.g. a spectator screen populated from a network fetch).

## Flows worth driving

- Setup: add names → pick options → "Start game ☠️" → land on Round 1.
- Round structures: each option row shows its card sequence; the classic row
  embeds the rounds stepper (labeled "Rounds").
- Scoring sanity: with a 0 bid, "ROUND POINTS" shows `+10 × cards dealt`.
- Last round shows "Finish game 🏁" instead of "Score round →".
- Language: the gear button (top-right on home, labeled "Settings"/"Paramètres")
  opens the Settings screen; its language rows (Français/English/Deutsch/
  العربية/中文) switch the whole UI instantly.
- Settings also hosts: the keep-screen-awake toggle (hidden if the browser has
  no `navigator.wakeLock`), backup export/import, "Delete all games" (disabled
  until a game exists; confirmation dialog), and the What's new modal.
