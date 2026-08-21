import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/apiAuth";
import { verstuurKlaarstaandeLeads } from "@/lib/leads";
import { SITE_URL } from "@/lib/config";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { supabase, user, admin } = await getAdminContext();
  if (!user || !admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const aantal = Math.min(Math.max(Number(body.aantal) || 25, 1), 50);

  const resultaat = await verstuurKlaarstaandeLeads(supabase, SITE_URL, aantal);
  return NextResponse.json(resultaat);
}
