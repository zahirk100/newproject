import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { keurAlleNieuweLeadsGoed, verstuurKlaarstaandeLeads } from "@/lib/leads";
import { getLeadsPlanning, markeerVandaagVerwerkt } from "@/lib/leadsPlanning";
import { zoekEnMaakLeads } from "@/lib/leadScraper";
import { ZOEK_COMBOS } from "@/lib/leadZoekCombos";

// 60s is het maximum op het Vercel Hobby-plan.
export const maxDuration = 60;

// Aantal nieuwe vakgebied+plaats-combinaties dat per dag wordt afgezocht.
// Bewust laag gehouden zodat de instroom van nieuwe leads de dagelijkse
// verzendlimiet niet blijvend inhaalt (anders groeit de wachtrij onbeperkt).
const ZOEKEN_PER_DAG = 2;

/**
 * Wordt dagelijks aangeroepen door Vercel Cron (zie vercel.json) en draait
 * de volledige acquisitiepijplijn zonder menselijke tussenkomst: nieuwe
 * leads zoeken, automatisch goedkeuren met de standaardtekst, en de
 * eerstvolgende klaarstaande leads versturen. Draait zonder ingelogde
 * gebruiker, dus met de service-role client i.p.v. RLS.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Niet toegestaan" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const planning = await getLeadsPlanning(supabase);

  const vandaag = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Amsterdam" });
  if (!planning.actief || planning.laatstVerzondenOp === vandaag) {
    return NextResponse.json({ overgeslagen: true, actief: planning.actief });
  }

  const appUrl = new URL(request.url).origin;

  let nieuweLeadsGevonden = 0;
  for (let i = 0; i < ZOEKEN_PER_DAG; i++) {
    const combo = ZOEK_COMBOS[(planning.zoekIndex + i) % ZOEK_COMBOS.length];
    try {
      const resultaat = await zoekEnMaakLeads(supabase, combo.vakgebied, combo.plaats);
      nieuweLeadsGevonden += resultaat.nieuw;
    } catch {
      // Eén mislukte combinatie (bijv. Places API-hapering) mag de rest
      // van de dagelijkse run niet blokkeren.
    }
  }

  const { goedgekeurd } = await keurAlleNieuweLeadsGoed(supabase, appUrl);
  const verzendresultaat = await verstuurKlaarstaandeLeads(supabase, appUrl, planning.dagelijkseLimiet);

  const nieuweZoekIndex = (planning.zoekIndex + ZOEKEN_PER_DAG) % ZOEK_COMBOS.length;
  await markeerVandaagVerwerkt(supabase, vandaag, nieuweZoekIndex);

  return NextResponse.json({ nieuweLeadsGevonden, goedgekeurd, ...verzendresultaat });
}
