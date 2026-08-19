export type RegelType = "materiaal" | "arbeid";

export interface OfferteRegel {
  id: string;
  omschrijving: string;
  type: RegelType;
  aantal: number;
  eenheid: string;
  prijsPerEenheid: number;
}

export type OfferteStatus = "concept" | "verzonden" | "geaccepteerd" | "afgewezen";

export interface Offerte {
  id: string;
  offerteNummer: string;
  klantnaam: string;
  klantadres: string;
  klusOmschrijving: string;
  regels: OfferteRegel[];
  btwPercentage: number;
  status: OfferteStatus;
  opmerkingen: string;
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
};
