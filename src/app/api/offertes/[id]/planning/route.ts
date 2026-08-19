import { NextRequest, NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/apiAuth";
import { getInstellingen, getOfferte, updateOfferte } from "@/lib/db";
import { verstuurPlanningVoorstelEmail } from "@/lib/email";

// Ondernemer doet een (nieuw) voorstel voor de afspraakdatum.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { datum, notitie } = body as { datum?: string; notitie?: string };

  if (!datum) {
    return NextResponse.json({ error: "Datum is verplicht" }, { status: 400 });
  }

  const offerte = await getOfferte(supabase, user.id, id);
  if (!offerte) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  if (offerte.status !== "geaccepteerd") {
    return NextResponse.json(
      { error: "Alleen geaccepteerde offertes kunnen ingepland worden" },
      { status: 400 }
    );
  }

  const bijgewerkt = await updateOfferte(supabase, user.id, id, {
    planningStatus: "voorgesteld",
    planningDatum: new Date(datum).toISOString(),
    planningNotitie: notitie?.trim() || "",
    planningVoorgesteldDoor: "ondernemer",
  });

  const instellingen = await getInstellingen(supabase, user.id);
  const portaalUrl = `${new URL(request.url).origin}/offerte/${id}`;
  await verstuurPlanningVoorstelEmail(bijgewerkt, instellingen, portaalUrl).catch(() => {});

  return NextResponse.json(bijgewerkt);
}
