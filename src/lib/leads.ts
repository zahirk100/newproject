import type { SupabaseClient } from "@supabase/supabase-js";
import { Lead, LeadStatus } from "./types";

type Row = Record<string, unknown>;

function rowToLead(row: Row): Lead {
  return {
    id: row.id as string,
    bedrijfsnaam: (row.bedrijfsnaam as string) ?? "",
    vakgebied: (row.vakgebied as string) ?? "",
    plaats: (row.plaats as string) ?? "",
    adres: (row.adres as string) ?? "",
    website: (row.website as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    telefoon: (row.telefoon as string | null) ?? null,
    bron: (row.bron as string) ?? "",
    status: (row.status as LeadStatus) ?? "nieuw",
    emailOnderwerp: (row.email_onderwerp as string) ?? "",
    emailTekst: (row.email_tekst as string) ?? "",
    verzondenOp: (row.verzonden_op as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listLeads(supabase: SupabaseClient, status?: LeadStatus): Promise<Lead[]> {
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(`Kon leads niet laden: ${error.message}`);
  return (data ?? []).map(rowToLead);
}

export async function getLead(supabase: SupabaseClient, id: string): Promise<Lead | undefined> {
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Kon lead niet laden: ${error.message}`);
  return data ? rowToLead(data) : undefined;
}

/** Simpele dedupe: op website (indien bekend), anders op bedrijfsnaam + plaats. */
export async function bestaatLeadAl(
  supabase: SupabaseClient,
  website: string | null,
  bedrijfsnaam: string,
  plaats: string
): Promise<boolean> {
  if (website) {
    const { data } = await supabase
      .from("leads")
      .select("id")
      .eq("website", website)
      .maybeSingle();
    if (data) return true;
  }
  const { data } = await supabase
    .from("leads")
    .select("id")
    .eq("bedrijfsnaam", bedrijfsnaam)
    .eq("plaats", plaats)
    .maybeSingle();
  return Boolean(data);
}

export async function createLead(
  supabase: SupabaseClient,
  lead: {
    bedrijfsnaam: string;
    vakgebied: string;
    plaats: string;
    adres: string;
    website: string | null;
    email: string | null;
    telefoon: string | null;
    bron: string;
    status: LeadStatus;
  }
): Promise<Lead> {
  const { data, error } = await supabase
    .from("leads")
    .insert({
      bedrijfsnaam: lead.bedrijfsnaam,
      vakgebied: lead.vakgebied,
      plaats: lead.plaats,
      adres: lead.adres,
      website: lead.website,
      email: lead.email,
      telefoon: lead.telefoon,
      bron: lead.bron,
      status: lead.status,
    })
    .select()
    .single();
  if (error || !data) throw new Error(`Aanmaken van lead mislukt: ${error?.message}`);
  return rowToLead(data);
}

export async function updateLead(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Lead>
): Promise<Lead> {
  const row: Row = { updated_at: new Date().toISOString() };
  if (patch.emailOnderwerp !== undefined) row.email_onderwerp = patch.emailOnderwerp;
  if (patch.emailTekst !== undefined) row.email_tekst = patch.emailTekst;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.verzondenOp !== undefined) row.verzonden_op = patch.verzondenOp;

  const { data, error } = await supabase.from("leads").update(row).eq("id", id).select().single();
  if (error || !data) throw new Error(`Bijwerken van lead mislukt: ${error?.message}`);
  return rowToLead(data);
}

export async function deleteLead(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(`Verwijderen van lead mislukt: ${error.message}`);
}
