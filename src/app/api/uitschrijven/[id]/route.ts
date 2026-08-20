import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { error } = await admin
    .from("leads")
    .update({ status: "afgemeld", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Afmelden mislukt" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
