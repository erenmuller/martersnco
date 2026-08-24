import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses RLS entirely.
 *
 * Only ever call this from server-side code that has already verified the
 * caller is an admin (see `requireAdmin` in lib/auth.ts). It exists for the
 * two things anon/authenticated keys cannot do: creating auth users for
 * clients, and writing rows on behalf of an unauthenticated visitor.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase server credentials are not set. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before using server features.",
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
