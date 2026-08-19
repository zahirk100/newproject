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
  klantId: string | null;
  klantnaam: string;
  klantadres: string;
  klantEmail: string;
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
  logoUrl: string | null;
  merkkleur: string;
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
};

export interface Klant {
  id: string;
  naam: string;
  adres: string;
  email: string;
  telefoon: string;
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
