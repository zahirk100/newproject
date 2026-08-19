# OfferteFlits

AI-offertetool voor vakmensen (loodgieters, elektriciens, aannemers, schilders,
etc.). Beschrijf een klus in gewone taal en krijg binnen een minuut een
offerteconcept met materiaal- en arbeidsregels, dat je direct kunt bewerken en
als PDF kunt exporteren.

## Hoe het werkt

1. **Instellingen** — vul bedrijfsgegevens en je standaard uurtarief/btw in.
2. **Nieuwe offerte** — beschrijf de klus, vul klantgegevens in.
3. De AI (Claude) genereert offerteregels op basis van de omschrijving en het
   standaard uurtarief.
4. Bewerk de regels, aantallen en prijzen naar wens op de offertepagina.
5. Sla op en gebruik **Print / Exporteer PDF** (browser-afdrukfunctie) om een
   PDF voor de klant te maken.

## Ontwikkelen

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### AI-configuratie

Zet een `ANTHROPIC_API_KEY` omgevingsvariabele om echte AI-gegenereerde
offertes te krijgen. Zonder API-key valt de app terug op een eenvoudig
basisvoorstel (1 arbeidsregel + 1 materiaalregel), zodat de rest van de app
ook zonder key te testen is.

```bash
cp .env.example .env.local   # en vul ANTHROPIC_API_KEY in
```

### Databeheer

Offertes en instellingen worden lokaal opgeslagen als JSON-bestanden in
`data/` (genegeerd door git). Voor productie/meerdere gebruikers vervang je
`src/lib/store.ts` door een echte database.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Anthropic Claude API (`@anthropic-ai/sdk`) met Zod-gevalideerde
  structured output voor offerteregels

## Productie build

```bash
npm run build
npm run start
```
