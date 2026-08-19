import Link from "next/link";
import { listOffertes } from "@/lib/store";
import { berekenTotalen, formatEuro } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  concept: "Concept",
  verzonden: "Verzonden",
  geaccepteerd: "Geaccepteerd",
  afgewezen: "Afgewezen",
};

const STATUS_KLASSE: Record<string, string> = {
  concept: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  verzonden: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  geaccepteerd: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  afgewezen: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default async function DashboardPage() {
  const offertes = await listOffertes();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Offertes</h1>
        <Link
          href="/offertes/nieuw"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          + Nieuwe offerte
        </Link>
      </div>

      {offertes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/15 p-10 text-center text-sm text-black/60 dark:border-white/15 dark:text-white/60">
          Nog geen offertes. Beschrijf een klus en laat de AI binnen een minuut
          een offerteconcept opstellen.
        </div>
      ) : (
        <ul className="divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/10">
          {offertes.map((offerte) => {
            const { totaal } = berekenTotalen(offerte.regels, offerte.btwPercentage);
            return (
              <li key={offerte.id}>
                <Link
                  href={`/offertes/${offerte.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                >
                  <div>
                    <div className="font-medium">
                      {offerte.klantnaam || "Naamloze klant"}{" "}
                      <span className="text-black/40 dark:text-white/40">
                        · {offerte.offerteNummer}
                      </span>
                    </div>
                    <div className="line-clamp-1 text-sm text-black/60 dark:text-white/60">
                      {offerte.klusOmschrijving}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_KLASSE[offerte.status] ?? STATUS_KLASSE.concept
                      }`}
                    >
                      {STATUS_LABEL[offerte.status] ?? offerte.status}
                    </span>
                    <span className="w-24 text-right text-sm font-medium">
                      {formatEuro(totaal)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
