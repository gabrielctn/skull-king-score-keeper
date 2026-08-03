import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./liveConfig";

/**
 * The single Supabase client shared by live sessions and cloud backup.
 *
 * Both features talk to the same project, so they must share one client: a
 * second instance would open its own realtime socket and auth manager for no
 * benefit. Created lazily so a build with no backend configured never
 * instantiates one at all.
 */

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

/** Uniform error for a failed RPC or query, naming the operation. */
export function rpcError(
  operation: string,
  error: { message?: string } | null
): Error {
  return new Error(`${operation} failed: ${error?.message ?? "unknown error"}`);
}

/** Matches the UUIDs Supabase issues as session and owner identifiers. */
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
