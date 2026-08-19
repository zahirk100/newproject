import { NextRequest, NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/apiAuth";
import { getInstellingen, saveInstellingen } from "@/lib/db";

export async function GET() {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const instellingen = await getInstellingen(supabase, user.id);
  return NextResponse.json(instellingen);
}

export async function PUT(request: NextRequest) {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json();
  try {
    const instellingen = await saveInstellingen(supabase, user.id, body);
    return NextResponse.json(instellingen);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Opslaan mislukt" },
      { status: 500 }
    );
  }
}
