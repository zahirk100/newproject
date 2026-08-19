import { NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/apiAuth";
import { getInstellingen, getOfferte, listPrijslijst, updateOfferte } from "@/lib/db";
import { genereerOfferteRegels } from "@/lib/ai";
import { berekenVoorrijkostenRegel } from "@/lib/geocode";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const [offerte, instellingen, prijslijst] = await Promise.all([
    getOfferte(supabase, user.id, id),
    getInstellingen(supabase, user.id),
    listPrijslijst(supabase, user.id),
  ]);
  if (!offerte) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const regels = await genereerOfferteRegels(offerte.klusOmschrijving, instellingen, prijslijst);
  const voorrijkostenRegel = await berekenVoorrijkostenRegel(instellingen, offerte.klantadres);
  if (voorrijkostenRegel) regels.push(voorrijkostenRegel);

  const bijgewerkt = await updateOfferte(supabase, user.id, id, {
    regels,
    status: "concept",
  });
  return NextResponse.json(bijgewerkt);
}
