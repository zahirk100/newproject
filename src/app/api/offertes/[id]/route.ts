import { NextRequest, NextResponse } from "next/server";
import { deleteOfferte, getOfferte, saveOfferte } from "@/lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const offerte = await getOfferte(id);
  if (!offerte) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
  return NextResponse.json(offerte);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bestaande = await getOfferte(id);
  if (!bestaande) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
  const body = await request.json();
  const bijgewerkt = {
    ...bestaande,
    ...body,
    id: bestaande.id,
    updatedAt: new Date().toISOString(),
  };
  await saveOfferte(bijgewerkt);
  return NextResponse.json(bijgewerkt);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteOfferte(id);
  return NextResponse.json({ ok: true });
}
