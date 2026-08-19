import { NextRequest, NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/apiAuth";
import { deleteKlant, updateKlant } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const klant = await updateKlant(supabase, user.id, id, body);
  return NextResponse.json(klant);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  await deleteKlant(supabase, user.id, id);
  return NextResponse.json({ ok: true });
}
