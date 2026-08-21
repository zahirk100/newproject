import { createAdminClient } from "./supabase/admin";

export interface PlatformStats {
  totaalAccounts: number;
  nieuweAccounts7Dagen: number;
  nieuweAccounts30Dagen: number;
  actieveAccounts: number;
  totaalOffertes: number;
  offertesGeaccepteerd: number;
  recenteRegistraties: { bedrijfsnaam: string; createdAt: string }[];
}

/**
 * Platformbrede cijfers voor de admin, dwars door alle ondernemer-accounts
 * heen. Gebruikt de service-role client: normale RLS scoopt profiles/
 * offertes op de ingelogde gebruiker, hier moet juist alles geteld worden.
 * Alleen aanroepen ná een expliciete isAdmin()-check op de pagina zelf.
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  const supabase = createAdminClient();
  const nu = Date.now();
  const dag = 24 * 60 * 60 * 1000;
  const sinds7 = new Date(nu - 7 * dag).toISOString();
  const sinds30 = new Date(nu - 30 * dag).toISOString();

  const [
    { count: totaalAccounts },
    { count: nieuweAccounts7Dagen },
    { count: nieuweAccounts30Dagen },
    { count: totaalOffertes },
    { count: offertesGeaccepteerd },
    { data: offerteProfielen },
    { data: recent },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sinds7),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sinds30),
    supabase.from("offertes").select("id", { count: "exact", head: true }),
    supabase
      .from("offertes")
      .select("id", { count: "exact", head: true })
      .eq("status", "geaccepteerd"),
    supabase.from("offertes").select("profile_id"),
    supabase
      .from("profiles")
      .select("bedrijfsnaam, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const actieveAccounts = new Set((offerteProfielen ?? []).map((r) => r.profile_id as string)).size;

  return {
    totaalAccounts: totaalAccounts ?? 0,
    nieuweAccounts7Dagen: nieuweAccounts7Dagen ?? 0,
    nieuweAccounts30Dagen: nieuweAccounts30Dagen ?? 0,
    actieveAccounts,
    totaalOffertes: totaalOffertes ?? 0,
    offertesGeaccepteerd: offertesGeaccepteerd ?? 0,
    recenteRegistraties: (recent ?? []).map((r) => ({
      bedrijfsnaam: (r.bedrijfsnaam as string) || "Naamloos",
      createdAt: r.created_at as string,
    })),
  };
}
