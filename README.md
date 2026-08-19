# OfferteFlits

Multi-tenant SaaS-offertetool voor vakmensen (loodgieters, elektriciens,
aannemers, schilders, etc.). Elk bedrijf logt apart in en beheert zijn eigen
offertes, klanten en instellingen. Beschrijf een klus in gewone taal en krijg
binnen een minuut een offerteconcept met materiaal- en arbeidsregels, dat je
direct kunt bewerken, als PDF kunt downloaden en per e-mail naar de klant kunt
sturen.

## Functionaliteit

- **Registratie/login** per bedrijf (Supabase Auth), elk account ziet alleen
  zijn eigen data (Row Level Security)
- **AI-offertes**: klus omschrijven → Claude genereert materiaal- en
  arbeidsregels, direct bewerkbaar
- **Klantenbeheer**: klanten opslaan en hergebruiken bij nieuwe offertes
- **Dashboard**: omzet uit geaccepteerde offertes, conversieratio, offertes
  deze maand
- **Huisstijl**: logo uploaden en merkkleur instellen, gebruikt op offertes/PDF
- **PDF + e-mail**: offerte als PDF downloaden of direct per e-mail (met
  PDF-bijlage) naar de klant versturen

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- **Supabase**: Postgres-database met Row Level Security, Auth, Storage
  (logo's)
- **Anthropic Claude API** (`@anthropic-ai/sdk`) met Zod-gevalideerde
  structured output voor offerteregels
- **Resend** voor transactionele e-mail
- **@react-pdf/renderer** voor server-side PDF-generatie

## Setup

### 1. Database (Supabase)

Draai het volledige script in `supabase/migration.sql` één keer in je
Supabase-project via **Dashboard → SQL Editor → New query → Run**. Dit maakt
de tabellen (`profiles`, `klanten`, `offertes`), Row Level Security-policies,
de auto-profiel-trigger bij registratie, en de `logos`-storage-bucket aan.

> Zonder deze migratie werkt de app niet — elke database-call faalt totdat de
> tabellen bestaan.

### 2. Omgevingsvariabelen

```bash
cp .env.example .env.local
```

Vul in:

| Variabele | Waar te vinden |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API (publishable/anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (secret, alleen server-side) |
| `RESEND_API_KEY` | resend.com → API Keys |
| `RESEND_FROM_EMAIL` | optioneel; standaard `OfferteFlits <onboarding@resend.dev>` — voor productie een geverifieerd eigen domein in Resend gebruiken |
| `ANTHROPIC_API_KEY` | optioneel; zonder key valt AI-generatie terug op een eenvoudig basisvoorstel |

Zet dezelfde variabelen ook in **Vercel → Project → Settings → Environment
Variables** voor de live deployment.

### 3. Ontwikkelen

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Belangrijk: e-mailbevestiging bij registratie

Supabase heeft standaard "Confirm email" aan staan — na registreren moet de
gebruiker eerst op een link in zijn mail klikken voor hij kan inloggen. Wil je
dat uitschakelen voor snellere tests: **Supabase → Authentication →
Providers → Email → "Confirm email" uitzetten**.

## Belangrijk: e-mail versturen (Resend)

Zonder een geverifieerd eigen domein in Resend kan de standaard
`onboarding@resend.dev`-afzender alleen mailen naar het e-mailadres waarmee
je Resend-account is aangemaakt. Voor e-mails naar willekeurige klanten:
verifieer een eigen domein in Resend en zet `RESEND_FROM_EMAIL` op een adres
binnen dat domein.

## Productie build

```bash
npm run build
npm run start
```
