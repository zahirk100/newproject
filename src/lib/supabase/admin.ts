import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client die RLS omzeilt. Alleen server-side gebruiken, en
 * alleen wanneer een operatie expliciet buiten de ingelogde gebruiker om
 * moet werken. Voor normale CRUD gebruik de gewone server-/browser-client.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
