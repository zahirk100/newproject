import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/apiAuth";
import { getLeadsPlanning, updateLeadsPlanning } from "@/lib/leadsPlanning";

export async function GET() {
  const { supabase, user, admin } = await getAdminContext();
  if (!user || !admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const planning = await getLeadsPlanning(supabase);
  return NextResponse.json(planning);
}

export async function PUT(request: NextRequest) {
  const { supabase, user, admin } = await getAdminContext();
  if (!user || !admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const body = await request.json();
  const { actief, dagelijkseLimiet } = body as { actief?: boolean; dagelijkseLimiet?: number };

  const patch: { actief?: boolean; dagelijkseLimiet?: number } = {};
  if (actief !== undefined) patch.actief = actief;
  if (dagelijkseLimiet !== undefined) {
    patch.dagelijkseLimiet = Math.min(Math.max(Number(dagelijkseLimiet) || 25, 1), 50);
  }

  const planning = await updateLeadsPlanning(supabase, patch);
  return NextResponse.json(planning);
}
