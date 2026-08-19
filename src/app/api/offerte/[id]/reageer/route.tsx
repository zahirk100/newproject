import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createAdminClient } from "@/lib/supabase/admin";
import { haalOfferteVoorPortaal, verwerkKlantReactie } from "@/lib/portal";
import { createFactuur, nextFactuurNummer } from "@/lib/db";
import { verstuurEigenaarNotificatie, verstuurFactuurEmail } from "@/lib/email";
import { FactuurPdf } from "@/lib/pdf/FactuurPdf";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const actie = body.actie as "geaccepteerd" | "afgewezen";

  if (actie !== "geaccepteerd" && actie !== "afgewezen") {
    return NextResponse.json({ error: "Ongeldige actie" }, { status: 400 });
  }

  const admin = createAdminClient();
  const gegevens = await haalOfferteVoorPortaal(admin, id);
  if (!gegevens) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const bijgewerkteOfferte = await verwerkKlantReactie(admin, id, actie);
  if (!bijgewerkteOfferte) {
    return NextResponse.json(
      { error: "Deze offerte is al eerder beantwoord." },
      { status: 409 }
    );
  }

  const { instellingen, profileId } = gegevens;

  await verstuurEigenaarNotificatie(
    instellingen,
    `Offerte ${bijgewerkteOfferte.offerteNummer} is ${actie}`,
    `${bijgewerkteOfferte.klantnaam || "De klant"} heeft offerte ${bijgewerkteOfferte.offerteNummer} zojuist <strong>${actie}</strong>.`
  ).catch(() => {});

  if (actie === "geaccepteerd") {
    try {
      const factuurNummer = await nextFactuurNummer(admin, profileId);
      const factuur = await createFactuur(admin, profileId, {
        offerteId: bijgewerkteOfferte.id,
        factuurNummer,
        klantnaam: bijgewerkteOfferte.klantnaam,
        klantadres: bijgewerkteOfferte.klantadres,
        klantEmail: bijgewerkteOfferte.klantEmail,
        regels: bijgewerkteOfferte.regels,
        btwPercentage: bijgewerkteOfferte.btwPercentage,
      });
      const pdfBuffer = await renderToBuffer(
        <FactuurPdf factuur={factuur} instellingen={instellingen} />
      );
      await verstuurFactuurEmail(factuur, instellingen, pdfBuffer);
    } catch (error) {
      // De offerte is al geaccepteerd; een mislukte factuur mag de
      // klantbevestiging niet blokkeren. De ondernemer ziet de offerte
      // sowieso terug in het dashboard en kan het handmatig oppakken.
      console.error("Factuur genereren/versturen mislukt:", error);
    }
  }

  return NextResponse.json(bijgewerkteOfferte);
}
