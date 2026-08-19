"use client";

import { useState } from "react";
import AdresAutocomplete from "@/components/AdresAutocomplete";

export default function AanvraagFormulier({ profileId }: { profileId: string }) {
  const [naam, setNaam] = useState("");
  const [adres, setAdres] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [klusOmschrijving, setKlusOmschrijving] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [verzonden, setVerzonden] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFout(null);
    setBezig(true);
    try {
      const response = await fetch("/api/aanvraag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, naam, adres, email, telefoon, klusOmschrijving }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Versturen van je aanvraag is mislukt");
      }
      setVerzonden(true);
    } catch (error) {
      setFout(error instanceof Error ? error.message : "Onbekende fout");
    } finally {
      setBezig(false);
    }
  }

  if (verzonden) {
    return (
      <div className="rounded-md border border-black/10 bg-neutral-50 p-4 text-sm dark:border-white/10 dark:bg-neutral-800">
        Bedankt! Je aanvraag is verstuurd. Je ontvangt binnenkort een offerte per e-mail.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="naam">
          Naam
        </label>
        <input
          id="naam"
          required
          value={naam}
          onChange={(e) => setNaam(e.target.value)}
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="adres">
          Adres
        </label>
        <AdresAutocomplete
          id="adres"
          value={adres}
          onChange={setAdres}
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="email">
            E-mailadres
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="telefoon">
            Telefoonnummer
          </label>
          <input
            id="telefoon"
            value={telefoon}
            onChange={(e) => setTelefoon(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="klus">
          Omschrijf de klus
        </label>
        <textarea
          id="klus"
          required
          rows={5}
          value={klusOmschrijving}
          onChange={(e) => setKlusOmschrijving(e.target.value)}
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          placeholder="Wat wil je gedaan hebben?"
        />
      </div>
      {fout && <p className="text-sm text-red-600 dark:text-red-400">{fout}</p>}
      <button
        type="submit"
        disabled={bezig}
        className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
      >
        {bezig ? "Versturen…" : "Aanvraag versturen"}
      </button>
    </form>
  );
}
