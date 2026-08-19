import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createKlant, createOfferte, getInstellingen, nextOfferteNummer } from "@/lib/db";
import { verstuurEigenaarNotificatie } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { profileId, naam, adres, email, telefoon, klusOmschrijving } = body as {
    profileId?: string;
    naam?: string;
    adres?: string;
    email?: string;
    telefoon?: string;
    klusOmschrijving?: string;
  };

  if (!profileId || !naam?.trim() || !email?.trim() || !klusOmschrijving?.trim()) {
    return NextResponse.json({ error: "Vul alle verplichte velden in" }, { status: 400 });
  }

  const admin = createAdminClient();

  let instellingen;
  try {
    instellingen = await getInstellingen(admin, profileId);
  } catch {
    return NextResponse.json({ error: "Onbekend bedrijf" }, { status: 404 });
  }

  const klant = await createKlant(admin, profileId, {
    naam: naam.trim(),
    adres: adres?.trim() || "",
    email: email.trim(),
    telefoon: telefoon?.trim() || "",
  });

  const offerteNummer = await nextOfferteNummer(admin, profileId);
  const offerte = await createOfferte(admin, profileId, {
    offerteNummer,
    klantId: klant.id,
    klantnaam: naam.trim(),
    klantadres: adres?.trim() || "",
    klantEmail: email.trim(),
    klusOmschrijving: klusOmschrijving.trim(),
    regels: [],
    btwPercentage: instellingen.standaardBtwPercentage,
    status: "aanvraag",
  });

  await verstuurEigenaarNotificatie(
    instellingen,
    `Nieuwe offerte-aanvraag van ${naam.trim()}`,
    `${naam.trim()} heeft een offerte aangevraagd: "${klusOmschrijving.trim()}". Bekijk 'm in je dashboard onder Aanvragen.`
  ).catch(() => {});

  return NextResponse.json({ id: offerte.id }, { status: 201 });
}
