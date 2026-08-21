import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/apiAuth";
import { zoekEnMaakLeads } from "@/lib/leadScraper";

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

  try {
    const resultaat = await zoekEnMaakLeads(supabase, vakgebied.trim(), plaats.trim());
    return NextResponse.json(resultaat);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Zoeken mislukt" },
      { status: 502 }
    );
  }
}
