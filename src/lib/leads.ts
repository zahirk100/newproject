import type { SupabaseClient } from "@supabase/supabase-js";
import { Lead, LeadStatus } from "./types";
import { standaardOutreachTekst, verstuurOutreachEmail } from "./email";

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
    resendEmailId: (row.resend_email_id as string | null) ?? null,
    geopendOp: (row.geopend_op as string | null) ?? null,
    geklikOp: (row.geklikt_op as string | null) ?? null,
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

export async function getLeadByResendId(
  supabase: SupabaseClient,
  resendEmailId: string
): Promise<Lead | undefined> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("resend_email_id", resendEmailId)
    .maybeSingle();
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
  if (patch.resendEmailId !== undefined) row.resend_email_id = patch.resendEmailId;
  if (patch.geopendOp !== undefined) row.geopend_op = patch.geopendOp;
  if (patch.geklikOp !== undefined) row.geklikt_op = patch.geklikOp;

  const { data, error } = await supabase.from("leads").update(row).eq("id", id).select().single();
  if (error || !data) throw new Error(`Bijwerken van lead mislukt: ${error?.message}`);
  return rowToLead(data);
}

export async function deleteLead(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(`Verwijderen van lead mislukt: ${error.message}`);
}

/**
 * Past de standaard concepttekst toe op alle nog niet beoordeelde leads met
 * bekend e-mailadres en zet ze op 'klaar'. Gedeeld door de "Alles
 * goedkeuren"-knop en de volledig automatische dagelijkse cron.
 */
export async function keurAlleNieuweLeadsGoed(
  supabase: SupabaseClient,
  appUrl: string
): Promise<{ goedgekeurd: number }> {
  const nieuw = (await listLeads(supabase, "nieuw")).filter((lead) => lead.email);

  let goedgekeurd = 0;
  for (const lead of nieuw) {
    const { onderwerp, tekst } = standaardOutreachTekst(lead, appUrl);
    try {
      await updateLead(supabase, lead.id, {
        emailOnderwerp: onderwerp,
        emailTekst: tekst,
        status: "klaar",
      });
      goedgekeurd++;
    } catch {
      // Eén mislukte lead mag de rest niet blokkeren.
    }
  }
  return { goedgekeurd };
}

/**
 * Verstuurt de eerstvolgende `aantal` klaarstaande leads, oudste eerst zodat
 * een groeiende wachtrij niet permanent achteraan blijft staan. Gedeeld door
 * de handmatige verstuurknop en de dagelijkse cron, zodat beide dezelfde
 * verzendlogica en foutafhandeling gebruiken.
 */
export async function verstuurKlaarstaandeLeads(
  supabase: SupabaseClient,
  appUrl: string,
  aantal: number
): Promise<{ verzonden: number; mislukt: number; totaal: number }> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("status", "klaar")
    .order("created_at", { ascending: true })
    .limit(aantal);
  if (error) throw new Error(`Kon klaarstaande leads niet laden: ${error.message}`);
  const klaarstaand = (data ?? []).map(rowToLead);

  let verzonden = 0;
  let mislukt = 0;

  for (const lead of klaarstaand) {
    const unsubscribeUrl = `${appUrl}/uitschrijven/${lead.id}`;
    try {
      const resendEmailId = await verstuurOutreachEmail(lead, unsubscribeUrl);
      await updateLead(supabase, lead.id, {
        status: "verzonden",
        verzondenOp: new Date().toISOString(),
        resendEmailId,
      });
      verzonden++;
    } catch {
      mislukt++;
    }
  }

  return { verzonden, mislukt, totaal: klaarstaand.length };
}
