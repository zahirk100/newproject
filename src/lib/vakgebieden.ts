export interface VakgebiedInfo {
  slug: string;
  naamEnkelvoud: string;
  naamMeervoud: string;
  titel: string;
  metaTitel: string;
  metaBeschrijving: string;
  herkenbaar: string;
  voorbeeldKlussen: string[];
}

export const VAKGEBIEDEN: VakgebiedInfo[] = [
  {
    slug: "loodgieters",
    naamEnkelvoud: "loodgieter",
    naamMeervoud: "Loodgieters",
    titel: "Offertesoftware voor loodgieters",
    metaTitel: "Offertesoftware voor loodgieters: offertes maken met AI",
    metaBeschrijving:
      "Speciaal voor loodgieters: maak binnen 1 minuut een offerte met AI, laat klanten online goedkeuren en automatiseer facturatie en planning. Gratis te gebruiken.",
    herkenbaar:
      "Een klant belt over een lekkage of een verstopping, en na het karwei ben je 's avonds nog bezig een offerte of factuur in elkaar te zetten. Met OfferteFlits omschrijft de klant de klus zelf via jouw eigen aanvraagpagina, en zet jij die met één klik om in een compleet offerteconcept.",
    voorbeeldKlussen: [
      "Lekkage verhelpen",
      "CV-ketel vervangen of onderhouden",
      "Badkamer renoveren",
      "Riolering ontstoppen",
    ],
  },
  {
    slug: "elektriciens",
    naamEnkelvoud: "elektricien",
    naamMeervoud: "Elektriciens",
    titel: "Offertesoftware voor elektriciens",
    metaTitel: "Offertesoftware voor elektriciens: offertes maken met AI",
    metaBeschrijving:
      "Speciaal voor elektriciens: maak binnen 1 minuut een offerte met AI, laat klanten online goedkeuren en automatiseer facturatie en planning. Gratis te gebruiken.",
    herkenbaar:
      "Van een nieuwe groepenkast tot een laadpaal, elke aanvraag vraagt weer een handmatige offerte in Word of Excel. Met OfferteFlits omschrijft de klant de klus zelf via jouw eigen aanvraagpagina (met foto's van de meterkast erbij), en zet jij die met één klik om in een compleet offerteconcept met materiaal- en arbeidsregels.",
    voorbeeldKlussen: [
      "Groepenkast vervangen",
      "Laadpaal installeren",
      "Verlichting aanleggen",
      "Keuring en meterkastcontrole",
    ],
  },
  {
    slug: "aannemers",
    naamEnkelvoud: "aannemer",
    naamMeervoud: "Aannemers",
    titel: "Offertesoftware voor aannemers",
    metaTitel: "Offertesoftware voor aannemers: offertes maken met AI",
    metaBeschrijving:
      "Speciaal voor aannemers: maak binnen 1 minuut een offerte met AI, laat klanten online goedkeuren en automatiseer facturatie en planning. Gratis te gebruiken.",
    herkenbaar:
      "Verbouwingen en aanbouwen hebben vaak veel regels nodig: materiaal, arbeid, onderaannemers. Met OfferteFlits omschrijft de klant het project zelf via jouw eigen aanvraagpagina, en zet jij die aanvraag met één klik om in een compleet offerteconcept dat je verder verfijnt voor je het verstuurt.",
    voorbeeldKlussen: [
      "Verbouwing of aanbouw",
      "Dakkapel plaatsen",
      "Keuken of badkamer verbouwen",
      "Fundering en funderingsherstel",
    ],
  },
  {
    slug: "schilders",
    naamEnkelvoud: "schilder",
    naamMeervoud: "Schilders",
    titel: "Offertesoftware voor schilders",
    metaTitel: "Offertesoftware voor schilders: offertes maken met AI",
    metaBeschrijving:
      "Speciaal voor schilders: maak binnen 1 minuut een offerte met AI, laat klanten online goedkeuren en automatiseer facturatie en planning. Gratis te gebruiken.",
    herkenbaar:
      "Bij schilderwerk hangt de prijs sterk af van oppervlak en staat van het werk, dat betekent voor elke aanvraag opnieuw rekenen. Met OfferteFlits omschrijft de klant de klus zelf via jouw eigen aanvraagpagina (met foto's van de ruimte erbij), en zet jij die met één klik om in een compleet offerteconcept.",
    voorbeeldKlussen: [
      "Binnenschilderwerk",
      "Buitenschilderwerk en kozijnen",
      "Behang verwijderen en sausen",
      "Houtrotherstel",
    ],
  },
];

export function getVakgebied(slug: string): VakgebiedInfo | undefined {
  return VAKGEBIEDEN.find((v) => v.slug === slug);
}
