import { NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/apiAuth";
import { listFacturen } from "@/lib/db";

export async function GET() {
  const { supabase, user } = await getAuthedContext();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const facturen = await listFacturen(supabase, user.id);
  return NextResponse.json(facturen);
}
