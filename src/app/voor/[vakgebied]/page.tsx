import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { VAKGEBIEDEN, getVakgebied } from "@/lib/vakgebieden";

export function generateStaticParams() {
  return VAKGEBIEDEN.map((v) => ({ vakgebied: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vakgebied: string }>;
}): Promise<Metadata> {
  const { vakgebied } = await params;
  const info = getVakgebied(vakgebied);
  if (!info) return {};

  return {
    title: info.metaTitel,
    description: info.metaBeschrijving,
    alternates: { canonical: `/voor/${info.slug}` },
    openGraph: {
      title: info.metaTitel,
      description: info.metaBeschrijving,
    },
    twitter: {
      title: info.metaTitel,
      description: info.metaBeschrijving,
    },
  };
}

export default async function VakgebiedPagina({
  params,
}: {
  params: Promise<{ vakgebied: string }>;
}) {
  const { vakgebied } = await params;
  const info = getVakgebied(vakgebied);
  if (!info) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "OfferteFlits",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `https://offerteflits.online/voor/${info.slug}`,
    description: info.metaBeschrijving,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    audience: { "@type": "Audience", audienceType: info.naamMeervoud },
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/">
          <Logo />
        </Link>
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
        <div className="mx-auto max-w-4xl px-6 pb-16 pt-16 text-center sm:pt-24">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-medium text-black/60 backdrop-blur dark:border-white/15 dark:bg-white/5 dark:text-white/60">
            Voor {info.naamMeervoud.toLowerCase()}
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {info.titel},{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              met AI in 1 minuut klaar
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-black/60 dark:text-white/60">
            {info.herkenbaar}
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

      <section className="border-t border-black/10 bg-neutral-50 py-16 dark:border-white/10 dark:bg-neutral-900">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-center text-2xl font-semibold">
            Ook geschikt voor bijvoorbeeld
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {info.voorbeeldKlussen.map((klus) => (
              <div
                key={klus}
                className="rounded-xl border border-black/10 bg-white p-5 text-center font-medium dark:border-white/10 dark:bg-neutral-950"
              >
                {klus}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 py-16 dark:border-white/10">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-center text-2xl font-semibold">Zo werkt het</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-1 font-semibold">
                Klant vraagt zelf aan, jij krijgt een compleet offerteconcept
              </h3>
              <p className="text-sm text-black/60 dark:text-white/60">
                Deel je eigen aanvraaglink. De klant beschrijft de klus (met foto&apos;s), en jij zet
                dat met één klik om in een offerte met materiaal- en arbeidsregels.
              </p>
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Klant keurt online goed</h3>
              <p className="text-sm text-black/60 dark:text-white/60">
                Geen telefoontjes of handtekeningen op papier. De klant keurt de offerte goed via
                een eigen link.
              </p>
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Factuur gaat automatisch de deur uit</h3>
              <p className="text-sm text-black/60 dark:text-white/60">
                Zodra de klant akkoord geeft, ontvangt die meteen de factuur. Jij hoeft daar niets
                voor te doen.
              </p>
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Samen de klus inplannen</h3>
              <p className="text-sm text-black/60 dark:text-white/60">
                Stel een datum voor, de klant bevestigt of stelt een ander moment voor, rechtstreeks
                in het systeem.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[28rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/15 via-violet-500/15 to-transparent blur-3xl"
        />
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-3 text-2xl font-semibold">
            Klaar om tijd te besparen als {info.naamEnkelvoud}?
          </h2>
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
