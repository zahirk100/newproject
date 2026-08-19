import type { SupabaseClient } from "@supabase/supabase-js";
import { Factuur, FactuurStatus, Instellingen, Klant, Offerte, OfferteRegel, OfferteStatus } from "./types";

type Row = Record<string, unknown>;

function rowToInstellingen(row: Row): Instellingen {
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
  };
}

function instellingenToRow(instellingen: Partial<Instellingen>): Row {
  const row: Row = {};
  if (instellingen.bedrijfsnaam !== undefined) row.bedrijfsnaam = instellingen.bedrijfsnaam;
  if (instellingen.adres !== undefined) row.adres = instellingen.adres;
  if (instellingen.kvkNummer !== undefined) row.kvk_nummer = instellingen.kvkNummer;
  if (instellingen.btwNummer !== undefined) row.btw_nummer = instellingen.btwNummer;
  if (instellingen.iban !== undefined) row.iban = instellingen.iban;
  if (instellingen.email !== undefined) row.email = instellingen.email;
  if (instellingen.telefoon !== undefined) row.telefoon = instellingen.telefoon;
  if (instellingen.standaardUurtarief !== undefined)
    row.standaard_uurtarief = instellingen.standaardUurtarief;
  if (instellingen.standaardBtwPercentage !== undefined)
    row.standaard_btw_percentage = instellingen.standaardBtwPercentage;
  if (instellingen.logoUrl !== undefined) row.logo_url = instellingen.logoUrl;
  if (instellingen.merkkleur !== undefined) row.merkkleur = instellingen.merkkleur;
  return row;
}

export async function getInstellingen(
  supabase: SupabaseClient,
  userId: string
): Promise<Instellingen> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) {
    throw new Error(`Kon bedrijfsprofiel niet laden: ${error?.message ?? "niet gevonden"}`);
  }
  return rowToInstellingen(data);
}

export async function saveInstellingen(
  supabase: SupabaseClient,
  userId: string,
  instellingen: Partial<Instellingen>
): Promise<Instellingen> {
  const { data, error } = await supabase
    .from("profiles")
    .update(instellingenToRow(instellingen))
    .eq("id", userId)
    .select()
    .single();
  if (error || !data) {
    throw new Error(`Opslaan van instellingen mislukt: ${error?.message}`);
  }
  return rowToInstellingen(data);
}

function rowToKlant(row: Row): Klant {
  return {
    id: row.id as string,
    naam: (row.naam as string) ?? "",
    adres: (row.adres as string) ?? "",
    email: (row.email as string) ?? "",
    telefoon: (row.telefoon as string) ?? "",
    createdAt: row.created_at as string,
  };
}

export async function listKlanten(supabase: SupabaseClient, userId: string): Promise<Klant[]> {
  const { data, error } = await supabase
    .from("klanten")
    .select("*")
    .eq("profile_id", userId)
    .order("naam", { ascending: true });
  if (error) throw new Error(`Kon klanten niet laden: ${error.message}`);
  return (data ?? []).map(rowToKlant);
}

