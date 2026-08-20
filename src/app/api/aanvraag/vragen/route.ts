import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getInstellingen } from "@/lib/db";
import { bepaalOntbrekendeVragen } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { profileId, klusOmschrijving } = body as {
    profileId?: string;
    klusOmschrijving?: string;
  };

  if (!profileId || !klusOmschrijving?.trim()) {
    return NextResponse.json({ error: "Vul eerst de klusomschrijving in" }, { status: 400 });
  }

  const admin = createAdminClient();
  let instellingen;
  try {
    instellingen = await getInstellingen(admin, profileId);
  } catch {
    return NextResponse.json({ error: "Onbekend bedrijf" }, { status: 404 });
  }

  const { vragen, fout } = await bepaalOntbrekendeVragen(
    klusOmschrijving.trim(),
    instellingen.standaardVragen
  );
  return NextResponse.json({ vragen, fout });
}
