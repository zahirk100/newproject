import { NextRequest, NextResponse } from "next/server";
import { getInstellingen, listOffertes, nextOfferteNummer, saveOfferte } from "@/lib/store";
import { genereerOfferteRegels } from "@/lib/ai";
import { Offerte } from "@/lib/types";

export async function GET() {
  const offertes = await listOffertes();
  return NextResponse.json(offertes);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { klantnaam, klantadres, klusOmschrijving } = body as {
    klantnaam: string;
    klantadres: string;
    klusOmschrijving: string;
  };

  if (!klusOmschrijving?.trim()) {
    return NextResponse.json(
      { error: "klusOmschrijving is verplicht" },
      { status: 400 }
    );
  }

  const instellingen = await getInstellingen();
  const regels = await genereerOfferteRegels(klusOmschrijving, instellingen);
  const now = new Date().toISOString();

  const offerte: Offerte = {
    id: crypto.randomUUID(),
    offerteNummer: await nextOfferteNummer(),
    klantnaam: klantnaam?.trim() || "",
    klantadres: klantadres?.trim() || "",
    klusOmschrijving,
    regels,
    btwPercentage: instellingen.standaardBtwPercentage,
    status: "concept",
    opmerkingen: "",
    createdAt: now,
    updatedAt: now,
  };

  await saveOfferte(offerte);
  return NextResponse.json(offerte, { status: 201 });
}
