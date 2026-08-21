import type { SupabaseClient } from "@supabase/supabase-js";
import { LeadsPlanning } from "./types";

function rowToPlanning(row: Record<string, unknown>): LeadsPlanning {
  return {
    actief: (row.actief as boolean) ?? false,
    dagelijkseLimiet: (row.dagelijkse_limiet as number) ?? 25,
    laatstVerzondenOp: (row.laatst_verzonden_op as string | null) ?? null,
    zoekIndex: (row.zoek_index as number) ?? 0,
  };
}

export async function getLeadsPlanning(supabase: SupabaseClient): Promise<LeadsPlanning> {
  const { data, error } = await supabase
    .from("leads_planning")
    .select("*")
    .eq("id", true)
    .maybeSingle();
  if (error) throw new Error(`Kon leads-planning niet laden: ${error.message}`);
  return (
    (data && rowToPlanning(data)) ?? {
      actief: false,
      dagelijkseLimiet: 25,
      laatstVerzondenOp: null,
      zoekIndex: 0,
    }
  );
}

export async function updateLeadsPlanning(
  supabase: SupabaseClient,
  patch: { actief?: boolean; dagelijkseLimiet?: number }
): Promise<LeadsPlanning> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.actief !== undefined) row.actief = patch.actief;
  if (patch.dagelijkseLimiet !== undefined) row.dagelijkse_limiet = patch.dagelijkseLimiet;

  const { data, error } = await supabase
    .from("leads_planning")
    .update(row)
    .eq("id", true)
    .select()
    .single();
  if (error || !data) throw new Error(`Bijwerken van leads-planning mislukt: ${error?.message}`);
  return rowToPlanning(data);
}

/**
 * Markeert dat de automatische dagelijkse run vandaag al is uitgevoerd en
 * slaat op tot waar in de zoekrotatie (leadZoekCombos.ZOEK_COMBOS) gevorderd
 * is, zodat de volgende run verder gaat waar deze gebleven is.
 */
export async function markeerVandaagVerwerkt(
  supabase: SupabaseClient,
  datum: string,
  nieuweZoekIndex: number
): Promise<void> {
  const { error } = await supabase
    .from("leads_planning")
    .update({
      laatst_verzonden_op: datum,
      zoek_index: nieuweZoekIndex,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);
  if (error) throw new Error(`Bijwerken van leads-planning mislukt: ${error.message}`);
}
