/**
 * Release notes shown to players.
 *
 * Bump `CURRENT_RELEASE` for each user-visible release, put ONLY that
 * release's news in `whatsNew.items`, and move the previous release's lines
 * into `whatsNew.history` under its version number, adding it to
 * `PAST_RELEASES` below. The dialog that opens on launch then shows what is
 * actually new; everything older stays available under "Previous versions" in
 * Settings.
 *
 * Write the lines for players, not for the repo: one short sentence per new
 * feature, no internals, no rationale. "Join a table with a 6-character code"
 * is a release note; "table_invites RPC with a 15-minute TTL" is not.
 */
export const CURRENT_RELEASE = "1.13.0";
export const CURRENT_RELEASE_DATE = "2026-08-06";

/** Shipped releases before this one, newest first. */
export const PAST_RELEASES = [
  { version: "1.12.0", date: "2026-08-06" },
  { version: "1.11.2", date: "2026-08-06" },
  { version: "1.11.1", date: "2026-08-04" },
  { version: "1.11.0", date: "2026-08-04" },
  { version: "1.10.2", date: "2026-08-04" },
  { version: "1.10.1", date: "2026-07-30" },
  { version: "1.10.0", date: "2026-07-29" },
] as const;
