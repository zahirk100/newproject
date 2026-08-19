"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Offerte } from "@/lib/types";

export default function AanvraagDetail({ aanvraag }: { aanvraag: Offerte }) {
  const router = useRouter();
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function zetOmInOfferte() {
    setBezig(true);
    setFout(null);
    try {
      const response = await fetch(`/api/offertes/${aanvraag.id}/genereer`, { method: "POST" });
      if (!response.ok) throw new Error();
      router.push(`/app/offertes/${aanvraag.id}`);
    } catch {
      setFout("Genereren van offerte is mislukt. Probeer het opnieuw.");
      setBezig(false);
    }
  }

  async function verwijderen() {
    if (!confirm("Deze aanvraag verwijderen? De klant wordt hier niet over gemaild.")) return;
    setBezig(true);
    setFout(null);
    try {
      const response = await fetch(`/api/offertes/${aanvraag.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      router.push("/app");
      router.refresh();
    } catch {
      setFout("Verwijderen is mislukt. Probeer het opnieuw.");
      setBezig(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/app"
        className="mb-6 inline-block text-sm font-medium text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
      >
        ← Terug naar dashboard
      </Link>

      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
          Aanvraag
        </span>
      </div>
      <h1 className="mb-6 text-2xl font-semibold">{aanvraag.klantnaam || "Naamloze aanvraag"}</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-black/10 p-5 text-sm sm:grid-cols-2 dark:border-white/10">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-black/50">Adres</div>
          <div>{aanvraag.klantadres || "—"}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-black/50">
            E-mailadres
          </div>
          <div>{aanvraag.klantEmail || "—"}</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-black/50">
          Klusomschrijving
        </div>
        <p className="whitespace-pre-line text-sm text-black/80 dark:text-white/80">
          {aanvraag.klusOmschrijving}
        </p>
      </div>

      {aanvraag.fotoUrls.length > 0 && (
        <div className="mb-8">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-black/50">
            Foto&apos;s van de klant
          </div>
          <div className="flex flex-wrap gap-2">
            {aanvraag.fotoUrls.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-28 w-28 rounded-md border border-black/10 object-cover dark:border-white/10"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {fout && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{fout}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={zetOmInOfferte}
          disabled={bezig}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          {bezig ? "Bezig…" : "Zet om in AI-offerte"}
        </button>
        <button
          onClick={verwijderen}
          disabled={bezig}
          className="rounded-md px-3 py-2 text-sm font-medium text-black/50 hover:bg-black/5 disabled:opacity-50 dark:text-white/50 dark:hover:bg-white/10"
        >
          Verwijderen
        </button>
      </div>
    </div>
  );
}
