import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/apiAuth";
import { deleteLead, getLead, updateLead } from "@/lib/leads";
import { standaardOutreachTekst } from "@/lib/email";
import { LeadStatus } from "@/lib/types";
import { SITE_URL } from "@/lib/config";

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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user, admin } = await getAdminContext();
  if (!user || !admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  const lead = await getLead(supabase, id);
  if (!lead) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const { onderwerp, tekst } = standaardOutreachTekst(lead, SITE_URL);
  const bijgewerkt = await updateLead(supabase, id, {
    emailOnderwerp: onderwerp,
    emailTekst: tekst,
  });
  return NextResponse.json(bijgewerkt);
}
