import { Resend } from "resend";
import { Factuur, Instellingen, Lead, Offerte } from "./types";
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
    subject: `We hebben je aanvraag ontvangen bij ${instellingen.bedrijfsnaam}`,
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
    subject: `Voorstel voor je afspraak bij ${instellingen.bedrijfsnaam}`,
    html: `
      <p>Beste ${offerte.klantnaam || "klant"},</p>
      <p><strong>${instellingen.bedrijfsnaam}</strong> stelt voor om de klus in te plannen op:</p>
      <p style="font-size:16px"><strong>${formatteerDatumTijd(offerte.planningDatum)}</strong></p>
      <p><strong>Werkzaamheden:</strong> ${offerte.klusOmschrijving}</p>
      ${offerte.klantadres ? `<p><strong>Adres:</strong> ${offerte.klantadres}</p>` : ""}
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
    subject: `Afspraak bevestigd bij ${instellingen.bedrijfsnaam}`,
    html: `
      <p>Beste ${offerte.klantnaam || "klant"},</p>
      <p>De afspraak is bevestigd op:</p>
      <p style="font-size:16px"><strong>${formatteerDatumTijd(offerte.planningDatum)}</strong></p>
      <p><strong>Werkzaamheden:</strong> ${offerte.klusOmschrijving}</p>
      ${offerte.klantadres ? `<p><strong>Adres:</strong> ${offerte.klantadres}</p>` : ""}
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

/** Verwijdert emoji/symbolen die soms in Google Maps-bedrijfsnamen staan. */
function opschonenNaam(naam: string): string {
  return naam
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hoofdletter(tekst: string): string {
  return tekst.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

/**
 * Standaard concepttekst voor koude acquisitiemail naar een lead. Bewust
 * geen AI-gegenereerde tekst per lead — voorspelbaar, controleerbaar en de
 * ondernemer/beheerder kan 'm per lead nog aanpassen vóór verzending.
 */
export function standaardOutreachTekst(lead: Lead, appUrl: string): { onderwerp: string; tekst: string } {
  const vak = lead.vakgebied || "vakbedrijf";
  const plaats = hoofdletter(lead.plaats || "");
  const naam = opschonenNaam(lead.bedrijfsnaam) || "daar";
  return {
    onderwerp: `Offertes maken in 1 minuut in plaats van een avond`,
    tekst: `Hoi ${naam},

Herkenbaar? Een klant vraagt een prijsopgave, en 's avonds ben je nog bezig met een offerte in Word of Excel in elkaar te zetten.

Met OfferteFlits deel je een eigen unieke aanvraagpagina met je klanten, bijvoorbeeld op je website of via WhatsApp. De klant omschrijft daar zelf de klus, en die aanvraag verschijnt meteen in jouw dashboard. Met één klik zet je 'm om in een compleet offerteconcept, met materiaal- en arbeidsregels. Jij controleert 'm, past aan wat nodig is, en verstuurt.

Ook wat daarna gebeurt, gaat vanzelf:
- de klant keurt de offerte online goed, geen gedoe met handtekeningen
- zodra die akkoord is, gaat de factuur automatisch de deur uit
- en samen plannen jullie de klus meteen in het systeem in

Als ${vak} in ${plaats} is OfferteFlits voor jou volledig gratis te gebruiken: alle functies, geen creditcard nodig, geen addertjes onder het gras.

Benieuwd? Bekijk het hier: ${appUrl}

Met vriendelijke groet,
Team OfferteFlits`,
  };
}

/**
 * Verstuurt één acquisitiemail naar een lead, met verplichte afmeldlink
 * (wettelijk vereist voor commerciële e-mail). Gooit een fout bij falen —
 * de aanroeper telt zelf hoeveel er echt verstuurd zijn.
 */
export async function verstuurOutreachEmail(lead: Lead, unsubscribeUrl: string) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY ontbreekt — e-mail versturen is niet geconfigureerd.");
  }
  if (!lead.email?.trim()) {
    throw new Error("Geen e-mailadres bekend voor deze lead.");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: afzender(),
    to: [lead.email],
    replyTo: process.env.OUTREACH_REPLY_TO || undefined,
    subject: lead.emailOnderwerp,
    html: `
      <div style="white-space:pre-line">${lead.emailTekst}</div>
      <p style="margin-top:24px;font-size:12px;color:#666">
        Je ontvangt dit bericht omdat ${lead.bedrijfsnaam || "jullie bedrijf"} als ${
          lead.vakgebied || "vakbedrijf"
        } in ${lead.plaats} publiek vindbaar is. Geen interesse?
        <a href="${unsubscribeUrl}">Meld je in één klik af</a>.
      </p>
    `,
  });

  if (error) {
    throw new Error(`Versturen van e-mail mislukt: ${error.message}`);
  }
}
