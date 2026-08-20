import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/apiAuth";
import { listLeads, updateLead } from "@/lib/leads";
import { verstuurOutreachEmail } from "@/lib/email";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { supabase, user, admin } = await getAdminContext();
  if (!user || !admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const aantal = Math.min(Math.max(Number(body.aantal) || 25, 1), 50);

  const klaarstaand = (await listLeads(supabase, "klaar")).slice(0, aantal);
  const appUrl = new URL(request.url).origin;

  let verzonden = 0;
  let mislukt = 0;

  for (const lead of klaarstaand) {
    const unsubscribeUrl = `${appUrl}/uitschrijven/${lead.id}`;
    try {
      await verstuurOutreachEmail(lead, unsubscribeUrl);
      await updateLead(supabase, lead.id, {
        status: "verzonden",
        verzondenOp: new Date().toISOString(),
      });
      verzonden++;
    } catch {
      mislukt++;
    }
  }

  return NextResponse.json({ verzonden, mislukt, totaal: klaarstaand.length });
}
