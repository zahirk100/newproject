import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getAuthedContext } from "@/lib/apiAuth";
import { getInstellingen, getOfferte, updateOfferte } from "@/lib/db";
import { verstuurOfferteEmail } from "@/lib/email";
import { OffertePdf } from "@/lib/pdf/OffertePdf";
import { SITE_URL } from "@/lib/config";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const [offerte, instellingen] = await Promise.all([
    getOfferte(supabase, user.id, id),
    getInstellingen(supabase, user.id),
  ]);
  if (!offerte) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  try {
    const pdfBuffer = await renderToBuffer(
      <OffertePdf offerte={offerte} instellingen={instellingen} />
    );
    const portaalUrl = `${SITE_URL}/offerte/${offerte.id}`;
    await verstuurOfferteEmail(offerte, instellingen, pdfBuffer, portaalUrl);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Versturen mislukt" },
      { status: 500 }
    );
  }

  const bijgewerkt = await updateOfferte(supabase, user.id, id, { status: "verzonden" });
  return NextResponse.json(bijgewerkt);
}
