import type { SupabaseClient } from "@supabase/supabase-js";
import { Instellingen, Offerte, OfferteStatus } from "./types";

type Row = Record<string, unknown>;

function rijNaarInstellingen(row: Row): Instellingen {
  return {
    bedrijfsnaam: (row.bedrijfsnaam as string) ?? "",
    adres: (row.adres as string) ?? "",
    kvkNummer: (row.kvk_nummer as string) ?? "",
    btwNummer: (row.btw_nummer as string) ?? "",
    iban: (row.iban as string) ?? "",
    email: (row.email as string) ?? "",
    telefoon: (row.telefoon as string) ?? "",
    standaardUurtarief: Number(row.standaard_uurtarief ?? 55),
    standaardBtwPercentage: Number(row.standaard_btw_percentage ?? 21),
    logoUrl: (row.logo_url as string | null) ?? null,
    merkkleur: (row.merkkleur as string) ?? "#111827",
    extraInstructies: (row.extra_instructies as string) ?? "",
  };
}

function rijNaarOfferte(row: Row): Offerte {
  return {
    id: row.id as string,
    offerteNummer: row.offerte_nummer as string,
    klantId: (row.klant_id as string | null) ?? null,
    klantnaam: (row.klant_naam as string) ?? "",
    klantadres: (row.klant_adres as string) ?? "",
    klantEmail: (row.klant_email as string) ?? "",
    klusOmschrijving: (row.klus_omschrijving as string) ?? "",
    regels: row.regels as Offerte["regels"],
    btwPercentage: Number(row.btw_percentage ?? 21),
    status: (row.status as OfferteStatus) ?? "concept",
    opmerkingen: (row.opmerkingen as string) ?? "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

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
    offerte: rijNaarOfferte(offerteRow),
    instellingen: rijNaarInstellingen(profiles),
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
  return rijNaarOfferte(data);
}
