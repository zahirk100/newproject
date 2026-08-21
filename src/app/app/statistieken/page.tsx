import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { getPlatformStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

function StatKaart({ label, waarde, toelichting }: { label: string; waarde: string; toelichting?: string }) {
  return (
    <div className="rounded-lg border border-black/10 p-5 dark:border-white/10">
      <div className="text-sm text-black/60 dark:text-white/60">{label}</div>
      <div className="mt-1 text-3xl font-semibold">{waarde}</div>
      {toelichting && <div className="mt-1 text-xs text-black/50 dark:text-white/50">{toelichting}</div>}
    </div>
  );
}

export default async function StatistiekenPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(supabase, user.id))) notFound();

  const stats = await getPlatformStats();
  const openRate =
    stats.outreachVerzonden > 0
      ? Math.round((stats.outreachGeopend / stats.outreachVerzonden) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
      <h1 className="mb-2 text-2xl font-semibold">Statistieken</h1>
      <p className="mb-8 text-sm text-black/60 dark:text-white/60">
        Platformbrede cijfers over alle geregistreerde bedrijven, dwars door alle accounts heen.
        Niet zichtbaar voor ondernemer-klanten.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatKaart label="Geregistreerde bedrijven" waarde={String(stats.totaalAccounts)} />
        <StatKaart
          label="Nieuw deze week"
          waarde={String(stats.nieuweAccounts7Dagen)}
          toelichting="Laatste 7 dagen"
        />
        <StatKaart
          label="Nieuw deze maand"
          waarde={String(stats.nieuweAccounts30Dagen)}
          toelichting="Laatste 30 dagen"
        />
        <StatKaart
          label="Actieve bedrijven"
          waarde={String(stats.actieveAccounts)}
          toelichting="Minstens 1 offerte aangemaakt"
        />
        <StatKaart label="Offertes aangemaakt" waarde={String(stats.totaalOffertes)} toelichting="Totaal, alle statussen" />
        <StatKaart
          label="Offertes geaccepteerd"
          waarde={String(stats.offertesGeaccepteerd)}
          toelichting="Klant heeft online goedgekeurd"
        />
      </div>

      <h2 className="mb-3 text-lg font-semibold">Outreach-mails</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatKaart label="Verzonden" waarde={String(stats.outreachVerzonden)} />
        <StatKaart
          label="Geopend"
          waarde={`${stats.outreachGeopend} (${openRate}%)`}
          toelichting="Open rate t.o.v. verzonden"
        />
        <StatKaart label="Doorgeklikt" waarde={String(stats.outreachGeklikt)} />
        <StatKaart label="Afgemeld" waarde={String(stats.outreachAfgemeld)} />
      </div>

      <div className="rounded-lg border border-black/10 dark:border-white/10">
        <h2 className="border-b border-black/10 px-5 py-3 text-sm font-semibold dark:border-white/10">
          Laatste registraties
        </h2>
        {stats.recenteRegistraties.length === 0 ? (
          <p className="px-5 py-6 text-sm text-black/60 dark:text-white/60">Nog geen registraties.</p>
        ) : (
          <ul className="divide-y divide-black/10 dark:divide-white/10">
            {stats.recenteRegistraties.map((r, i) => (
              <li key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>{r.bedrijfsnaam}</span>
                <span className="text-black/50 dark:text-white/50">
                  {new Date(r.createdAt).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
