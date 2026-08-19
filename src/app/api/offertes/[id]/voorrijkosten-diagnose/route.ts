import { NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/apiAuth";
import { getInstellingen, getOfferte } from "@/lib/db";
import { diagnoseVoorrijkosten } from "@/lib/geocode";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const [offerte, instellingen] = await Promise.all([
    getOfferte(supabase, user.id, id),
    getInstellingen(supabase, user.id),
  ]);
  if (!offerte) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const reden = await diagnoseVoorrijkosten(instellingen, offerte.klantadres);
  return NextResponse.json({ reden });
}
