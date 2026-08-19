import { Resend } from "resend";
import { Instellingen, Offerte } from "./types";
import { berekenTotalen, formatEuro } from "./format";

export async function verstuurOfferteEmail(
  offerte: Offerte,
  instellingen: Instellingen,
  pdfBuffer: Buffer
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY ontbreekt — e-mail versturen is niet geconfigureerd.");
  }
  if (!offerte.klantEmail?.trim()) {
    throw new Error("Geen e-mailadres bekend voor deze klant.");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { totaal } = berekenTotalen(offerte.regels, offerte.btwPercentage);
  const afzender = process.env.RESEND_FROM_EMAIL || "OfferteFlits <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from: afzender,
    to: [offerte.klantEmail],
    replyTo: instellingen.email || undefined,
    subject: `Offerte ${offerte.offerteNummer} van ${instellingen.bedrijfsnaam}`,
    html: `
      <p>Beste ${offerte.klantnaam || "klant"},</p>
      <p>Bijgevoegd vindt u onze offerte <strong>${offerte.offerteNummer}</strong> voor:</p>
      <p style="white-space:pre-line">${offerte.klusOmschrijving}</p>
      <p>Totaalbedrag (incl. btw): <strong>${formatEuro(totaal)}</strong></p>
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
