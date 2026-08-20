import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { haalOfferteVoorPortaal, verwerkPlanningReactie } from "@/lib/portal";
import { verstuurEigenaarNotificatie } from "@/lib/email";

function formatteerDatumTijd(iso: string) {
  return new Date(iso).toLocaleString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { actie, datum, notitie } = body as {
    actie?: "akkoord" | "tegenvoorstel";
    datum?: string;
    notitie?: string;
  };

  if (actie !== "akkoord" && actie !== "tegenvoorstel") {
    return NextResponse.json({ error: "Ongeldige actie" }, { status: 400 });
  }
  if (actie === "tegenvoorstel" && !datum) {
    return NextResponse.json({ error: "Kies een datum" }, { status: 400 });
  }

  const admin = createAdminClient();
  const gegevens = await haalOfferteVoorPortaal(admin, id);
  if (!gegevens) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const bijgewerkt = await verwerkPlanningReactie(admin, id, actie, datum, notitie);
  if (!bijgewerkt) {
    return NextResponse.json(
      { error: "Er is momenteel geen openstaand voorstel om op te reageren." },
      { status: 409 }
    );
  }

  const { instellingen } = gegevens;
  const onderwerp =
    actie === "akkoord"
      ? `Klant is akkoord met de afspraak (${bijgewerkt.offerteNummer})`
      : `Klant stelt een andere datum voor (${bijgewerkt.offerteNummer})`;
  const datumTekst = bijgewerkt.planningDatum ? formatteerDatumTijd(bijgewerkt.planningDatum) : "";
  const tekst =
    actie === "akkoord"
      ? `${bijgewerkt.klantnaam || "De klant"} is akkoord met de afspraak op ${datumTekst} (${bijgewerkt.klantadres || "adres onbekend"}) voor "${bijgewerkt.klusOmschrijving}".`
      : `${bijgewerkt.klantnaam || "De klant"} stelt ${datumTekst} voor als nieuwe datum voor "${bijgewerkt.klusOmschrijving}" (${bijgewerkt.klantadres || "adres onbekend"}). Bekijk en reageer in je planning.`;
  await verstuurEigenaarNotificatie(instellingen, onderwerp, tekst).catch(() => {});

  return NextResponse.json(bijgewerkt);
}
