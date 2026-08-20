import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/apiAuth";
import { deleteLead, getLead, updateLead } from "@/lib/leads";
import { standaardOutreachTekst } from "@/lib/email";
import { LeadStatus } from "@/lib/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user, admin } = await getAdminContext();
  if (!user || !admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { emailOnderwerp, emailTekst, status } = body as {
    emailOnderwerp?: string;
    emailTekst?: string;
    status?: LeadStatus;
  };

  const bijgewerkt = await updateLead(supabase, id, { emailOnderwerp, emailTekst, status });
  return NextResponse.json(bijgewerkt);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user, admin } = await getAdminContext();
  if (!user || !admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  await deleteLead(supabase, id);
  return NextResponse.json({ ok: true });
}

/** Genereert (of hergenereert) de standaard concepttekst voor deze lead. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user, admin } = await getAdminContext();
  if (!user || !admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  const lead = await getLead(supabase, id);
  if (!lead) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const appUrl = new URL(request.url).origin;
  const { onderwerp, tekst } = standaardOutreachTekst(lead, appUrl);
  const bijgewerkt = await updateLead(supabase, id, {
    emailOnderwerp: onderwerp,
    emailTekst: tekst,
  });
  return NextResponse.json(bijgewerkt);
}
