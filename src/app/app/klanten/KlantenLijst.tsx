"use client";

import { useState } from "react";
import { Klant } from "@/lib/types";

function leegFormulier() {
  return { naam: "", adres: "", email: "", telefoon: "" };
}

export default function KlantenLijst({ initialeKlanten }: { initialeKlanten: Klant[] }) {
  const [klanten, setKlanten] = useState(initialeKlanten);
  const [nieuw, setNieuw] = useState(leegFormulier());
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [bewerkForm, setBewerkForm] = useState(leegFormulier());
  const [bezig, setBezig] = useState(false);

  async function toevoegen(event: React.FormEvent) {
    event.preventDefault();
    if (!nieuw.naam.trim()) return;
    setBezig(true);
    const response = await fetch("/api/klanten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nieuw),
    });
    const klant = await response.json();
    setKlanten((huidig) => [...huidig, klant].sort((a, b) => a.naam.localeCompare(b.naam)));
    setNieuw(leegFormulier());
    setBezig(false);
  }

  function startBewerken(klant: Klant) {
    setBewerkId(klant.id);
    setBewerkForm({
      naam: klant.naam,
      adres: klant.adres,
      email: klant.email,
      telefoon: klant.telefoon,
    });
  }

  async function opslaanBewerking(id: string) {
    const response = await fetch(`/api/klanten/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bewerkForm),
    });
    const klant = await response.json();
    setKlanten((huidig) => huidig.map((k) => (k.id === id ? klant : k)));
    setBewerkId(null);
  }

  async function verwijderen(id: string) {
    if (!confirm("Deze klant verwijderen?")) return;
    await fetch(`/api/klanten/${id}`, { method: "DELETE" });
    setKlanten((huidig) => huidig.filter((k) => k.id !== id));
  }

  return (
    <div>
      <form
        onSubmit={toevoegen}
        className="mb-8 grid grid-cols-2 gap-3 rounded-lg border border-black/10 p-4 sm:grid-cols-4 dark:border-white/10"
      >
        <input
          required
          placeholder="Naam"
          value={nieuw.naam}
          onChange={(e) => setNieuw((h) => ({ ...h, naam: e.target.value }))}
          className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
        />
        <input
          placeholder="Adres"
          value={nieuw.adres}
          onChange={(e) => setNieuw((h) => ({ ...h, adres: e.target.value }))}
          className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
        />
        <input
          placeholder="E-mail"
          type="email"
          value={nieuw.email}
          onChange={(e) => setNieuw((h) => ({ ...h, email: e.target.value }))}
          className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
        />
        <div className="flex gap-2">
          <input
            placeholder="Telefoon"
            value={nieuw.telefoon}
            onChange={(e) => setNieuw((h) => ({ ...h, telefoon: e.target.value }))}
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
          <button
            type="submit"
            disabled={bezig}
            className="shrink-0 rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            + Toevoegen
          </button>
        </div>
      </form>

      {klanten.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">Nog geen klanten toegevoegd.</p>
      ) : (
        <ul className="divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/10">
          {klanten.map((klant) =>
            bewerkId === klant.id ? (
              <li key={klant.id} className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-4">
                <input
                  value={bewerkForm.naam}
                  onChange={(e) => setBewerkForm((h) => ({ ...h, naam: e.target.value }))}
                  className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
                />
                <input
                  value={bewerkForm.adres}
                  onChange={(e) => setBewerkForm((h) => ({ ...h, adres: e.target.value }))}
                  className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
                />
                <input
                  value={bewerkForm.email}
                  onChange={(e) => setBewerkForm((h) => ({ ...h, email: e.target.value }))}
                  className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
                />
                <div className="flex gap-2">
                  <input
                    value={bewerkForm.telefoon}
                    onChange={(e) => setBewerkForm((h) => ({ ...h, telefoon: e.target.value }))}
                    className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
                  />
                  <button
                    onClick={() => opslaanBewerking(klant.id)}
                    className="shrink-0 rounded-md bg-black px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
                  >
                    Opslaan
                  </button>
                </div>
              </li>
            ) : (
              <li
                key={klant.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <div className="font-medium">{klant.naam}</div>
                  <div className="text-sm text-black/60 dark:text-white/60">
                    {[klant.adres, klant.email, klant.telefoon].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div className="flex shrink-0 gap-4 text-sm">
                  <button
                    onClick={() => startBewerken(klant)}
                    className="font-medium text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
                  >
                    Bewerken
                  </button>
                  <button
                    onClick={() => verwijderen(klant.id)}
                    className="font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Verwijderen
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
