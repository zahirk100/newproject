"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Offerte } from "@/lib/types";

export default function AanvragenInbox({ aanvragen: initieleAanvragen }: { aanvragen: Offerte[] }) {
  const router = useRouter();
  const [aanvragen, setAanvragen] = useState(initieleAanvragen);
  const [bezigId, setBezigId] = useState<string | null>(null);

  async function zetOmInOfferte(id: string) {
    setBezigId(id);
    try {
      const response = await fetch(`/api/offertes/${id}/genereer`, { method: "POST" });
      if (!response.ok) throw new Error();
      router.push(`/app/offertes/${id}`);
    } finally {
      setBezigId(null);
    }
  }

  async function negeren(id: string) {
    if (!confirm("Deze aanvraag verwijderen? De klant wordt hier niet over gemaild.")) return;
    setBezigId(id);
    try {
      const response = await fetch(`/api/offertes/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setAanvragen((huidig) => huidig.filter((a) => a.id !== id));
      router.refresh();
    } finally {
      setBezigId(null);
    }
  }

  if (aanvragen.length === 0) return null;

  return (
    <ul className="divide-y divide-black/10 rounded-lg border border-purple-200 bg-purple-50/50 dark:divide-white/10 dark:border-purple-900 dark:bg-purple-950/20">
      {aanvragen.map((aanvraag) => (
        <li key={aanvraag.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <div className="font-medium">{aanvraag.klantnaam || "Naamloze aanvraag"}</div>
            <div className="line-clamp-2 whitespace-pre-line text-sm text-black/60 dark:text-white/60">
              {aanvraag.klusOmschrijving}
            </div>
            {aanvraag.fotoUrls.length > 0 && (
              <div className="mt-1 flex gap-1">
                {aanvraag.fotoUrls.slice(0, 4).map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="h-10 w-10 rounded object-cover"
                  />
                ))}
                {aanvraag.fotoUrls.length > 4 && (
                  <span className="flex h-10 w-10 items-center justify-center rounded bg-black/5 text-xs text-black/50 dark:bg-white/10 dark:text-white/50">
                    +{aanvraag.fotoUrls.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => negeren(aanvraag.id)}
              disabled={bezigId === aanvraag.id}
              className="rounded-md px-3 py-2 text-sm font-medium text-black/50 hover:bg-black/5 disabled:opacity-50 dark:text-white/50 dark:hover:bg-white/10"
            >
              Verwijderen
            </button>
            <button
              onClick={() => zetOmInOfferte(aanvraag.id)}
              disabled={bezigId === aanvraag.id}
              className="shrink-0 rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
            >
              {bezigId === aanvraag.id ? "Bezig…" : "Zet om in AI-offerte"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
