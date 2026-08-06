/**
 * Short table invite codes — the phone-to-phone way into a shared table.
 *
 * A QR code cannot open the app a guest already has: iOS hands scanned links
 * to Safari, and a home-screen PWA runs in a container no link can target. The
 * people joining a table are sitting at that table, so the invite goes the
 * other way round: the host shows six characters, the guest types them into
 * their own app. No camera, no browser, same flow on web, PWA and iOS.
 *
 * The alphabet is Crockford's base32 — no I, L, O or U — and reading a code
 * out loud is the point, so the decoder forgives what the eye confuses: i/l
 * become 1, o becomes 0, case and separators are ignored.
 */

/** Code alphabet, uppercase. 32 symbols, so 6 characters ≈ 1.1e9 codes. */
export const INVITE_CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export const INVITE_CODE_LENGTH = 6;

/** Codes are shown (and read out) in two groups of three. */
const INVITE_CODE_GROUP = 3;

/** Server-side lifetime; the client only formats the countdown from it. */
export const INVITE_TTL_SECONDS = 15 * 60;

/** Fold the look-alikes a listener or a keyboard is likely to produce. */
function foldLookAlikes(input: string): string {
  return input.toUpperCase().replace(/[IL]/g, "1").replace(/O/g, "0");
}

/**
 * Clean up whatever was typed into a canonical code, or null when it cannot be
 * one. Separators, spaces and case are all ignored, so "k7m-4qp", "K7M 4QP"
 * and "K7M4QP" are the same code.
 */
export function normalizeInviteCode(input: string): string | null {
  if (typeof input !== "string") return null;
  const compact = foldLookAlikes(input).replace(/[^0-9A-Z]/g, "");
  if (compact.length !== INVITE_CODE_LENGTH) return null;
  for (const char of compact) {
    if (!INVITE_CODE_ALPHABET.includes(char)) return null;
  }
  return compact;
}

/** Group a code for display: "K7M4QP" → "K7M-4QP". */
export function formatInviteCode(code: string): string {
  const groups: string[] = [];
  for (let at = 0; at < code.length; at += INVITE_CODE_GROUP) {
    groups.push(code.slice(at, at + INVITE_CODE_GROUP));
  }
  return groups.join("-");
}

/**
 * True when the input can only have been meant as an invite code, so the join
 * field can tell it apart from a pasted `SKC1.` code or link without asking.
 */
export function looksLikeInviteCode(input: string): boolean {
  return normalizeInviteCode(input) !== null;
}

/** Whole seconds left before `expiresAt` (epoch ms), never negative. */
export function inviteSecondsLeft(expiresAt: number, now: number): number {
  return Math.max(0, Math.ceil((expiresAt - now) / 1000));
}

/** Countdown as m:ss, for the "expires in …" line under a code. */
export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(safe % 60).padStart(2, "0")}`;
}
