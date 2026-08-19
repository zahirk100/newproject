import Link from "next/link";

const FEATURES = [
  {
    icon: "⚡",
    titel: "AI-offertes in seconden",
    tekst:
      "Beschrijf de klus in gewone taal — de AI stelt direct een offerteconcept op met realistische materiaal- en arbeidsregels.",
  },
  {
    icon: "👥",
    titel: "Klantenbeheer",
    tekst: "Klanten opslaan en hergebruiken bij nieuwe offertes, zonder steeds opnieuw te typen.",
  },
  {
    icon: "📧",
    titel: "Direct versturen",
    tekst: "Verstuur offertes als professionele PDF rechtstreeks per e-mail naar je klant.",
  },
  {
    icon: "📊",
    titel: "Inzicht in je omzet",
    tekst: "Dashboard met conversieratio, omzet uit geaccepteerde offertes en trends per maand.",
  },
  {
    icon: "🎨",
    titel: "Eigen huisstijl",
    tekst: "Upload je logo en merkkleur — elke offerte en PDF ziet er professioneel en herkenbaar uit.",
  },
  {
    icon: "🔒",
    titel: "Veilig per bedrijf",
    tekst: "Elk account heeft zijn eigen afgeschermde data — jouw offertes zijn alleen voor jou zichtbaar.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-lg font-semibold tracking-tight">OfferteFlits</div>
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

      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16 text-center sm:pt-24">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/60 dark:border-white/15 dark:text-white/60">
          Voor loodgieters, elektriciens, aannemers & schilders
        </div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Offertes maken in{" "}
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            minuten
          </span>
          , niet uren
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-black/60 dark:text-white/60">
          OfferteFlits gebruikt AI om binnen seconden een compleet offerteconcept op te stellen
          op basis van je klusomschrijving — inclusief materiaal, arbeid en een professionele
          PDF om direct naar de klant te sturen.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/registreren"
            className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            Gratis account aanmaken
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-black/15 px-6 py-3 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Ik heb al een account
          </Link>
        </div>
      </section>

      <section className="border-t border-black/10 bg-neutral-50 py-20 dark:border-white/10 dark:bg-neutral-900">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-10 text-center text-2xl font-semibold">
            Alles wat je nodig hebt om sneller te offreren
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.titel}
                className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-neutral-950"
              >
                <div className="mb-3 text-2xl">{feature.icon}</div>
                <h3 className="mb-1.5 font-semibold">{feature.titel}</h3>
                <p className="text-sm text-black/60 dark:text-white/60">{feature.tekst}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="mb-3 text-2xl font-semibold">Klaar om tijd te besparen op offertes?</h2>
        <p className="mb-8 text-black/60 dark:text-white/60">
          Gratis te starten. Geen creditcard nodig.
        </p>
        <Link
          href="/registreren"
          className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          Registreer je bedrijf
        </Link>
      </section>

      <footer className="border-t border-black/10 py-8 text-center text-sm text-black/40 dark:border-white/10 dark:text-white/40">
        © {new Date().getFullYear()} OfferteFlits
      </footer>
    </div>
  );
}
