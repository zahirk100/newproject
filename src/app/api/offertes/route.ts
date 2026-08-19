import { NextRequest, NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/apiAuth";
import {
  createKlant,
  createOfferte,
  getInstellingen,
  listOffertes,
  listPrijslijst,
  nextOfferteNummer,
} from "@/lib/db";
import { genereerOfferteRegels } from "@/lib/ai";
import { berekenVoorrijkostenRegel } from "@/lib/geocode";

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
  const prijslijst = await listPrijslijst(supabase, user.id);
  const regels = await genereerOfferteRegels(klusOmschrijving, instellingen, prijslijst);
  const voorrijkostenRegel = await berekenVoorrijkostenRegel(instellingen, klantadres ?? "");
  if (voorrijkostenRegel) regels.push(voorrijkostenRegel);
  const offerteNummer = await nextOfferteNummer(supabase, user.id);

  // Bij een nieuwe (nog niet bestaande) klant meteen een klantenrecord
  // aanmaken, zodat de klant ook terugkomt in het klantenoverzicht.
  let uiteindelijkeKlantId = klantId ?? null;
  if (!uiteindelijkeKlantId && klantnaam?.trim()) {
    const nieuweKlant = await createKlant(supabase, user.id, {
      naam: klantnaam.trim(),
      adres: klantadres?.trim() || "",
      email: klantEmail?.trim() || "",
      telefoon: "",
    });
    uiteindelijkeKlantId = nieuweKlant.id;
  }

  const offerte = await createOfferte(supabase, user.id, {
    offerteNummer,
    klantId: uiteindelijkeKlantId,
    klantnaam: klantnaam?.trim() || "",
    klantadres: klantadres?.trim() || "",
    klantEmail: klantEmail?.trim() || "",
    klusOmschrijving,
    regels,
    btwPercentage: instellingen.standaardBtwPercentage,
  });

  return NextResponse.json(offerte, { status: 201 });
}
