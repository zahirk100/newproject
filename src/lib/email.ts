import { Resend } from "resend";
import { Factuur, Instellingen, Offerte } from "./types";
import { berekenTotalen, formatEuro } from "./format";

function afzender() {
  return process.env.RESEND_FROM_EMAIL || "OfferteFlits <onboarding@resend.dev>";
}

export async function verstuurOfferteEmail(
  offerte: Offerte,
  instellingen: Instellingen,
  pdfBuffer: Buffer,
  portaalUrl: string
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY ontbreekt — e-mail versturen is niet geconfigureerd.");
  }
  if (!offerte.klantEmail?.trim()) {
    throw new Error("Geen e-mailadres bekend voor deze klant.");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { totaal } = berekenTotalen(offerte.regels, offerte.btwPercentage);

  const { error } = await resend.emails.send({
    from: afzender(),
    to: [offerte.klantEmail],
    replyTo: instellingen.email || undefined,
    subject: `Offerte ${offerte.offerteNummer} van ${instellingen.bedrijfsnaam}`,
    html: `
      <p>Beste ${offerte.klantnaam || "klant"},</p>
      <p>Bijgevoegd vindt u onze offerte <strong>${offerte.offerteNummer}</strong> voor:</p>
      <p style="white-space:pre-line">${offerte.klusOmschrijving}</p>
      <p>Totaalbedrag (incl. btw): <strong>${formatEuro(totaal)}</strong></p>
      <p style="margin:24px 0">
        <a href="${portaalUrl}" style="background:#111827;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">
          Bekijk en keur offerte goed
        </a>
      </p>
      <p>Heeft u vragen? Neem gerust contact op.</p>
      <p>Met vriendelijke groet,<br/>${instellingen.bedrijfsnaam}</p>
    `,
    attachments: [
      {
        filename: `Offerte-${offerte.offerteNummer}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(`Versturen van e-mail mislukt: ${error.message}`);
  }
}

export async function verstuurFactuurEmail(
  factuur: Factuur,
  instellingen: Instellingen,
  pdfBuffer: Buffer
) {
  if (!process.env.RESEND_API_KEY || !factuur.klantEmail?.trim()) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { totaal } = berekenTotalen(factuur.regels, factuur.btwPercentage);

  await resend.emails.send({
    from: afzender(),
    to: [factuur.klantEmail],
    replyTo: instellingen.email || undefined,
    subject: `Factuur ${factuur.factuurNummer} van ${instellingen.bedrijfsnaam}`,
    html: `
      <p>Beste ${factuur.klantnaam || "klant"},</p>
      <p>Bedankt voor de goedkeuring van onze offerte. Bijgevoegd vindt u de factuur
      <strong>${factuur.factuurNummer}</strong>.</p>
      <p>Te betalen: <strong>${formatEuro(totaal)}</strong>, vóór
      ${new Date(factuur.vervaldatum).toLocaleDateString("nl-NL")}${
        instellingen.iban ? ` op rekeningnummer ${instellingen.iban}` : ""
      }.</p>
      <p>Met vriendelijke groet,<br/>${instellingen.bedrijfsnaam}</p>
    `,
    attachments: [
      {
        filename: `Factuur-${factuur.factuurNummer}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}

export async function verstuurAanvraagBevestiging(
  klantEmail: string,
  klantnaam: string,
  instellingen: Instellingen
) {
  if (!process.env.RESEND_API_KEY || !klantEmail?.trim()) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: afzender(),
    to: [klantEmail],
    replyTo: instellingen.email || undefined,
    subject: `We hebben je aanvraag ontvangen — ${instellingen.bedrijfsnaam}`,
    html: `
      <p>Beste ${klantnaam || "klant"},</p>
      <p>Bedankt voor je aanvraag bij <strong>${instellingen.bedrijfsnaam}</strong>. We hebben 'm
      in goede orde ontvangen en nemen 'm zo snel mogelijk in behandeling. Je ontvangt hierna een
      offerte per e-mail.</p>
      <p>Met vriendelijke groet,<br/>${instellingen.bedrijfsnaam}</p>
    `,
  });
}

function formatteerDatumTijd(iso: string) {
  return new Date(iso).toLocaleString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function verstuurPlanningVoorstelEmail(
  offerte: Offerte,
  instellingen: Instellingen,
  portaalUrl: string
) {
  if (!process.env.RESEND_API_KEY || !offerte.klantEmail?.trim() || !offerte.planningDatum) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: afzender(),
    to: [offerte.klantEmail],
    replyTo: instellingen.email || undefined,
    subject: `Voorstel voor je afspraak — ${instellingen.bedrijfsnaam}`,
    html: `
      <p>Beste ${offerte.klantnaam || "klant"},</p>
      <p><strong>${instellingen.bedrijfsnaam}</strong> stelt voor om de klus in te plannen op:</p>
      <p style="font-size:16px"><strong>${formatteerDatumTijd(offerte.planningDatum)}</strong></p>
      ${offerte.planningNotitie ? `<p>${offerte.planningNotitie}</p>` : ""}
      <p style="margin:24px 0">
        <a href="${portaalUrl}" style="background:#111827;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">
          Bekijk voorstel
        </a>
      </p>
      <p>Komt dit niet uit? Op die pagina kun je ook een ander moment voorstellen.</p>
      <p>Met vriendelijke groet,<br/>${instellingen.bedrijfsnaam}</p>
    `,
  });
}

export async function verstuurPlanningBevestigdEmail(offerte: Offerte, instellingen: Instellingen) {
  if (!process.env.RESEND_API_KEY || !offerte.klantEmail?.trim() || !offerte.planningDatum) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: afzender(),
    to: [offerte.klantEmail],
    replyTo: instellingen.email || undefined,
    subject: `Afspraak bevestigd — ${instellingen.bedrijfsnaam}`,
    html: `
      <p>Beste ${offerte.klantnaam || "klant"},</p>
      <p>De afspraak is bevestigd op:</p>
      <p style="font-size:16px"><strong>${formatteerDatumTijd(offerte.planningDatum)}</strong></p>
      <p>Tot dan!</p>
      <p>Met vriendelijke groet,<br/>${instellingen.bedrijfsnaam}</p>
    `,
  });
}

export async function verstuurEigenaarNotificatie(
  instellingen: Instellingen,
  onderwerp: string,
  tekst: string
) {
  if (!process.env.RESEND_API_KEY || !instellingen.email?.trim()) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: afzender(),
    to: [instellingen.email],
    subject: onderwerp,
    html: `<p>${tekst}</p>`,
  });
}
