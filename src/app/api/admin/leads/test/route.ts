import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/apiAuth";
import { standaardOutreachTekst, verstuurOutreachEmail } from "@/lib/email";
import { Lead } from "@/lib/types";
import { SITE_URL } from "@/lib/config";

export const maxDuration = 30;

/**
 * Verstuurt de huidige standaard-outreachtekst naar een zelf opgegeven
 * adres, zonder dat er een lead-record voor aangemaakt wordt — puur om te
 * zien hoe de mail bij een ontvanger aankomt.
 */
export async function POST(request: NextRequest) {
  const { user, admin } = await getAdminContext();
  if (!user || !admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const body = await request.json();
  const { email } = body as { email?: string };
  if (!email?.trim()) {
    return NextResponse.json({ error: "Vul een e-mailadres in" }, { status: 400 });
  }

  const nu = new Date().toISOString();
  const testLead: Lead = {
    id: "test",
    bedrijfsnaam: "Jouw Bedrijf",
    vakgebied: "vakbedrijf",
    plaats: "jouw regio",
    adres: "",
    website: null,
    email: email.trim(),
    telefoon: null,
    bron: "test",
    status: "klaar",
    emailOnderwerp: "",
    emailTekst: "",
    verzondenOp: null,
    resendEmailId: null,
    geopendOp: null,
    geklikOp: null,
    createdAt: nu,
    updatedAt: nu,
  };
  const { onderwerp, tekst } = standaardOutreachTekst(testLead, SITE_URL);
  testLead.emailOnderwerp = `[TEST] ${onderwerp}`;
  testLead.emailTekst = tekst;

  try {
    await verstuurOutreachEmail(testLead, `${SITE_URL}/uitschrijven/test`);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Versturen mislukt" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
