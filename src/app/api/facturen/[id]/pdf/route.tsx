import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getAuthedContext } from "@/lib/apiAuth";
import { getInstellingen, listFacturen } from "@/lib/db";
import { FactuurPdf } from "@/lib/pdf/FactuurPdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const [facturen, instellingen] = await Promise.all([
    listFacturen(supabase, user.id),
    getInstellingen(supabase, user.id),
  ]);
  const factuur = facturen.find((f) => f.id === id);
  if (!factuur) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const pdfBuffer = await renderToBuffer(
    <FactuurPdf factuur={factuur} instellingen={instellingen} />
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Factuur-${factuur.factuurNummer}.pdf"`,
    },
  });
}
