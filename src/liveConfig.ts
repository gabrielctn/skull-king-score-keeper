/**
 * Supabase project backing the live score follow.
 *
 * Both values are public by design: they ship in the client bundle and only
 * grant what row-level security and the SECURITY DEFINER functions in
 * supabase/schema.sql allow. Forks without a backend can blank them out —
 * the app then falls back to snapshot-only QR sharing.
 */
export const SUPABASE_URL = "https://hkjneydxqdjasmppfsdp.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_V2lxGSsQd88NkUzr6nwdOA_S19pbaZn";

/** True when a live backend is configured for this build. */
export function liveConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_PUBLISHABLE_KEY.length > 0;
}