export async function getKlant(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<Klant | undefined> {
  const { data, error } = await supabase
    .from("klanten")
    .select("*")
    .eq("profile_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Kon klant niet laden: ${error.message}`);
  return data ? rowToKlant(data) : undefined;
}

export async function createKlant(
  supabase: SupabaseClient,
  userId: string,
  klant: Omit<Klant, "id" | "createdAt">
): Promise<Klant> {
  const { data, error } = await supabase
    .from("klanten")
    .insert({
      profile_id: userId,
      naam: klant.naam,
      adres: klant.adres,
      email: klant.email,
      telefoon: klant.telefoon,
    })
    .select()
    .single();
  if (error || !data) throw new Error(`Aanmaken van klant mislukt: ${error?.message}`);
  return rowToKlant(data);
}

export async function updateKlant(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  klant: Partial<Omit<Klant, "id" | "createdAt">>
): Promise<Klant> {
  const { data, error } = await supabase
    .from("klanten")
    .update(klant)
    .eq("profile_id", userId)
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw new Error(`Bijwerken van klant mislukt: ${error?.message}`);
  return rowToKlant(data);
}

export async function deleteKlant(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("klanten")
    .delete()
    .eq("profile_id", userId)
    .eq("id", id);
  if (error) throw new Error(`Verwijderen van klant mislukt: ${error.message}`);
}

function rowToOfferte(row: Row): Offerte {
  return {
    id: row.id as string,
    offerteNummer: row.offerte_nummer as string,
    klantId: (row.klant_id as string | null) ?? null,
    klantnaam: (row.klant_naam as string) ?? "",
    klantadres: (row.klant_adres as string) ?? "",
    klantEmail: (row.klant_email as string) ?? "",
    klusOmschrijving: (row.klus_omschrijving as string) ?? "",
    regels: (row.regels as OfferteRegel[]) ?? [],
    btwPercentage: Number(row.btw_percentage ?? 21),
    status: (row.status as OfferteStatus) ?? "concept",
    opmerkingen: (row.opmerkingen as string) ?? "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listOffertes(supabase: SupabaseClient, userId: string): Promise<Offerte[]> {
  const { data, error } = await supabase
    .from("offertes")
    .select("*")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Kon offertes niet laden: ${error.message}`);
  return (data ?? []).map(rowToOfferte);
}

export async function getOfferte(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<Offerte | undefined> {
  const { data, error } = await supabase
    .from("offertes")
    .select("*")
    .eq("profile_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Kon offerte niet laden: ${error.message}`);
  return data ? rowToOfferte(data) : undefined;
}

export async function nextOfferteNummer(supabase: SupabaseClient, userId: string): Promise<string> {
  const year = new Date().getFullYear();
  const { count, error } = await supabase
    .from("offertes")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", userId)
    .like("offerte_nummer", `OF-${year}-%`);
  if (error) throw new Error(`Kon volgend offertenummer niet bepalen: ${error.message}`);
  return `OF-${year}-${String((count ?? 0) + 1).padStart(3, "0")}`;
}

export async function createOfferte(
  supabase: SupabaseClient,
  userId: string,
  offerte: {
    offerteNummer: string;
    klantId: string | null;
    klantnaam: string;
    klantadres: string;
    klantEmail: string;
    klusOmschrijving: string;
    regels: OfferteRegel[];
    btwPercentage: number;
  }
): Promise<Offerte> {
  const { data, error } = await supabase
    .from("offertes")
    .insert({
      profile_id: userId,
      offerte_nummer: offerte.offerteNummer,
      klant_id: offerte.klantId,
      klant_naam: offerte.klantnaam,
      klant_adres: offerte.klantadres,
      klant_email: offerte.klantEmail,
      klus_omschrijving: offerte.klusOmschrijving,
      regels: offerte.regels,
      btw_percentage: offerte.btwPercentage,
    })
    .select()
    .single();
  if (error || !data) throw new Error(`Aanmaken van offerte mislukt: ${error?.message}`);
  return rowToOfferte(data);
}

export async function updateOfferte(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Partial<Offerte>
): Promise<Offerte> {
  const row: Row = { updated_at: new Date().toISOString() };
  if (patch.klantId !== undefined) row.klant_id = patch.klantId;
  if (patch.klantnaam !== undefined) row.klant_naam = patch.klantnaam;
  if (patch.klantadres !== undefined) row.klant_adres = patch.klantadres;
  if (patch.klantEmail !== undefined) row.klant_email = patch.klantEmail;
  if (patch.klusOmschrijving !== undefined) row.klus_omschrijving = patch.klusOmschrijving;
  if (patch.regels !== undefined) row.regels = patch.regels;
  if (patch.btwPercentage !== undefined) row.btw_percentage = patch.btwPercentage;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.opmerkingen !== undefined) row.opmerkingen = patch.opmerkingen;

  const { data, error } = await supabase
    .from("offertes")
    .update(row)
    .eq("profile_id", userId)
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw new Error(`Bijwerken van offerte mislukt: ${error?.message}`);
  return rowToOfferte(data);
}

export async function deleteOfferte(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("offertes")
    .delete()
    .eq("profile_id", userId)
    .eq("id", id);
  if (error) throw new Error(`Verwijderen van offerte mislukt: ${error.message}`);
}

function rowToFactuur(row: Row): Factuur {
  return {
    id: row.id as string,
    offerteId: (row.offerte_id as string | null) ?? null,
    factuurNummer: row.factuur_nummer as string,
    klantnaam: (row.klant_naam as string) ?? "",
    klantadres: (row.klant_adres as string) ?? "",
    klantEmail: (row.klant_email as string) ?? "",
    regels: (row.regels as OfferteRegel[]) ?? [],
    btwPercentage: Number(row.btw_percentage ?? 21),
    status: (row.status as FactuurStatus) ?? "open",
    factuurdatum: row.factuurdatum as string,
    vervaldatum: row.vervaldatum as string,
    createdAt: row.created_at as string,
  };
}

export async function listFacturen(supabase: SupabaseClient, userId: string): Promise<Factuur[]> {
  const { data, error } = await supabase
    .from("facturen")
    .select("*")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Kon facturen niet laden: ${error.message}`);
  return (data ?? []).map(rowToFactuur);
}

export async function nextFactuurNummer(supabase: SupabaseClient, userId: string): Promise<string> {
  const year = new Date().getFullYear();
  const { count, error } = await supabase
    .from("facturen")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", userId)
    .like("factuur_nummer", `FA-${year}-%`);
  if (error) throw new Error(`Kon volgend factuurnummer niet bepalen: ${error.message}`);
  return `FA-${year}-${String((count ?? 0) + 1).padStart(3, "0")}`;
}

export async function createFactuur(
  supabase: SupabaseClient,
  userId: string,
  factuur: {
    offerteId: string | null;
    factuurNummer: string;
    klantnaam: string;
    klantadres: string;
    klantEmail: string;
    regels: OfferteRegel[];
    btwPercentage: number;
  }
): Promise<Factuur> {
  const { data, error } = await supabase
    .from("facturen")
    .insert({
      profile_id: userId,
      offerte_id: factuur.offerteId,
      factuur_nummer: factuur.factuurNummer,
      klant_naam: factuur.klantnaam,
      klant_adres: factuur.klantadres,
      klant_email: factuur.klantEmail,
      regels: factuur.regels,
      btw_percentage: factuur.btwPercentage,
    })
    .select()
    .single();
  if (error || !data) throw new Error(`Aanmaken van factuur mislukt: ${error?.message}`);
  return rowToFactuur(data);
}

export async function updateFactuurStatus(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  status: FactuurStatus
): Promise<Factuur> {
  const { data, error } = await supabase
    .from("facturen")
    .update({ status })
    .eq("profile_id", userId)
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw new Error(`Bijwerken van factuur mislukt: ${error?.message}`);
  return rowToFactuur(data);
}
