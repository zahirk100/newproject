import { NextRequest, NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/apiAuth";
import { createKlant, listKlanten } from "@/lib/db";

export async function GET() {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const klanten = await listKlanten(supabase, user.id);
  return NextResponse.json(klanten);
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json();
  if (!body.naam?.trim()) {
    return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });
  }

  const klant = await createKlant(supabase, user.id, {
    naam: body.naam.trim(),
    adres: body.adres ?? "",
    email: body.email ?? "",
    telefoon: body.telefoon ?? "",
  });
  return NextResponse.json(klant, { status: 201 });
}
