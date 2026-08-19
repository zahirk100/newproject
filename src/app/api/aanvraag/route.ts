import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createKlant, createOfferte, getInstellingen, nextOfferteNummer } from "@/lib/db";
import { verstuurAanvraagBevestiging, verstuurEigenaarNotificatie } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { profileId, naam, adres, email, telefoon, klusOmschrijving, antwoorden, fotoUrls } =
    body as {
      profileId?: string;
      naam?: string;
      adres?: string;
      email?: string;
      telefoon?: string;
      klusOmschrijving?: string;
      antwoorden?: { vraag: string; antwoord: string }[];
      fotoUrls?: string[];
    };

  if (!profileId || !naam?.trim() || !email?.trim() || !klusOmschrijving?.trim()) {
    return NextResponse.json({ error: "Vul alle verplichte velden in" }, { status: 400 });
  }

  const aanvullendeAntwoorden = (antwoorden ?? []).filter((a) => a.antwoord?.trim());
  const volledigeOmschrijving = aanvullendeAntwoorden.length
    ? `${klusOmschrijving.trim()}\n\n${aanvullendeAntwoorden
        .map((a) => `${a.vraag}\n${a.antwoord.trim()}`)
        .join("\n\n")}`
    : klusOmschrijving.trim();

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
    klusOmschrijving: volledigeOmschrijving,
    fotoUrls: (fotoUrls ?? []).slice(0, 6),
    regels: [],
    btwPercentage: instellingen.standaardBtwPercentage,
    status: "aanvraag",
  });

  const extraTekst = [
    aanvullendeAntwoorden.length ? `${aanvullendeAntwoorden.length} vraag/antwoord` : null,
    fotoUrls?.length ? `${fotoUrls.length} foto('s)` : null,
  ]
    .filter(Boolean)
    .join(" en ");

  await Promise.all([
    verstuurEigenaarNotificatie(
      instellingen,
      `Nieuwe offerte-aanvraag van ${naam.trim()}`,
      `${naam.trim()} heeft een offerte aangevraagd: "${klusOmschrijving.trim()}".${
        extraTekst ? ` (met ${extraTekst})` : ""
      } Bekijk 'm in je dashboard onder Aanvragen.`
    ).catch(() => {}),
    verstuurAanvraagBevestiging(email.trim(), naam.trim(), instellingen).catch(() => {}),
  ]);

  return NextResponse.json({ id: offerte.id }, { status: 201 });
}
