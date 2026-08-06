# Short table invite codes — design

Date: 2026-08-06
Status: implemented

## Problem

Joining a shared table went through a QR code (or a copied link) carrying
`#join=<SKC1 code>`. Scanning it does not do what a player expects:

- **iOS camera hands scanned links to Safari.** The installed native app is
  never offered the URL. Universal Links would fix that, but they need an
  `apple-app-site-association` file served from the domain root plus an App
  Store build; the app is a GitHub Pages site under
  `/skull-king-crew-ledger/`, so neither is available.
- **A home-screen PWA is unreachable by link.** It runs in its own container
  with its own storage; a link opened in the browser lands in the *browser*
  copy of the app, not the installed one.
- A `skullking://` custom scheme would reach the native app and nothing else,
  so it fails for the majority of users.

The fallback — copying a `SKC1.` code — is 90+ characters, which is fine to
paste across devices and useless between two people sitting at the same table.

## Approach

Reverse the direction. Guests are physically next to the host, and they already
have the app; what they lack is a *short* thing to carry from one screen to the
other. The host asks the backend for a **six-character code**, and the guest
types it into their own app.

That is deliberately the opposite trade-off from a link: it cannot onboard
someone who has no app at all, but it works identically on the web, the
installed PWA and the native iOS app, and needs neither a camera nor a browser.
So the QR code and the link stay, one level down in the same sheet, labelled for
what they are actually good at: a friend who has not installed anything yet.

Alternatives rejected:

- **Universal Links / App Clips**: blocked on App Store publication and root
  domain control (see above).
- **Bluetooth or local-network handoff**: not available to an Expo web build,
  and it would not help the web version at all.
- **Shortening the sync code itself**: it carries 320 bits (owner UUID + writer
  key), i.e. ~64 base32 characters. There is no client-only way to shrink it;
  a short code has to be a server-side reference.

## Data model (`supabase/schema.sql`)

```
table_invites(code_hash pk, owner_id fk→user_backups, writer_key, created_at, expires_at)
table_invite_failures(minute pk, failures)
```

- `create_table_invite(owner_id, writer_key) → {code, expires_in}`: refuses
  unless the caller already holds the table's writer key, retires that table's
  previous code, and returns a fresh one. TTL 15 minutes.
- `redeem_table_invite(code) → {owner_id, writer_key} | {throttled:true} | null`.

Deliberate choices:

- **The row holds the writer key in clear.** The guest must end up with it, so
  the invite has to carry it. No API role can read either table; both functions
  are `SECURITY DEFINER` with `search_path = ''`, exactly like the rest of the
  schema. Storing a hash instead would make the invite useless.
- **A miss returns null instead of raising.** Raising would roll back the
  failure counter the guessing ceiling depends on.
- **The ceiling is global, not per-code.** 6 characters over a 32-symbol
  alphabet is 1.1e9 codes; capped at 100 failed redemptions a minute, a guesser
  gets ~1500 tries per code lifetime. A real crew never approaches the ceiling,
  and if one ever did, the lockout lasts a minute.
- **A code is reusable until it expires**, so a whole table joins from one code.

## Client

- `src/tableInvites.ts` — pure helpers: Crockford base32 alphabet (no I, L, O,
  U), `normalizeInviteCode` (folds i/l→1, o→0, ignores case and separators, so a
  code read aloud survives), `formatInviteCode` (`K7M-4QP`), countdown helpers.
- `cloudSync.ts` — `CloudTransport` gains `createInvite` / `redeemInvite`;
  `CloudBackupManager.createInvite()` and `.redeemInvite(code)`. Redeeming
  returns the table's ordinary `SKC1.` code, so a short code is a *carrier*, not
  a second kind of membership: the existing preview-and-confirm sheet
  (`JoinTableModal`) still decides whether the device joins.
  `classifyJoinInput` accepts a short code, a full `SKC1.` code or a pasted
  link from a single field.
- A backend without the functions answers PostgREST `PGRST202`; that maps to
  `InviteError("unsupported")`, and the invite sheet says so while the QR and
  link keep working. A deployed build therefore survives a backend that has not
  run the migration yet.
- `TableInviteModal` (host) and `JoinByCodeModal` (guest), reachable in one tap
  from the home screen's table row and from Settings.

## UI consequences

Settings' two disclosure panels (QR + copy link; paste field) are gone: both
flows now open the sheets, so there is one implementation of each. The raw
`SKC1.` display disappeared with them — the copy-link button carries the same
capability, and the join field still accepts a pasted code or link.
