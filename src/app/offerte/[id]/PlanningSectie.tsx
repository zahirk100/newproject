"use client";

import { useState } from "react";
import { PlanningStatus } from "@/lib/types";

function formatteerDatum(iso: string) {
  return new Date(iso).toLocaleString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PlanningSectie({
  offerteId,
  planningStatus,
  planningDatum,
  planningNotitie,
}: {
  offerteId: string;
  planningStatus: PlanningStatus | null;
  planningDatum: string | null;
  planningNotitie: string;
}) {
  const [status, setStatus] = useState(planningStatus);
  const [huidigeDatum, setHuidigeDatum] = useState(planningDatum);
  const [tegenvoorstelOpen, setTegenvoorstelOpen] = useState(false);
  const [nieuweDatum, setNieuweDatum] = useState("");
  const [notitie, setNotitie] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function reageer(actie: "akkoord" | "tegenvoorstel") {
    if (actie === "tegenvoorstel" && !nieuweDatum) {
      setFout("Kies eerst een datum en tijd.");
      return;
    }
    setBezig(true);
    setFout(null);
    try {
      const response = await fetch(`/api/offerte/${offerteId}/planning-reactie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actie, datum: nieuweDatum, notitie }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Versturen mislukt");
      }
      const bijgewerkt = await response.json();
      setStatus(bijgewerkt.planningStatus);
      setHuidigeDatum(bijgewerkt.planningDatum);
      setTegenvoorstelOpen(false);
    } catch (error) {
      setFout(error instanceof Error ? error.message : "Onbekende fout");
    } finally {
      setBezig(false);
    }
  }

  if (!status) return null;

  return (
    <div className="mt-6 rounded-md border border-black/10 p-4 dark:border-white/10">
      <h2 className="mb-2 text-sm font-semibold">Afspraak</h2>

      {status === "bevestigd" && huidigeDatum && (
        <p className="text-sm">
          Bevestigd op <strong>{formatteerDatum(huidigeDatum)}</strong>.
        </p>
      )}

      {status === "afgerond" && huidigeDatum && (
        <p className="text-sm text-black/60 dark:text-white/60">
          Deze klus is afgerond ({formatteerDatum(huidigeDatum)}).
        </p>
      )}

      {status === "tegenvoorstel" && huidigeDatum && (
        <p className="text-sm text-black/60 dark:text-white/60">
          Je hebt <strong>{formatteerDatum(huidigeDatum)}</strong> voorgesteld. We wachten op een
          reactie.
        </p>
      )}

      {status === "voorgesteld" && huidigeDatum && (
        <div>
          <p className="mb-1 text-sm">
            Voorstel: <strong>{formatteerDatum(huidigeDatum)}</strong>
          </p>
          {planningNotitie && (
            <p className="mb-3 text-sm text-black/60 dark:text-white/60">{planningNotitie}</p>
          )}

          {!tegenvoorstelOpen ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => reageer("akkoord")}
                disabled={bezig}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {bezig ? "Bezig…" : "✓ Akkoord"}
              </button>
              <button
                onClick={() => setTegenvoorstelOpen(true)}
                className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              >
                Ander moment voorstellen
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-black/50">
                  Nieuwe datum en tijd
                </label>
                <input
                  type="datetime-local"
                  value={nieuweDatum}
                  onChange={(e) => setNieuweDatum(e.target.value)}
                  className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-black/50">
                  Toelichting (optioneel)
                </label>
                <input
                  value={notitie}
                  onChange={(e) => setNotitie(e.target.value)}
                  className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => reageer("tegenvoorstel")}
                  disabled={bezig || !nieuweDatum}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
                >
                  {bezig ? "Versturen…" : "Voorstel versturen"}
                </button>
                <button
                  onClick={() => setTegenvoorstelOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {fout && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fout}</p>}
    </div>
  );
}
