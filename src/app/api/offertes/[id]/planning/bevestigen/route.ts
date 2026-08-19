import { NextRequest, NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/apiAuth";
import { getInstellingen, getOfferte, updateOfferte } from "@/lib/db";
import { verstuurPlanningBevestigdEmail } from "@/lib/email";

// Ondernemer accepteert het tegenvoorstel van de klant.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const offerte = await getOfferte(supabase, user.id, id);
  if (!offerte) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  if (offerte.planningStatus !== "tegenvoorstel") {
    return NextResponse.json(
      { error: "Er is geen openstaand tegenvoorstel om te accepteren" },
      { status: 400 }
    );
  }

  const bijgewerkt = await updateOfferte(supabase, user.id, id, {
    planningStatus: "bevestigd",
  });

  const instellingen = await getInstellingen(supabase, user.id);
  await verstuurPlanningBevestigdEmail(bijgewerkt, instellingen).catch(() => {});

  return NextResponse.json(bijgewerkt);
}
