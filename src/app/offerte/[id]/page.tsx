import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { haalOfferteVoorPortaal } from "@/lib/portal";
import { berekenTotalen, formatEuro, regelTotaal } from "@/lib/format";
import OfferteActies from "./OfferteActies";
import PlanningSectie from "./PlanningSectie";

export const dynamic = "force-dynamic";

export default async function PubliekeOffertePagina({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const gegevens = await haalOfferteVoorPortaal(admin, id);
  if (!gegevens) notFound();

  const { offerte, instellingen } = gegevens;
  const { subtotaal, btwBedrag, totaal } = berekenTotalen(offerte.regels, offerte.btwPercentage);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 sm:py-10 dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl rounded-xl border border-black/10 bg-white p-5 shadow-sm sm:p-8 dark:border-white/10 dark:bg-neutral-900">
        <div className="mb-8 flex items-start justify-between border-b border-black/10 pb-6 dark:border-white/10">
          <div>
            {instellingen.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={instellingen.logoUrl} alt="" className="mb-2 h-8 w-auto object-contain" />
            )}
            <div className="text-lg font-semibold">{instellingen.bedrijfsnaam}</div>
            <div className="text-sm text-black/60 dark:text-white/60">{instellingen.adres}</div>
          </div>
          <div className="text-right text-sm">
            <div className="font-medium">Offerte {offerte.offerteNummer}</div>
            <div className="text-black/60 dark:text-white/60">
              {new Date(offerte.createdAt).toLocaleDateString("nl-NL")}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-xs font-medium uppercase tracking-wide text-black/50">Aan</div>
          <div className="font-medium">{offerte.klantnaam}</div>
          <div className="text-sm text-black/60 dark:text-white/60">{offerte.klantadres}</div>
        </div>

        <div className="mb-6">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-black/50">
            Klusomschrijving
          </div>
          <p className="text-sm text-black/80 dark:text-white/80">{offerte.klusOmschrijving}</p>
        </div>

        <div className="mb-2 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-black/50 dark:border-white/10">
              <th className="py-2 pr-2">Omschrijving</th>
              <th className="w-16 py-2 pr-2">Aantal</th>
              <th className="w-24 py-2 pr-2 text-right">Prijs/eenh.</th>
              <th className="w-24 py-2 text-right">Totaal</th>
            </tr>
          </thead>
          <tbody>
            {offerte.regels.map((regel) => (
              <tr key={regel.id} className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-2">{regel.omschrijving}</td>
                <td className="py-2 pr-2">
                  {regel.aantal} {regel.eenheid}
                </td>
                <td className="py-2 pr-2 text-right">{formatEuro(regel.prijsPerEenheid)}</td>
                <td className="py-2 text-right">{formatEuro(regelTotaal(regel))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <div className="ml-auto mb-8 w-56 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-black/60 dark:text-white/60">Subtotaal</span>
            <span>{formatEuro(subtotaal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/60 dark:text-white/60">
              BTW ({offerte.btwPercentage}%)
            </span>
            <span>{formatEuro(btwBedrag)}</span>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-1 text-base font-semibold dark:border-white/10">
            <span>Totaal</span>
            <span>{formatEuro(totaal)}</span>
          </div>
        </div>

        {offerte.opmerkingen && (
          <div className="mb-8 text-sm">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-black/50">
              Opmerkingen
            </div>
            <p className="text-black/80 dark:text-white/80">{offerte.opmerkingen}</p>
          </div>
        )}

        <OfferteActies offerteId={offerte.id} status={offerte.status} />

        {offerte.status === "geaccepteerd" && (
          <PlanningSectie
            offerteId={offerte.id}
            planningStatus={offerte.planningStatus}
            planningDatum={offerte.planningDatum}
            planningNotitie={offerte.planningNotitie}
            klusOmschrijving={offerte.klusOmschrijving}
            klantadres={offerte.klantadres}
          />
        )}
      </div>
    </div>
  );
}
