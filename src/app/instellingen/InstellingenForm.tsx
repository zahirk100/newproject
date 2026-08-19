"use client";

import { useState } from "react";
import { Instellingen } from "@/lib/types";

const VELDEN: { key: keyof Instellingen; label: string; type?: string }[] = [
  { key: "bedrijfsnaam", label: "Bedrijfsnaam" },
  { key: "adres", label: "Adres" },
  { key: "kvkNummer", label: "KvK-nummer" },
  { key: "btwNummer", label: "BTW-nummer" },
  { key: "iban", label: "IBAN" },
  { key: "email", label: "E-mailadres" },
  { key: "telefoon", label: "Telefoonnummer" },
  { key: "standaardUurtarief", label: "Standaard uurtarief (€)", type: "number" },
  { key: "standaardBtwPercentage", label: "Standaard BTW-percentage", type: "number" },
];

export default function InstellingenForm({
  initialInstellingen,
}: {
  initialInstellingen: Instellingen;
}) {
  const [instellingen, setInstellingen] = useState(initialInstellingen);
  const [opslaan, setOpslaan] = useState(false);
  const [opgeslagen, setOpgeslagen] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setOpslaan(true);
    setOpgeslagen(false);
    try {
      const response = await fetch("/api/instellingen", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(instellingen),
      });
      const bijgewerkt = await response.json();
      setInstellingen(bijgewerkt);
      setOpgeslagen(true);
    } finally {
      setOpslaan(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Instellingen</h1>
      <p className="mb-8 text-sm text-black/60 dark:text-white/60">
        Deze gegevens verschijnen op je offertes en worden gebruikt als
        standaardwaarden bij het genereren van nieuwe offertes.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {VELDEN.map((veld) => (
          <div key={veld.key}>
            <label className="mb-1 block text-sm font-medium" htmlFor={veld.key}>
              {veld.label}
            </label>
            <input
              id={veld.key}
              type={veld.type ?? "text"}
              value={instellingen[veld.key]}
              onChange={(e) =>
                setInstellingen((huidig) => ({
                  ...huidig,
                  [veld.key]:
                    veld.type === "number"
                      ? parseFloat(e.target.value) || 0
                      : e.target.value,
                }))
              }
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={opslaan}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          {opslaan ? "Opslaan…" : opgeslagen ? "Opgeslagen ✓" : "Opslaan"}
        </button>
      </form>
    </div>
  );
}
