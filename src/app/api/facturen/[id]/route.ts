import { NextRequest, NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/apiAuth";
import { updateFactuurStatus } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  if (body.status !== "open" && body.status !== "betaald") {
    return NextResponse.json({ error: "Ongeldige status" }, { status: 400 });
  }

  const factuur = await updateFactuurStatus(supabase, user.id, id, body.status);
  return NextResponse.json(factuur);
}
