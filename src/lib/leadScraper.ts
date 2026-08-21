import type { SupabaseClient } from "@supabase/supabase-js";
import { bestaatLeadAl, createLead } from "./leads";
import { Lead } from "./types";

interface PlaceResultaat {
  placeId: string;
  bedrijfsnaam: string;
  adres: string;
  website: string | null;
  telefoon: string | null;
}

/**
 * Zoekt bedrijven via de officiële Google Places API (Text Search) — geen
 * scraping van Google Maps zelf, dat is in strijd met Google's
 * gebruiksvoorwaarden. Vereist een GOOGLE_PLACES_API_KEY met de Places API
 * (New) ingeschakeld in Google Cloud Console.
 */
export async function zoekBedrijven(
  vakgebied: string,
  plaats: string
): Promise<PlaceResultaat[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY ontbreekt — zoeken naar leads is niet geconfigureerd.");
  }

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber",
    },
    body: JSON.stringify({
      textQuery: `${vakgebied} in ${plaats}`,
      languageCode: "nl",
      regionCode: "NL",
    }),
  });

  if (!response.ok) {
    const tekst = await response.text().catch(() => "");
    throw new Error(`Places API-fout (${response.status}): ${tekst.slice(0, 200)}`);
  }

  const data = await response.json();
  const places = (data.places ?? []) as Array<{
    id: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    websiteUri?: string;
    nationalPhoneNumber?: string;
  }>;

  return places.slice(0, 10).map((p) => ({
    placeId: p.id,
    bedrijfsnaam: p.displayName?.text ?? "",
    adres: p.formattedAddress ?? "",
    website: p.websiteUri ?? null,
    telefoon: p.nationalPhoneNumber ?? null,
  }));
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const AFBEELDING_EXTENSIES = /\.(png|jpe?g|gif|svg|webp)$/i;
const UITGESLOTEN_DOMEINEN = [
  "sentry.io",
  "wixpress.com",
  "example.com",
  "godaddy.com",
  "yourdomain.com",
  "domain.com",
  "schema.org",
  "w3.org",
];

/**
 * Best-effort: haalt de homepage (en anders /contact) van een bedrijfswebsite
 * op en zoekt naar een e-mailadres. Faalt stil (null) bij netwerkfouten,
 * timeouts of als er niets bruikbaars gevonden wordt — dit is een hulpmiddel,
 * geen kritieke stap.
 */
export async function vindEmailOpWebsite(website: string): Promise<string | null> {
  for (const pad of ["", "/contact"]) {
    const email = await haalEmailVanPagina(website.replace(/\/$/, "") + pad);
    if (email) return email;
  }
  return null;
}

async function haalEmailVanPagina(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; OfferteFlitsBot/1.0)" },
    });
    clearTimeout(timeout);
    if (!response.ok) return null;

    const html = await response.text();
    const matches = html.match(EMAIL_REGEX) ?? [];
    const geldig = matches.find((email) => {
      const domein = email.split("@")[1]?.toLowerCase();
      return (
        domein &&
        !UITGESLOTEN_DOMEINEN.some((d) => domein.includes(d)) &&
        !AFBEELDING_EXTENSIES.test(email)
      );
    });
    return geldig?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

/**
 * Zoekt bedrijven voor één vakgebied+plaats-combinatie en slaat de nieuwe
 * (nog niet bekende) resultaten op als lead. Gedeeld door de handmatige
 * zoekknop en de dagelijkse acquisitie-cron.
 */
export async function zoekEnMaakLeads(
  supabase: SupabaseClient,
  vakgebied: string,
  plaats: string
): Promise<{ gevonden: number; nieuw: number; overgeslagen: number; leads: Lead[] }> {
  const gevonden = await zoekBedrijven(vakgebied, plaats);

  const resultaten = await Promise.all(
    gevonden
      .filter((plek) => plek.bedrijfsnaam.trim())
      .map(async (plek): Promise<Lead | null> => {
        if (await bestaatLeadAl(supabase, plek.website, plek.bedrijfsnaam, plaats)) {
          return null;
        }

        const email = plek.website ? await vindEmailOpWebsite(plek.website) : null;

        return createLead(supabase, {
          bedrijfsnaam: plek.bedrijfsnaam,
          vakgebied,
          plaats,
          adres: plek.adres,
          website: plek.website,
          email,
          telefoon: plek.telefoon,
          bron: "google_places",
          status: email ? "nieuw" : "geen_email",
        });
      })
  );

  const nieuweLeads = resultaten.filter((lead): lead is Lead => lead !== null);

  return {
    gevonden: gevonden.length,
    nieuw: nieuweLeads.length,
    overgeslagen: gevonden.length - nieuweLeads.length,
    leads: nieuweLeads,
  };
}
