"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Klant } from "@/lib/types";
import AdresAutocomplete from "@/components/AdresAutocomplete";

export default function NieuweOffertePage() {
  const router = useRouter();
  const [klanten, setKlanten] = useState<Klant[]>([]);
  const [klantId, setKlantId] = useState<string>("__nieuw__");
  const [klantnaam, setKlantnaam] = useState("");
  const [klantadres, setKlantadres] = useState("");
  const [klantEmail, setKlantEmail] = useState("");
  const [klusOmschrijving, setKlusOmschrijving] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/klanten")
      .then((r) => r.json())
      .then((data) => setKlanten(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  function kiesKlant(id: string) {
    setKlantId(id);
    if (id === "__nieuw__") {
      setKlantnaam("");
      setKlantadres("");
      setKlantEmail("");
      return;
    }
    const klant = klanten.find((k) => k.id === id);
    if (klant) {
      setKlantnaam(klant.naam);
      setKlantadres(klant.adres);
      setKlantEmail(klant.email);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFout(null);
    setBezig(true);
    try {
      const response = await fetch("/api/offertes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          klantId: klantId === "__nieuw__" ? null : klantId,
          klantnaam,
          klantadres,
          klantEmail,
          klusOmschrijving,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Genereren van offerte is mislukt");
      }
      const offerte = await response.json();
      router.push(`/app/offertes/${offerte.id}`);
    } catch (error) {
      setFout(error instanceof Error ? error.message : "Onbekende fout");
      setBezig(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Nieuwe offerte</h1>
      <p className="mb-8 text-sm text-black/60 dark:text-white/60">
        Beschrijf de klus in gewone taal. De AI stelt op basis daarvan een
        offerteconcept op met materiaal- en arbeidsregels, die je hierna kunt
        bewerken.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="klant">
            Klant
          </label>
          <select
            id="klant"
            value={klantId}
            onChange={(e) => kiesKlant(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          >
            <option value="__nieuw__">+ Nieuwe klant (niet opslaan)</option>
            {klanten.map((klant) => (
              <option key={klant.id} value={klant.id}>
                {klant.naam}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="klantnaam">
              Klantnaam
            </label>
            <input
              id="klantnaam"
              value={klantnaam}
              onChange={(e) => setKlantnaam(e.target.value)}
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
              placeholder="Bijv. Fam. Jansen"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="klantadres">
              Adres
            </label>
            <AdresAutocomplete
              id="klantadres"
              value={klantadres}
              onChange={setKlantadres}
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
              placeholder="Straat, postcode, plaats"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="klantEmail">
            E-mailadres klant (voor versturen offerte)
          </label>
          <input
            id="klantEmail"
            type="email"
            value={klantEmail}
            onChange={(e) => setKlantEmail(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
            placeholder="klant@voorbeeld.nl"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="klus">
            Klusomschrijving
          </label>
          <textarea
            id="klus"
            required
            value={klusOmschrijving}
            onChange={(e) => setKlusOmschrijving(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
            placeholder="Bijv. Nieuwe cv-ketel plaatsen in bestaande meterkast, incl. aansluiten op bestaande leidingen en afvoer."
          />
        </div>

        {fout && <p className="text-sm text-red-600 dark:text-red-400">{fout}</p>}

        <button
          type="submit"
          disabled={bezig}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          {bezig ? "Offerte wordt gegenereerd…" : "Genereer offerte"}
        </button>
      </form>
    </div>
  );
}
