import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/apiAuth";
import { bestaatLeadAl, createLead } from "@/lib/leads";
import { vindEmailOpWebsite, zoekBedrijven } from "@/lib/leadScraper";
import { Lead } from "@/lib/types";

// Elke lead doet een eigen (getimede) fetch naar zijn website — parallel
// uitvoeren houdt de totale wachttijd bij de langzaamste lookup in plaats
// van de som van alle lookups, maar we geven de functie toch ruim de tijd.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { supabase, user, admin } = await getAdminContext();
  if (!user || !admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const body = await request.json();
  const { vakgebied, plaats } = body as { vakgebied?: string; plaats?: string };
  if (!vakgebied?.trim() || !plaats?.trim()) {
    return NextResponse.json({ error: "Vul vakgebied en plaats in" }, { status: 400 });
  }

  let gevonden;
  try {
    gevonden = await zoekBedrijven(vakgebied.trim(), plaats.trim());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Zoeken mislukt" },
      { status: 502 }
    );
  }

  const resultaten = await Promise.all(
    gevonden
      .filter((plek) => plek.bedrijfsnaam.trim())
      .map(async (plek): Promise<Lead | null> => {
        if (await bestaatLeadAl(supabase, plek.website, plek.bedrijfsnaam, plaats.trim())) {
          return null;
        }

        const email = plek.website ? await vindEmailOpWebsite(plek.website) : null;

        return createLead(supabase, {
          bedrijfsnaam: plek.bedrijfsnaam,
          vakgebied: vakgebied.trim(),
          plaats: plaats.trim(),
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

  return NextResponse.json({
    gevonden: gevonden.length,
    nieuw: nieuweLeads.length,
    overgeslagen: gevonden.length - nieuweLeads.length,
    leads: nieuweLeads,
  });
}
