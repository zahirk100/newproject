import Link from "next/link";
import Logo from "@/components/Logo";
import { VAKGEBIEDEN } from "@/lib/vakgebieden";
import { SITE_URL } from "@/lib/config";

const VEELGESTELDE_VRAGEN = [
  {
    vraag: "Is OfferteFlits echt gratis?",
    antwoord:
      "Ja, alle functies zijn volledig gratis te gebruiken. Geen creditcard nodig en geen verborgen kosten.",
  },
  {
    vraag: "Voor welke vakgebieden is OfferteFlits geschikt?",
    antwoord:
      "OfferteFlits is gemaakt voor vakbedrijven zoals loodgieters, elektriciens, aannemers en schilders, maar is te gebruiken door elk vakbedrijf dat offertes maakt.",
  },
  {
    vraag: "Moet mijn klant een account aanmaken?",
    antwoord:
      "Nee. De klant vraagt een offerte aan en keurt 'm later goed via een eigen link, zonder in te loggen of een account aan te maken.",
  },
  {
    vraag: "Hoe snel staat een offerte klaar?",
    antwoord:
      "Zodra een aanvraag binnenkomt, zet je die met één klik om in een compleet offerteconcept met materiaal- en arbeidsregels. Jij controleert en verstuurt.",
  },
  {
    vraag: "Wat gebeurt er nadat de klant een offerte goedkeurt?",
    antwoord:
      "De factuur gaat automatisch naar de klant, en jullie plannen de klus samen in binnen het systeem.",
  },
];

const STAPPEN = [
  {
    nummer: "1",
    titel: "Klant vraagt aan via jouw eigen link",
    tekst:
      "Deel je persoonlijke aanvraaglink op je website of WhatsApp. De klant beschrijft de klus en krijgt gerichte vervolgvragen (en kan foto's toevoegen), zodat jij meteen alle informatie hebt.",
  },
  {
    nummer: "2",
    titel: "Jij stelt je bedrijf in",
    tekst:
      "Uurtarief, voorwaarden, prijslijst en voorrijkosten. Eenmaal ingesteld past de AI dit automatisch toe bij elke offerte die wordt opgesteld.",
  },
  {
    nummer: "3",
    titel: "Eén klik en de offerte staat klaar",
    tekst:
      "Zet de aanvraag met één klik om in een compleet offerteconcept met materiaal en arbeidsregels. Controleer, pas aan waar nodig en verstuur.",
  },
  {
    nummer: "4",
    titel: "De klant keurt online goed",
    tekst:
      "Geen telefoontjes of handtekeningen op papier nodig. De klant bekijkt de offerte via een eigen link en keurt 'm goed of wijst 'm af.",
  },
  {
    nummer: "5",
    titel: "Bij goedkeuring gaat de factuur automatisch de deur uit",
    tekst:
      "Zodra de klant akkoord geeft, ontvangt die meteen de factuur per e-mail. Jij hoeft daar zelf niets meer voor te doen.",
  },
  {
    nummer: "6",
    titel: "Samen een datum plannen",
    tekst:
      "Stel voor wanneer je de klus komt uitvoeren. De klant bevestigt of stelt een ander moment voor, de uiteindelijke keuze blijft bij jou.",
  },
];

function IconKlanten() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8.5 9v-1a3.5 3.5 0 0 0-2.5-3.36M15 3.13a4 4 0 0 1 0 7.75"
      />
    </svg>
  );
}

function IconOmzet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20V10m6 10V4m6 16v-7m6 7V8" />
    </svg>
  );
}

function IconHuisstijl() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c4.97 0 9 3.58 9 8 0 2.76-2.24 4-4.5 4H15a1.5 1.5 0 0 0-1.06 2.56c.53.53.28 1.44-.44 1.44H12c-4.97 0-9-4.03-9-9s4.03-7 9-7Z"
      />
      <circle cx="7.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="10" cy="8.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconPrijslijst() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-3M9 5a3 3 0 0 1 6 0M9 5a3 3 0 0 0 6 0M9 12h6M9 16h6"
      />
    </svg>
  );
}

