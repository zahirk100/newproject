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
  prijslijst: PrijslijstItem[] = []
): Promise<OfferteRegel[]> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic();
      const prijslijstTekst = prijslijst.length
        ? "\n\nPrijslijst van dit bedrijf — gebruik deze exacte prijzen wanneer een regel hiermee overeenkomt, in plaats van zelf een prijs te schatten:\n" +
          prijslijst.map((item) => `- ${item.naam} (${item.type}, per ${item.eenheid}): €${item.prijs}`).join("\n")
        : "";
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
          (instellingen.extraInstructies?.trim()
            ? `\n\nBedrijfsspecifieke instructies (altijd toepassen waar relevant): ${instellingen.extraInstructies.trim()}`
            : "") +
          prijslijstTekst,
        messages: [
          {
            role: "user",
            content: `Klusomschrijving: ${klusOmschrijving}`,
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
