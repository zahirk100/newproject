/**
 * Vaste rotatie van vakgebied+stad-combinaties voor de volledig automatische
 * dagelijkse acquisitie (zoeken → goedkeuren → versturen, zie
 * /api/cron/leads-versturen). leads_planning.zoek_index onthoudt waar de
 * vorige run gebleven is; bij het einde van de lijst begint het weer bij 0
 * (nuttig, want er kunnen ondertussen nieuwe bedrijven bijgekomen zijn).
 */
const VAKGEBIEDEN = ["loodgieter", "elektricien", "aannemer", "schilder"];

const STEDEN = [
  "Amsterdam",
  "Rotterdam",
  "Den Haag",
  "Utrecht",
  "Eindhoven",
  "Groningen",
  "Tilburg",
  "Almere",
  "Breda",
  "Nijmegen",
  "Apeldoorn",
  "Haarlem",
  "Arnhem",
  "Amersfoort",
  "Zaanstad",
  "'s-Hertogenbosch",
  "Haarlemmermeer",
  "Zwolle",
  "Leiden",
  "Maastricht",
  "Dordrecht",
  "Ede",
  "Alkmaar",
  "Deventer",
];

export const ZOEK_COMBOS: { vakgebied: string; plaats: string }[] = STEDEN.flatMap((plaats) =>
  VAKGEBIEDEN.map((vakgebied) => ({ vakgebied, plaats }))
);
