import Link from "next/link";
import Logo from "@/components/Logo";

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

const FEATURES = [
  {
    icon: "👥",
    titel: "Klantenbeheer",
    tekst: "Klanten opslaan en hergebruiken bij nieuwe offertes, zonder steeds opnieuw te typen.",
    accent: "bg-blue-100 dark:bg-blue-900/40",
  },
  {
    icon: "📊",
    titel: "Inzicht in je omzet",
    tekst: "Dashboard met conversieratio, omzet uit geaccepteerde offertes en trends per maand.",
    accent: "bg-violet-100 dark:bg-violet-900/40",
  },
  {
    icon: "🎨",
    titel: "Eigen huisstijl",
    tekst: "Upload je logo en merkkleur, elke offerte en PDF ziet er professioneel en herkenbaar uit.",
    accent: "bg-amber-100 dark:bg-amber-900/40",
  },
  {
    icon: "💰",
    titel: "Eigen prijslijst",
    tekst: "Leg je vaste materiaal- en dienstenprijzen vast, de AI gebruikt die in plaats van te gokken.",
    accent: "bg-emerald-100 dark:bg-emerald-900/40",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
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
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full text-xl ${feature.accent}`}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-1.5 font-semibold">{feature.titel}</h3>
                <p className="text-sm text-black/60 dark:text-white/60">{feature.tekst}</p>
              </div>
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
        © {new Date().getFullYear()} OfferteFlits
      </footer>
    </div>
  );
}
