export type RegelType = "materiaal" | "arbeid";

export interface OfferteRegel {
  id: string;
  omschrijving: string;
  type: RegelType;
  aantal: number;
  eenheid: string;
  prijsPerEenheid: number;
}

export type OfferteStatus =
  | "aanvraag"
  | "concept"
  | "verzonden"
  | "geaccepteerd"
  | "afgewezen";

export type PlanningStatus = "voorgesteld" | "tegenvoorstel" | "bevestigd" | "afgerond";
export type PlanningVoorgesteldDoor = "ondernemer" | "klant";

export interface Offerte {
  id: string;
  offerteNummer: string;
  klantId: string | null;
  klantnaam: string;
  klantadres: string;
  klantEmail: string;
  klusOmschrijving: string;
  regels: OfferteRegel[];
  btwPercentage: number;
  status: OfferteStatus;
  opmerkingen: string;
  planningStatus: PlanningStatus | null;
  planningDatum: string | null;
  planningNotitie: string;
  planningVoorgesteldDoor: PlanningVoorgesteldDoor | null;
  createdAt: string;
  updatedAt: string;
}

export interface Instellingen {
  bedrijfsnaam: string;
  adres: string;
  kvkNummer: string;
  btwNummer: string;
  iban: string;
  email: string;
  telefoon: string;
  standaardUurtarief: number;
  standaardBtwPercentage: number;
  logoUrl: string | null;
  merkkleur: string;
  extraInstructies: string;
  betalingstermijnDagen: number;
  voorrijkostenPerKm: number;
  voorrijkostenGratisTotKm: number;
}

export const DEFAULT_INSTELLINGEN: Instellingen = {
  bedrijfsnaam: "Mijn Vakbedrijf",
  adres: "",
  kvkNummer: "",
  btwNummer: "",
  iban: "",
  email: "",
  telefoon: "",
  standaardUurtarief: 55,
  standaardBtwPercentage: 21,
  logoUrl: null,
  merkkleur: "#111827",
  extraInstructies: "",
  betalingstermijnDagen: 14,
  voorrijkostenPerKm: 0,
  voorrijkostenGratisTotKm: 0,
};

export interface Klant {
  id: string;
  naam: string;
  adres: string;
  email: string;
  telefoon: string;
  createdAt: string;
}

export interface PrijslijstItem {
  id: string;
  naam: string;
  type: RegelType;
  eenheid: string;
  prijs: number;
  createdAt: string;
}

export type FactuurStatus = "open" | "betaald";

export interface Factuur {
  id: string;
  offerteId: string | null;
  factuurNummer: string;
  klantnaam: string;
  klantadres: string;
  klantEmail: string;
  regels: OfferteRegel[];
  btwPercentage: number;
  status: FactuurStatus;
  factuurdatum: string;
  vervaldatum: string;
  createdAt: string;
}
