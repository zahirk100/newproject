import { NextRequest, NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/apiAuth";
import { createOfferte, getInstellingen, listOffertes, nextOfferteNummer } from "@/lib/db";
import { genereerOfferteRegels } from "@/lib/ai";

export async function GET() {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const offertes = await listOffertes(supabase, user.id);
  return NextResponse.json(offertes);
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json();
  const { klantId, klantnaam, klantadres, klantEmail, klusOmschrijving } = body as {
    klantId?: string | null;
    klantnaam: string;
    klantadres: string;
    klantEmail?: string;
    klusOmschrijving: string;
  };

  if (!klusOmschrijving?.trim()) {
    return NextResponse.json({ error: "klusOmschrijving is verplicht" }, { status: 400 });
  }

  const instellingen = await getInstellingen(supabase, user.id);
  const regels = await genereerOfferteRegels(klusOmschrijving, instellingen);
  const offerteNummer = await nextOfferteNummer(supabase, user.id);

  const offerte = await createOfferte(supabase, user.id, {
    offerteNummer,
    klantId: klantId ?? null,
    klantnaam: klantnaam?.trim() || "",
    klantadres: klantadres?.trim() || "",
    klantEmail: klantEmail?.trim() || "",
    klusOmschrijving,
    regels,
    btwPercentage: instellingen.standaardBtwPercentage,
  });

  return NextResponse.json(offerte, { status: 201 });
}
