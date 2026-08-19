import { Instellingen, OfferteRegel } from "./types";

interface Coordinaat {
  lat: number;
  lon: number;
}

/**
 * Geocodeert een adres naar coördinaten via de gratis, publieke PDOK
 * Locatieserver (Nederlandse overheid, geen API-key nodig). Geeft null
 * terug bij een leeg adres, netwerkfout of geen resultaat — voorrijkosten
 * zijn een gemak, geen kritieke functie.
 */
export async function geocodeAdres(adres: string): Promise<Coordinaat | null> {
  if (!adres?.trim()) return null;
  try {
    const response = await fetch(
      `https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest?q=${encodeURIComponent(
        adres
      )}&fq=type:adres&rows=1&fl=centroide_ll`
    );
    if (!response.ok) return null;
    const data = await response.json();
    const centroide = data?.response?.docs?.[0]?.centroide_ll as string | undefined;
    if (!centroide) return null;
    // Formaat: "POINT(4.895168 52.370216)" — lon lat
    const match = centroide.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
    if (!match) return null;
    return { lon: parseFloat(match[1]), lat: parseFloat(match[2]) };
  } catch {
    return null;
  }
}

/** Hemelsbrede afstand in kilometers tussen twee coördinaten (haversine). */
export function afstandInKm(a: Coordinaat, b: Coordinaat): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

interface VoorrijkostenResultaat {
  regel: OfferteRegel | null;
  /** Reden waarom er geen regel is toegevoegd; null als het is gelukt. */
  reden: string | null;
}

/**
 * Berekent een voorrijkosten-offerteregel op basis van de hemelsbrede
 * afstand tussen bedrijfsadres en klantadres, als de ondernemer daarvoor
 * een tarief heeft ingesteld. Geeft de reden mee als het niet lukt, zodat
 * dit in de UI en server-logs te achterhalen is — voorrijkosten zijn een
 * gemak, dus falen ze altijd stil richting de offerte zelf.
 */
async function berekenVoorrijkosten(
  instellingen: Instellingen,
  klantadres: string
): Promise<VoorrijkostenResultaat> {
  if (!instellingen.voorrijkostenPerKm || instellingen.voorrijkostenPerKm <= 0) {
    return { regel: null, reden: "Er is geen tarief voor voorrijkosten ingesteld bij Instellingen." };
  }
  if (!instellingen.adres?.trim()) {
    return { regel: null, reden: "Er is geen bedrijfsadres ingesteld bij Instellingen." };
  }
  if (!klantadres?.trim()) {
    return { regel: null, reden: "Er is nog geen klantadres ingevuld bij deze offerte." };
  }

  const [bedrijfCoord, klantCoord] = await Promise.all([
    geocodeAdres(instellingen.adres),
    geocodeAdres(klantadres),
  ]);
  if (!bedrijfCoord) {
    console.warn(`[voorrijkosten] bedrijfsadres niet gevonden via PDOK: "${instellingen.adres}"`);
    return {
      regel: null,
      reden:
        "Het bedrijfsadres (bij Instellingen) kon niet worden gevonden. Kies het adres uit de suggestielijst in plaats van het zelf te typen.",
    };
  }
  if (!klantCoord) {
    console.warn(`[voorrijkosten] klantadres niet gevonden via PDOK: "${klantadres}"`);
    return {
      regel: null,
      reden:
        "Het klantadres kon niet worden gevonden. Kies het adres uit de suggestielijst in plaats van het zelf te typen.",
    };
  }

  const afstand = afstandInKm(bedrijfCoord, klantCoord);
  const teBerekenenKm = afstand - (instellingen.voorrijkostenGratisTotKm || 0);
  if (teBerekenenKm <= 0) {
    return {
      regel: null,
      reden: `De afstand (${afstand.toFixed(1)} km) valt binnen de gratis afstand van ${
        instellingen.voorrijkostenGratisTotKm || 0
      } km, dus zijn er geen voorrijkosten berekend.`,
    };
  }

  return {
    regel: {
      id: `voorrijkosten-${Date.now()}`,
      omschrijving: `Voorrijkosten (${afstand.toFixed(1)} km)`,
      type: "materiaal",
      aantal: Math.round(teBerekenenKm * 10) / 10,
      eenheid: "km",
      prijsPerEenheid: instellingen.voorrijkostenPerKm,
    },
    reden: null,
  };
}

export async function berekenVoorrijkostenRegel(
  instellingen: Instellingen,
  klantadres: string
): Promise<OfferteRegel | null> {
  const { regel } = await berekenVoorrijkosten(instellingen, klantadres);
  return regel;
}

/** Geeft, voor gebruik in de UI, de reden terug waarom voorrijkosten niet zijn toegepast. */
export async function diagnoseVoorrijkosten(
  instellingen: Instellingen,
  klantadres: string
): Promise<string | null> {
  const { reden } = await berekenVoorrijkosten(instellingen, klantadres);
  return reden;
}
