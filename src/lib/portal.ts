import type { SupabaseClient } from "@supabase/supabase-js";
import { Instellingen, Offerte } from "./types";
import { rowToInstellingen, rowToOfferte } from "./db";

type Row = Record<string, unknown>;

/**
 * Haalt een offerte + bijbehorend bedrijfsprofiel op voor het publieke
 * klantportaal — buiten RLS om (admin-client). De offerte-id (een
 * onraadbare UUID) fungeert hier als toegangssleutel, zoals bij elke
 * "magic link". Gebruik dit alleen voor exacte id-lookups, nooit voor
 * listings.
 */
export async function haalOfferteVoorPortaal(
  adminClient: SupabaseClient,
  id: string
): Promise<{ offerte: Offerte; instellingen: Instellingen; profileId: string } | undefined> {
  const { data, error } = await adminClient
    .from("offertes")
    .select("*, profiles(*)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return undefined;

  const { profiles, ...offerteRow } = data as Row & { profiles: Row | null };
  if (!profiles) return undefined;

  return {
    offerte: rowToOfferte(offerteRow),
    instellingen: rowToInstellingen(profiles),
    profileId: offerteRow.profile_id as string,
  };
}

/**
 * Zet de status van een offerte alleen om als die nog niet definitief was
 * (concept/verzonden → geaccepteerd/afgewezen). Voorkomt dubbele
 * verwerking (en dubbele facturen) als de klant twee keer op de link klikt.
 */
export async function verwerkKlantReactie(
  adminClient: SupabaseClient,
  id: string,
  actie: "geaccepteerd" | "afgewezen"
): Promise<Offerte | undefined> {
  const { data, error } = await adminClient
    .from("offertes")
    .update({ status: actie, updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["concept", "verzonden"])
    .select()
    .maybeSingle();
  if (error || !data) return undefined;
  return rowToOfferte(data);
}

/**
 * Verwerkt de reactie van de klant op een planningsvoorstel: akkoord
 * (→ bevestigd) of een tegenvoorstel met een andere datum
 * (→ tegenvoorstel, wacht op de ondernemer). Alleen toegestaan als de
 * offerte op dit moment daadwerkelijk op een reactie van de klant wacht
 * (planning_status = 'voorgesteld'), anders voorkomt de voorwaardelijke
 * update dubbele/verlopen reacties.
 */
export async function verwerkPlanningReactie(
  adminClient: SupabaseClient,
  id: string,
  actie: "akkoord" | "tegenvoorstel",
  nieuweDatum?: string,
  notitie?: string
): Promise<Offerte | undefined> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (actie === "akkoord") {
    update.planning_status = "bevestigd";
  } else {
    if (!nieuweDatum) return undefined;
    update.planning_status = "tegenvoorstel";
    update.planning_datum = new Date(nieuweDatum).toISOString();
    update.planning_notitie = notitie?.trim() || "";
    update.planning_voorgesteld_door = "klant";
  }

  const { data, error } = await adminClient
    .from("offertes")
    .update(update)
    .eq("id", id)
    .eq("planning_status", "voorgesteld")
    .select()
    .maybeSingle();
  if (error || !data) return undefined;
  return rowToOfferte(data);
}
