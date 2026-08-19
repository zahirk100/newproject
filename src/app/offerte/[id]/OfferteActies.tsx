"use client";

import { useState } from "react";
import { OfferteStatus } from "@/lib/types";

const STATUS_MELDING: Partial<Record<OfferteStatus, string>> = {
  geaccepteerd: "Je hebt deze offerte goedgekeurd. Bedankt! De factuur volgt per e-mail.",
  afgewezen: "Je hebt deze offerte afgewezen.",
};

export default function OfferteActies({
  offerteId,
  status,
}: {
  offerteId: string;
  status: OfferteStatus;
}) {
  const [huidigeStatus, setHuidigeStatus] = useState(status);
  const [bezig, setBezig] = useState<"geaccepteerd" | "afgewezen" | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  async function reageer(actie: "geaccepteerd" | "afgewezen") {
    setBezig(actie);
    setFout(null);
    try {
      const response = await fetch(`/api/offerte/${offerteId}/reageer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actie }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Versturen van je reactie is mislukt");
      }
      setHuidigeStatus(actie);
    } catch (error) {
      setFout(error instanceof Error ? error.message : "Onbekende fout");
    } finally {
      setBezig(null);
    }
  }

  if (huidigeStatus === "geaccepteerd" || huidigeStatus === "afgewezen") {
    return (
      <div className="rounded-md border border-black/10 bg-neutral-50 p-4 text-sm dark:border-white/10 dark:bg-neutral-800">
        {STATUS_MELDING[huidigeStatus]}
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-3">
        <button
          onClick={() => reageer("geaccepteerd")}
          disabled={bezig !== null}
          className="flex-1 rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {bezig === "geaccepteerd" ? "Bezig…" : "✓ Offerte goedkeuren"}
        </button>
        <button
          onClick={() => reageer("afgewezen")}
          disabled={bezig !== null}
          className="flex-1 rounded-md border border-black/15 px-4 py-3 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10"
        >
          {bezig === "afgewezen" ? "Bezig…" : "✕ Afwijzen"}
        </button>
      </div>
      {fout && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{fout}</p>}
    </div>
  );
}
