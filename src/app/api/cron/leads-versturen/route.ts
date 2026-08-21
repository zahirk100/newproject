import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verstuurKlaarstaandeLeads } from "@/lib/leads";
import { getLeadsPlanning, markeerVandaagVerzonden } from "@/lib/leadsPlanning";

export const maxDuration = 60;

/**
 * Wordt dagelijks aangeroepen door Vercel Cron (zie vercel.json). Draait
 * zonder ingelogde gebruiker, dus met de service-role client i.p.v. RLS.
 * Verstuurt hoogstens één keer per dag, ook als de cron per ongeluk vaker
 * zou vuren (laatst_verzonden_op voorkomt een dubbele batch).
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
  const resultaat = await verstuurKlaarstaandeLeads(supabase, appUrl, planning.dagelijkseLimiet);
  await markeerVandaagVerzonden(supabase, vandaag);

  return NextResponse.json(resultaat);
}
