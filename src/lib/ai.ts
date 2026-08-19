import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { Instellingen, OfferteRegel, PrijslijstItem, RegelType } from "./types";

const RegelSchema = z.object({
  omschrijving: z.string(),
  type: z.enum(["materiaal", "arbeid"]),
  aantal: z.number(),
  eenheid: z.string(),
  prijsPerEenheid: z.number(),
});

const OfferteAiSchema = z.object({
  regels: z.array(RegelSchema),
});

const VragenSchema = z.object({
  vragen: z.array(z.string()),
});

function withIds(regels: z.infer<typeof RegelSchema>[]): OfferteRegel[] {
  return regels.map((regel, index) => ({
    id: `${Date.now()}-${index}`,
    omschrijving: regel.omschrijving,
    type: regel.type as RegelType,
    aantal: regel.aantal,
    eenheid: regel.eenheid,
    prijsPerEenheid: regel.prijsPerEenheid,
  }));
}

export async function genereerOfferteRegels(
  klusOmschrijving: string,
  instellingen: Instellingen,
  prijslijst: PrijslijstItem[] = [],
  fotoUrls: string[] = []
): Promise<OfferteRegel[]> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic();
      const prijslijstTekst = prijslijst.length
        ? "\n\nPrijslijst van dit bedrijf — gebruik deze exacte prijzen wanneer een regel hiermee overeenkomt, in plaats van zelf een prijs te schatten:\n" +
          prijslijst.map((item) => `- ${item.naam} (${item.type}, per ${item.eenheid}): €${item.prijs}`).join("\n")
        : "";
      const fotoBlokken: { type: "image"; source: { type: "url"; url: string } }[] =
        fotoUrls.slice(0, 6).map((url) => ({ type: "image", source: { type: "url", url } }));
      const response = await client.messages.parse({
        model: "claude-opus-5",
        max_tokens: 4096,
        system:
          "Je bent een ervaren calculator voor een Nederlands vakbedrijf (bijv. loodgieter, elektricien, aannemer, schilder). " +
          "Je zet een korte klusomschrijving om in een realistische offerteregels-lijst met materiaal- en arbeidsposten, " +
          "in het Nederlands, met marktconforme Nederlandse prijzen (EUR, excl. btw). " +
          `Het standaard uurtarief van dit bedrijf is €${instellingen.standaardUurtarief} per uur; gebruik dat voor arbeidsregels tenzij de klus duidelijk ander werk vraagt. ` +
          "Splits materiaal en arbeid in aparte regels. Wees realistisch met aantallen en eenheden (bijv. 'uur', 'stuk', 'm', 'm2'). " +
          "Belangrijk: verzin geen specifieke merken, producttypes of exacte details die niet uit de klusomschrijving of de " +
          "bedrijfsinstructies hieronder blijken — gebruik dan een neutrale, algemene omschrijving (bijv. 'cv-ketel' i.p.v. een " +
          "verzonnen merk/model). Wees terughoudend en realistisch met prijzen; noem geen valse precisie of details die je niet weet." +
          (fotoUrls.length
            ? " Bij deze aanvraag zitten ook foto's van de situatie — gebruik die om de omvang en staat van het werk beter in te schatten."
            : "") +
          (instellingen.extraInstructies?.trim()
            ? `\n\nBedrijfsspecifieke instructies (altijd toepassen waar relevant): ${instellingen.extraInstructies.trim()}`
            : "") +
          prijslijstTekst,
        messages: [
          {
            role: "user",
            content: [...fotoBlokken, { type: "text", text: `Klusomschrijving: ${klusOmschrijving}` }],
          },
        ],
        output_config: {
          format: zodOutputFormat(OfferteAiSchema),
        },
      });

      if (response.parsed_output) {
        return withIds(response.parsed_output.regels);
      }
    } catch (error) {
      console.error("AI offerte-generatie mislukt, val terug op basisvoorstel:", error);
    }
  }

  return withIds(mockRegels(klusOmschrijving, instellingen));
}

/**
 * Laat de AI bepalen welke belangrijke informatie nog ontbreekt in de
 * klusomschrijving van een klant, zodat het aanvraagformulier gericht kan
 * doorvragen vóórdat de aanvraag bij de ondernemer terechtkomt. Faalt stil
 * naar een lege lijst — dit is een verbetering van de aanvraag, geen
 * kritieke stap.
 */
export async function bepaalOntbrekendeVragen(
  klusOmschrijving: string,
  standaardVragen: string[]
): Promise<string[]> {
  if (!process.env.ANTHROPIC_API_KEY || !klusOmschrijving.trim()) return [];

  try {
    const client = new Anthropic();
    const vragenTekst = standaardVragen.length
      ? `\n\nDit bedrijf wil, waar relevant voor de klus, in elk geval antwoord op:\n${standaardVragen
          .map((vraag) => `- ${vraag}`)
          .join("\n")}`
      : "";
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 1024,
      system:
        "Je helpt een Nederlands vakbedrijf (loodgieter, elektricien, aannemer, schilder e.d.) om een " +
        "offerte-aanvraag van een klant compleet te maken vóórdat de ondernemer 'm ziet. " +
        "Lees de klusomschrijving en bepaal welke belangrijke informatie nog ontbreekt om een goede " +
        "offerte te kunnen maken. Stel alleen vragen over informatie die echt nog ontbreekt en die de " +
        "klant zelf makkelijk kan beantwoorden (bijv. afmetingen, aantallen, materiaalvoorkeur, " +
        "bouwjaar, huidige staat). Stel geen vraag als het antwoord al in de tekst staat. " +
        "Maximaal 4 vragen, kort en concreet, in het Nederlands, rechtstreeks aan de klant (jij-vorm). " +
        "Geef een lege lijst terug als de omschrijving al compleet genoeg is." +
        vragenTekst,
      messages: [{ role: "user", content: `Klusomschrijving van de klant: ${klusOmschrijving}` }],
      output_config: {
        format: zodOutputFormat(VragenSchema),
      },
    });

    return response.parsed_output?.vragen.slice(0, 4) ?? [];
  } catch (error) {
    console.error("Bepalen van ontbrekende vragen mislukt:", error);
    return [];
  }
}

function mockRegels(
  klusOmschrijving: string,
  instellingen: Instellingen
): z.infer<typeof RegelSchema>[] {
  return [
    {
      omschrijving: `Arbeid: ${klusOmschrijving.slice(0, 80)}`,
      type: "arbeid",
      aantal: 4,
      eenheid: "uur",
      prijsPerEenheid: instellingen.standaardUurtarief,
    },
    {
      omschrijving: "Materiaal en kleinmateriaal",
      type: "materiaal",
      aantal: 1,
      eenheid: "post",
      prijsPerEenheid: 150,
    },
  ];
}
