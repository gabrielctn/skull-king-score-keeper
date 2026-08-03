# Offline Snapshot Removal Design

**Date:** 2026-08-03
**Status:** Approved in conversation

## Goal

Remove the QR-encoded offline score snapshot completely. Live QR sharing backed
by the existing Supabase session remains the only way for players to follow a
game on their own devices.

## Scope

- Remove creation of `#skl=` links and their QR codes.
- Stop recognizing, decoding, storing, or restoring legacy `#skl=` links.
- Remove the static branch of spectator mode and keep its live-session branch.
- Remove offline-snapshot controls, explanatory copy, translations, tests, and
  active documentation.
- Keep live QR generation, live spectator updates, reconnecting behavior,
  player identity, sorting, and score details unchanged.
- Keep unrelated internal uses of the word `snapshot`, including live and cloud
  synchronization payloads and aggregated statistics.

## Design

### URL utilities

Delete `src/shareLink.ts`, including its binary codec and spectator-session
storage. Move the few still-shared URL helpers into a small neutral module:

- the deployed PWA base URL;
- the current web page base URL used when creating share links; and
- the helper that removes a consumed capability hash from the address bar.

Live sharing, table joining, settings, and recap sharing will import these
helpers from the neutral module. They will not depend on snapshot code.

### Sharing UI

Simplify `ShareLiveModal` to render only the live session card. It will create
and copy only `#live=` links. Remove the snapshot toggle, static QR generation,
offline hints, snapshot-specific errors, and their styles and state.

The in-game Live action will be available only when the live backend is
configured, so a build without that backend does not open an empty sharing
sheet.

### App routing and spectator view

Reduce app-level spectator state to `live` or `none`. Initial launch and
`hashchange` handling will consume only valid live-session hashes. A legacy
`#skl=` hash is unrecognized and opens the normal app without a migration,
warning, or retirement screen.

Make `SpectatorScreen` live-only: it receives a required live session ID and
uses the existing live watcher. Remove its static-game prop, static labels,
snapshot timestamp branch, re-scan hint, and invalid-code path. Missing,
expired, or unreachable live sessions continue to use the existing live error
screen.

### Localization and documentation

Remove snapshot-only keys from the shared localization type and all six locale
dictionaries. Keep copy used by live sharing and live spectator states. Update
the README and source comments so the supported workflow is described as live
QR sharing only. Historical design documents remain unchanged as an audit trail
of earlier decisions.

## Testing

Follow a deletion-focused red-green cycle:

1. Add a source-level UX regression assertion that fails while active snapshot
   routing, generation, or copy still exists.
2. Remove the implementation until that assertion passes.
3. Remove the obsolete share-link codec test and its package script because the
   production module it covered no longer exists.
4. Run the complete test suite, typecheck, and web production build.
5. Search active source, scripts, README, and package configuration for
   remaining `#skl=` or offline-snapshot references. Historical specs are
   intentionally excluded from this absence check.

## Acceptance Criteria

- The sharing sheet can start, display, copy, and stop only a live QR session.
- The app never generates or consumes `#skl=` links.
- Opening an old `#skl=` link does not enter spectator mode.
- Live spectators continue to receive real-time score updates.
- No snapshot-only copy remains in any supported locale or the README.
- Tests, typecheck, and the web build pass.
