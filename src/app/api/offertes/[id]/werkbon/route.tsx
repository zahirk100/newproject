import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getAuthedContext } from "@/lib/apiAuth";
import { getInstellingen, getOfferte } from "@/lib/db";
import { WerkbonPdf } from "@/lib/pdf/WerkbonPdf";

export async function GET(
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

  const pdfBuffer = await renderToBuffer(
    <WerkbonPdf offerte={offerte} instellingen={instellingen} />
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Werkbon-${offerte.offerteNummer}.pdf"`,
    },
  });
}
