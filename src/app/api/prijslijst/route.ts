import { NextRequest, NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/apiAuth";
import { createPrijslijstItem, listPrijslijst } from "@/lib/db";

export async function GET() {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const prijslijst = await listPrijslijst(supabase, user.id);
  return NextResponse.json(prijslijst);
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json();
  if (!body.naam?.trim()) {
    return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });
  }

  const item = await createPrijslijstItem(supabase, user.id, {
    naam: body.naam.trim(),
    type: body.type === "arbeid" ? "arbeid" : "materiaal",
    eenheid: body.eenheid || "stuk",
    prijs: Number(body.prijs) || 0,
  });
  return NextResponse.json(item, { status: 201 });
}
