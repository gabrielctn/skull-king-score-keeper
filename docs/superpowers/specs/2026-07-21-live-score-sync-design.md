# Live score sync (Supabase) — design

Date: 2026-07-21
Status: implemented

## Goal

Extend the QR live-follow (see 2026-07-20-live-score-follow-design.md) from a
re-scan-to-refresh *snapshot* to a genuinely *live* view: a player who scans
once sees the game master's bids, tricks and bonuses appear on their own phone
in real time, without re-scanning. Do this without turning the app into a
server-hosted SPA, and without losing the offline snapshot for tables with no
connection.

## Decisions

### Static frontend + a thin sync backend, not a server app

The app stays a static offline-first PWA on GitHub Pages. "Live" is a small
sync service the browsers talk to — chosen: **Supabase** (free tier), for its
Postgres + row-level security + Realtime (WebSocket) in one place.

One row per session in `public.live_games` holds the full game state as JSONB.
The game master upserts it; spectators read it once and subscribe to Realtime
`UPDATE`/`DELETE` on their row. No device-to-device connection; the app frame
never changes hosting.

### Capabilities: a readable id, a writable key

The QR now carries only `#live=<uuid>` — the row's unguessable id, which is the
*read* capability. *Writing* requires a per-session **writer key** generated on
the game master's device; only its SHA-256 is stored server-side, in a table no
API role can read. All writes go through `SECURITY DEFINER` functions
(`create/update/end_live_game`) that check the key hash; the anon role can only
`SELECT` non-expired sessions and `EXECUTE` those functions. `schema.sql` is
idempotent and self-contained.

Rows auto-expire 24 h after the last update (sliding), with opportunistic
cleanup on each create, so player names don't linger on a third-party server.

### Untrusted on the way back in

Server state is attacker-influenceable (anyone can call `update_live_game` with
a valid session's… no — writes need the key; but a malformed row, a tampered
payload, or a future schema still must not reach the UI). Every payload a
spectator receives — initial fetch and each Realtime event — is re-validated
through `normalizeUntrustedGame`, the same hardening as backup/snapshot imports.
A payload that fails validation triggers a plain refetch rather than a crash.

### A resilient game-master manager

`LiveSessionManager` (singleton) owns the master's session: start/stop, and a
debounced, coalesced, retrying push bound to the app's existing `persist()`
pipeline — every local save mirrors to the session, latest-state-wins, with an
error→retry loop when the network drops. It **restores** a previously started
session for the loaded game after an app restart (credentials kept per game in
AsyncStorage), so the QR stays valid and pushes resume without reopening the
sheet. Transport and persistence are injected as ports, so the whole manager is
unit-tested against an in-memory fake — no network.

### The spectator watcher

`watchLiveGame` does the initial fetch, subscribes to Realtime, and refetches
on reconnect and on tab-focus regain (Realtime can miss events while
backgrounded). It reports a status (`connecting`/`live`/`reconnecting`/`ended`/
`notFound`/`error`) that `SpectatorScreen` surfaces as a badge/banner. `ended`
(row deleted) keeps the last scores on screen under an "session ended" banner;
`notFound` on first load shows the friendly error view.

### One sheet, live primary + snapshot fallback

`ShareLiveModal` leads with the live action when a backend is configured
(Start → QR of the short session URL + status pill + Stop), and keeps the
offline snapshot QR as a collapsible fallback ("No connection at the table?").
With no backend configured (`liveConfigured()` false — e.g. a fork), the sheet
shows only the snapshot, so the feature degrades cleanly. `SpectatorScreen`
handles both a static snapshot game and a live session id; the standings, the
reused `ScoreBreakdownModal`, the "You" identity recall and the chart are shared
across both modes.

### App-level routing

`App.tsx` resolves spectator mode synchronously before first paint: a fresh
`#live=` scan wins over a fresh `#skl=` snapshot, which wins over a session
restored from this tab's `sessionStorage`; live over snapshot. The hash is
stripped immediately (player names must not reach analytics/history), and a
`hashchange` listener handles re-scans while open. The decoded/streamed game is
never merged into the device's own games.

## Configuration & ops

- `src/liveConfig.ts` — public project URL + publishable key (shipped in the
  bundle by design; RLS + the definer functions are the real protection).
- `supabase/schema.sql` — one-time paste-and-run.
- `.github/workflows/supabase-keepalive.yml` — weekly REST ping so the free
  tier is not paused after ~7 days idle.

## Testing

`scripts/test-livesession.ts` (in `npm test`, fake transport + in-memory store,
33 checks): writer-key format, payload size guard, URL/hash helpers, and the
full manager lifecycle — start→live, debounced coalesced push (rapid edits →
one call, latest wins), push-failure→error→retry→recovery, stop deletes the
session and ignores later edits, restore re-attaches after a restart and stays
idle when the row expired, start failure. Watcher: initial delivery, realtime
update delivery, malformed-payload absorption, `ended` on delete, `notFound`
on unknown id, and validation rejecting garbage state before the UI. The full
game-master → live scan → real-time update → stop flow is also driven
end-to-end with Playwright against a stubbed transport in the browser.
