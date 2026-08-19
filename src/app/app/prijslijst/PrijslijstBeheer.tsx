"use client";

import { useState } from "react";
import { PrijslijstItem, RegelType } from "@/lib/types";
import { formatEuro } from "@/lib/format";
import NumberInput from "@/components/NumberInput";

function leegFormulier(): { naam: string; type: RegelType; eenheid: string; prijs: number } {
  return { naam: "", type: "materiaal", eenheid: "stuk", prijs: 0 };
}

export default function PrijslijstBeheer({
  initieleItems,
}: {
  initieleItems: PrijslijstItem[];
}) {
  const [items, setItems] = useState(initieleItems);
  const [nieuw, setNieuw] = useState(leegFormulier());
  const [bezig, setBezig] = useState(false);
  const [formulierVersie, setFormulierVersie] = useState(0);

  async function toevoegen(event: React.FormEvent) {
    event.preventDefault();
    if (!nieuw.naam.trim()) return;
    setBezig(true);
    const response = await fetch("/api/prijslijst", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nieuw),
    });
    const item = await response.json();
    setItems((huidig) => [...huidig, item].sort((a, b) => a.naam.localeCompare(b.naam)));
    setNieuw(leegFormulier());
    setFormulierVersie((v) => v + 1);
    setBezig(false);
  }

  async function verwijderen(id: string) {
    if (!confirm("Dit item verwijderen?")) return;
    await fetch(`/api/prijslijst/${id}`, { method: "DELETE" });
    setItems((huidig) => huidig.filter((i) => i.id !== id));
  }

  return (
    <div>
      <form
        onSubmit={toevoegen}
        className="mb-8 grid grid-cols-2 gap-3 rounded-lg border border-black/10 p-4 sm:grid-cols-5 dark:border-white/10"
      >
        <input
          required
          placeholder="Naam"
          value={nieuw.naam}
          onChange={(e) => setNieuw((h) => ({ ...h, naam: e.target.value }))}
          className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
        />
        <select
          value={nieuw.type}
          onChange={(e) =>
            setNieuw((h) => ({ ...h, type: e.target.value as "materiaal" | "arbeid" }))
          }
          className="rounded-md border border-black/15 bg-transparent px-2 py-2 text-sm dark:border-white/20"
        >
          <option value="materiaal">Materiaal</option>
          <option value="arbeid">Arbeid</option>
        </select>
        <input
          placeholder="Eenheid (bijv. stuk, m2, uur)"
          value={nieuw.eenheid}
          onChange={(e) => setNieuw((h) => ({ ...h, eenheid: e.target.value }))}
          className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
        />
        <NumberInput
          key={formulierVersie}
          step="0.01"
          placeholder="Prijs"
          value={nieuw.prijs}
          onChange={(waarde) => setNieuw((h) => ({ ...h, prijs: waarde }))}
          className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
        />
        <button
          type="submit"
          disabled={bezig}
          className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          + Toevoegen
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          Nog geen items in je prijslijst.
        </p>
      ) : (
        <ul className="divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/10">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <div className="font-medium">{item.naam}</div>
                <div className="text-sm text-black/60 dark:text-white/60">
                  {item.type === "materiaal" ? "Materiaal" : "Arbeid"} · per {item.eenheid}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="text-sm font-medium">{formatEuro(item.prijs)}</span>
                <button
                  onClick={() => verwijderen(item.id)}
                  className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Verwijderen
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
