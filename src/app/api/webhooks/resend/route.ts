import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLeadByResendId, updateLead } from "@/lib/leads";
import { verifieerWebhookSignature } from "@/lib/webhookVerificatie";

export const maxDuration = 30;

interface ResendEvent {
  type: string;
  data: { email_id?: string };
}

/**
 * Ontvangt open/klik/bounce/klacht-events van Resend voor de outreach-mails
 * en koppelt ze terug aan de bijbehorende lead (via resend_email_id, gezet
 * bij het versturen). Publiek bereikbaar (Resend heeft geen sessie), maar
 * geverifieerd via de webhook-signature, dus veilig.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook niet geconfigureerd" }, { status: 500 });
  }

  const payload = await request.text();
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!id || !timestamp || !signature) {
    return NextResponse.json({ error: "Ontbrekende headers" }, { status: 400 });
  }
  if (!verifieerWebhookSignature(payload, { id, timestamp, signature }, secret)) {
    return NextResponse.json({ error: "Ongeldige signature" }, { status: 401 });
  }

  const event = JSON.parse(payload) as ResendEvent;
  const emailId = event.data.email_id;
  if (!emailId) return NextResponse.json({ ok: true });

  const supabase = createAdminClient();
  const lead = await getLeadByResendId(supabase, emailId);
  if (!lead) return NextResponse.json({ ok: true });

  const nu = new Date().toISOString();
  switch (event.type) {
    case "email.opened":
      if (!lead.geopendOp) await updateLead(supabase, lead.id, { geopendOp: nu });
      break;
    case "email.clicked":
      if (!lead.geklikOp) await updateLead(supabase, lead.id, { geklikOp: nu });
      break;
    case "email.bounced":
      await updateLead(supabase, lead.id, { status: "bounced" });
      break;
    case "email.complained":
      // Spamklacht: nooit meer mailen, zelfde effect als een afmelding.
      await updateLead(supabase, lead.id, { status: "afgemeld" });
      break;
  }

  return NextResponse.json({ ok: true });
}
