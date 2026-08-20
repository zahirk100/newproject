import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Alleen het platform zelf (OfferteFlits) gebruikt admin-functies zoals de
 * leads-acquisitietool — geen enkele gewone ondernemer-klant hoort dit te
 * kunnen zien. is_admin staat standaard op false; alleen handmatig via SQL
 * op het eigen profiel te zetten.
 */
export async function isAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  return Boolean(data?.is_admin);
}
