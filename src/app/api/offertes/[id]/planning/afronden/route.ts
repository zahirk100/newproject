import { NextRequest, NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/apiAuth";
import { getOfferte, updateOfferte } from "@/lib/db";

// Ondernemer markeert de klus als afgerond.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const offerte = await getOfferte(supabase, user.id, id);
  if (!offerte) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  if (offerte.planningStatus !== "bevestigd") {
    return NextResponse.json(
      { error: "Alleen een bevestigde afspraak kan afgerond worden" },
      { status: 400 }
    );
  }

  const bijgewerkt = await updateOfferte(supabase, user.id, id, {
    planningStatus: "afgerond",
  });
  return NextResponse.json(bijgewerkt);
}
