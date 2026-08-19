"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Offerte } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  voorgesteld: "Wacht op klant",
  tegenvoorstel: "Klant stelt andere datum voor",
  bevestigd: "Bevestigd",
  afgerond: "Afgerond",
};

const STATUS_KLASSE: Record<string, string> = {
  voorgesteld: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  tegenvoorstel: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  bevestigd: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  afgerond: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

function formatteerDatum(iso: string) {
  return new Date(iso).toLocaleString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PlanningLijst({ initieleOffertes }: { initieleOffertes: Offerte[] }) {
  const router = useRouter();
  const [offertes, setOffertes] = useState(initieleOffertes);
  const [formulierBijId, setFormulierBijId] = useState<string | null>(null);
  const [datum, setDatum] = useState("");
  const [notitie, setNotitie] = useState("");
  const [bezig, setBezig] = useState<string | null>(null);

  function openFormulier(offerte: Offerte) {
    setFormulierBijId(offerte.id);
    setDatum(offerte.planningDatum ? offerte.planningDatum.slice(0, 16) : "");
    setNotitie("");
  }

  async function voorstelVersturen(id: string) {
    if (!datum) return;
    setBezig(id);
    try {
      const response = await fetch(`/api/offertes/${id}/planning`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datum, notitie }),
      });
      if (!response.ok) throw new Error();
      const bijgewerkt = await response.json();
      setOffertes((huidig) => huidig.map((o) => (o.id === id ? bijgewerkt : o)));
      setFormulierBijId(null);
      router.refresh();
    } finally {
      setBezig(null);
    }
  }

  async function tegenvoorstelAccepteren(id: string) {
    setBezig(id);
    try {
      const response = await fetch(`/api/offertes/${id}/planning/bevestigen`, {
        method: "POST",
      });
      if (!response.ok) throw new Error();
      const bijgewerkt = await response.json();
      setOffertes((huidig) => huidig.map((o) => (o.id === id ? bijgewerkt : o)));
      router.refresh();
    } finally {
      setBezig(null);
    }
  }

  async function markeerAfgerond(id: string) {
    setBezig(id);
    try {
      const response = await fetch(`/api/offertes/${id}/planning/afronden`, { method: "POST" });
      if (!response.ok) throw new Error();
      const bijgewerkt = await response.json();
      setOffertes((huidig) => huidig.map((o) => (o.id === id ? bijgewerkt : o)));
      router.refresh();
    } finally {
      setBezig(null);
    }
  }

  if (offertes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-black/15 p-10 text-center text-sm text-black/60 dark:border-white/15 dark:text-white/60">
        Nog geen geaccepteerde offertes om in te plannen.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/10">
      {offertes.map((offerte) => (
        <li key={offerte.id} className="px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium">
                {offerte.klantnaam || "Naamloze klant"}{" "}
                <span className="text-black/40 dark:text-white/40">
                  · {offerte.offerteNummer}
                </span>
              </div>
              {offerte.planningDatum ? (
                <div className="text-sm text-black/60 dark:text-white/60">
                  {formatteerDatum(offerte.planningDatum)}
                </div>
              ) : (
                <div className="text-sm text-black/60 dark:text-white/60">Nog geen voorstel</div>
              )}
              <div className="mt-1 line-clamp-1 text-sm text-black/60 dark:text-white/60">
                {offerte.klusOmschrijving}
              </div>
              {offerte.klantadres && (
                <div className="text-sm text-black/40 dark:text-white/40">
                  📍 {offerte.klantadres}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {offerte.planningStatus && (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    STATUS_KLASSE[offerte.planningStatus]
                  }`}
                >
                  {STATUS_LABEL[offerte.planningStatus]}
                </span>
              )}

              {offerte.planningStatus === "tegenvoorstel" && (
                <button
                  onClick={() => tegenvoorstelAccepteren(offerte.id)}
                  disabled={bezig === offerte.id}
                  className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
                >
                  Accepteren
                </button>
              )}

              {offerte.planningStatus === "bevestigd" && (
                <button
                  onClick={() => markeerAfgerond(offerte.id)}
                  disabled={bezig === offerte.id}
                  className="rounded-md border border-black/15 px-3 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10"
                >
                  Markeer afgerond
                </button>
              )}

              {offerte.planningStatus !== "afgerond" && (
                <button
                  onClick={() => openFormulier(offerte)}
                  className="rounded-md border border-black/15 px-3 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
                >
                  {offerte.planningStatus ? "Nieuw voorstel" : "Datum voorstellen"}
                </button>
              )}
            </div>
          </div>

          {formulierBijId === offerte.id && (
            <div className="mt-4 flex flex-wrap items-end gap-3 rounded-md border border-black/10 p-3 dark:border-white/10">
              <div>
                <label className="mb-1 block text-xs font-medium text-black/50">
                  Datum en tijd
                </label>
                <input
                  type="datetime-local"
                  value={datum}
                  onChange={(e) => setDatum(e.target.value)}
                  className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
                />
              </div>
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-xs font-medium text-black/50">
                  Notitie (optioneel)
                </label>
                <input
                  value={notitie}
                  onChange={(e) => setNotitie(e.target.value)}
                  placeholder="Bijv. tussen 9-12u"
                  className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
                />
              </div>
              <button
                onClick={() => voorstelVersturen(offerte.id)}
                disabled={!datum || bezig === offerte.id}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
              >
                {bezig === offerte.id ? "Versturen…" : "Versturen"}
              </button>
              <button
                onClick={() => setFormulierBijId(null)}
                className="rounded-md px-3 py-2 text-sm font-medium text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10"
              >
                Annuleren
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
