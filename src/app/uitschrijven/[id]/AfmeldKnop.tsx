"use client";

import { useState } from "react";

export default function AfmeldKnop({ leadId }: { leadId: string }) {
  const [bezig, setBezig] = useState(false);
  const [klaar, setKlaar] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function afmelden() {
    setBezig(true);
    setFout(null);
    try {
      const response = await fetch(`/api/uitschrijven/${leadId}`, { method: "POST" });
      if (!response.ok) throw new Error();
      setKlaar(true);
    } catch {
      setFout("Afmelden is mislukt. Probeer het later opnieuw.");
    } finally {
      setBezig(false);
    }
  }

  if (klaar) {
    return (
      <p className="text-sm text-green-700 dark:text-green-400">
        Je bent afgemeld. Je ontvangt geen berichten meer.
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={afmelden}
        disabled={bezig}
        className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
      >
        {bezig ? "Bezig…" : "Ja, meld me af"}
      </button>
      {fout && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fout}</p>}
    </div>
  );
}