const FEATURES = [
  {
    icon: IconKlanten,
    titel: "Klantenbeheer",
    tekst: "Klanten opslaan en hergebruiken bij nieuwe offertes, zonder steeds opnieuw te typen.",
    accent: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    icon: IconOmzet,
    titel: "Inzicht in je omzet",
    tekst: "Dashboard met conversieratio, omzet uit geaccepteerde offertes en trends per maand.",
    accent: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  },
  {
    icon: IconHuisstijl,
    titel: "Eigen huisstijl",
    tekst: "Upload je logo en merkkleur, elke offerte en PDF ziet er professioneel en herkenbaar uit.",
    accent: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    icon: IconPrijslijst,
    titel: "Eigen prijslijst",
    tekst: "Leg je vaste materiaal- en dienstenprijzen vast, de AI gebruikt die in plaats van te gokken.",
    accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
];

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "OfferteFlits",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "AI-software waarmee vakbedrijven zoals loodgieters, elektriciens, aannemers en schilders binnen 1 minuut een offerte maken, klanten online laten goedkeuren en facturatie en planning automatiseren.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  audience: {
    "@type": "Audience",
    audienceType: "Vakbedrijven (loodgieters, elektriciens, aannemers, schilders)",
  },
};

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: VEELGESTELDE_VRAGEN.map((item) => ({
    "@type": "Question",
    name: item.vraag,
    acceptedAnswer: { "@type": "Answer", text: item.antwoord },
  })),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-md px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
          >
            Inloggen
          </Link>
          <Link
            href="/registreren"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            Gratis starten
          </Link>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-12rem] -z-10 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/25 via-violet-500/20 to-transparent blur-3xl dark:from-blue-500/20 dark:via-violet-500/15"
        />
        <div className="mx-auto max-w-4xl px-6 pb-20 pt-16 text-center sm:pt-24">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-medium text-black/60 backdrop-blur dark:border-white/15 dark:bg-white/5 dark:text-white/60">
            Voor vakbedrijven, zoals loodgieters, elektriciens, aannemers en schilders
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Van offerte-aanvraag tot betaalde klus,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              automatisch geregeld
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-black/60 dark:text-white/60">
            Klanten vragen zelf een offerte aan via jouw eigen link. De AI stelt met één klik een
            offerteconcept op, de klant keurt online goed, de factuur gaat automatisch de deur uit
            en samen plannen jullie de klus in.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/registreren"
              className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-black/80 hover:shadow-lg dark:bg-white dark:text-black dark:hover:bg-white/80"
            >
              Gratis account aanmaken
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-black/15 px-6 py-3 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
            >
              Ik heb al een account
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 py-20 dark:border-white/10">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-10 text-center text-2xl font-semibold">Hoe het werkt</h2>
          <div className="relative space-y-8">
            <div
              aria-hidden
              className="absolute left-[18px] top-2 bottom-2 hidden w-px bg-gradient-to-b from-blue-500/40 via-violet-500/40 to-transparent sm:block"
            />
            {STAPPEN.map((stap) => (
              <div key={stap.nummer} className="relative flex gap-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-semibold text-white shadow-sm">
                  {stap.nummer}
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">{stap.titel}</h3>
                  <p className="text-sm text-black/60 dark:text-white/60">{stap.tekst}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-neutral-50 py-20 dark:border-white/10 dark:bg-neutral-900">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-10 text-center text-2xl font-semibold">Ook nog handig</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.titel}
                className="rounded-xl border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-neutral-950"
              >
                <div
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${feature.accent}`}
                >
                  <feature.icon />
                </div>
                <h3 className="mb-1.5 font-semibold">{feature.titel}</h3>
                <p className="text-sm text-black/60 dark:text-white/60">{feature.tekst}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 py-20 dark:border-white/10">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-10 text-center text-2xl font-semibold">Veelgestelde vragen</h2>
          <div className="space-y-3">
            {VEELGESTELDE_VRAGEN.map((item) => (
              <details
                key={item.vraag}
                className="group rounded-lg border border-black/10 p-4 dark:border-white/10"
              >
                <summary className="cursor-pointer list-none font-medium marker:content-none">
                  {item.vraag}
                </summary>
                <p className="mt-2 text-sm text-black/60 dark:text-white/60">{item.antwoord}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[28rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/15 via-violet-500/15 to-transparent blur-3xl"
        />
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-3 text-2xl font-semibold">Klaar om tijd te besparen op offertes?</h2>
          <p className="mb-8 text-black/60 dark:text-white/60">
            Gratis te starten. Geen creditcard nodig.
          </p>
          <Link
            href="/registreren"
            className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-black/80 hover:shadow-lg dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            Registreer je bedrijf
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/10 py-8 text-center text-sm text-black/40 dark:border-white/10 dark:text-white/40">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {VAKGEBIEDEN.map((v) => (
            <Link key={v.slug} href={`/voor/${v.slug}`} className="hover:text-black/70 dark:hover:text-white/70">
              Voor {v.naamMeervoud.toLowerCase()}
            </Link>
          ))}
        </div>
        © {new Date().getFullYear()} OfferteFlits
      </footer>
    </div>
  );
}
