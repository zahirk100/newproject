"use client";

import { useState } from "react";
import { Factuur } from "@/lib/types";
import { berekenTotalen, formatEuro } from "@/lib/format";

export default function FacturenLijst({ initieleFacturen }: { initieleFacturen: Factuur[] }) {
  const [facturen, setFacturen] = useState(initieleFacturen);

  async function markeerAlsBetaald(id: string) {
    const response = await fetch(`/api/facturen/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "betaald" }),
    });
    const bijgewerkt = await response.json();
    setFacturen((huidig) => huidig.map((f) => (f.id === id ? bijgewerkt : f)));
  }

  if (facturen.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-black/15 p-10 text-center text-sm text-black/60 dark:border-white/15 dark:text-white/60">
        Nog geen facturen. Zodra een klant een offerte goedkeurt, verschijnt de factuur hier.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/10">
      {facturen.map((factuur) => {
        const { totaal } = berekenTotalen(factuur.regels, factuur.btwPercentage);
        return (
          <li key={factuur.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <div className="font-medium">
                {factuur.klantnaam || "Naamloze klant"}{" "}
                <span className="text-black/40 dark:text-white/40">
                  · {factuur.factuurNummer}
                </span>
              </div>
              <div className="text-sm text-black/60 dark:text-white/60">
                Vervaldatum {new Date(factuur.vervaldatum).toLocaleDateString("nl-NL")}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  factuur.status === "betaald"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                }`}
              >
                {factuur.status === "betaald" ? "Betaald" : "Open"}
              </span>
              <span className="w-24 text-right text-sm font-medium">{formatEuro(totaal)}</span>
              {factuur.status === "open" && (
                <button
                  onClick={() => markeerAlsBetaald(factuur.id)}
                  className="text-sm font-medium text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
                >
                  Markeer betaald
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
