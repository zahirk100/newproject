import { OfferteRegel } from "./types";

export function formatEuro(bedrag: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(bedrag);
}

export function regelTotaal(regel: OfferteRegel): number {
  return regel.aantal * regel.prijsPerEenheid;
}

export function berekenTotalen(regels: OfferteRegel[], btwPercentage: number) {
  const subtotaal = regels.reduce((som, regel) => som + regelTotaal(regel), 0);
  const btwBedrag = subtotaal * (btwPercentage / 100);
  const totaal = subtotaal + btwBedrag;
  return { subtotaal, btwBedrag, totaal };
}
