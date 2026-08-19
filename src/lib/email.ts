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
