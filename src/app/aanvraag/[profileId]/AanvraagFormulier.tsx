"use client";

import { useEffect, useState } from "react";
import AdresAutocomplete from "@/components/AdresAutocomplete";
import { createClient } from "@/lib/supabase/client";

const MAX_FOTOS = 6;

interface FotoMetFoto {
  file: File;
  previewUrl: string;
}

export default function AanvraagFormulier({ profileId }: { profileId: string }) {
  const [stap, setStap] = useState<1 | 2>(1);
  const [naam, setNaam] = useState("");
  const [adres, setAdres] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [klusOmschrijving, setKlusOmschrijving] = useState("");
  const [vragen, setVragen] = useState<string[]>([]);
  const [antwoorden, setAntwoorden] = useState<Record<number, string>>({});
  const [vragenLaden, setVragenLaden] = useState(false);
  const [fotos, setFotos] = useState<FotoMetFoto[]>([]);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [verzonden, setVerzonden] = useState(false);

  useEffect(() => {
    return () => {
      fotos.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function volgende(event: React.FormEvent) {
    event.preventDefault();
    setFout(null);
    setVragenLaden(true);
    try {
      const response = await fetch("/api/aanvraag/vragen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, klusOmschrijving }),
      });
      const data = await response.json().catch(() => ({}));
      setVragen(response.ok && Array.isArray(data.vragen) ? data.vragen : []);
    } catch {
      setVragen([]);
    } finally {
      setVragenLaden(false);
      setStap(2);
    }
  }

  function voegFotosToe(bestanden: FileList | null) {
    if (!bestanden) return;
    const nieuw = Array.from(bestanden)
      .slice(0, MAX_FOTOS - fotos.length)
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setFotos((huidig) => [...huidig, ...nieuw]);
  }

  function verwijderFoto(index: number) {
    setFotos((huidig) => {
      URL.revokeObjectURL(huidig[index].previewUrl);
      return huidig.filter((_, i) => i !== index);
    });
  }

  async function versturen(event: React.FormEvent) {
    event.preventDefault();
    setFout(null);
    setBezig(true);
    try {
      let fotoUrls: string[] = [];
      if (fotos.length) {
        const supabase = createClient();
        fotoUrls = await Promise.all(
          fotos.map(async ({ file }, index) => {
            const extensie = file.name.split(".").pop() || "jpg";
            const pad = `${profileId}/${Date.now()}-${index}.${extensie}`;
            const { error } = await supabase.storage.from("aanvraag-fotos").upload(pad, file);
            if (error) throw new Error(`Uploaden van foto mislukt: ${error.message}`);
            return supabase.storage.from("aanvraag-fotos").getPublicUrl(pad).data.publicUrl;
          })
        );
      }

      const antwoordenPayload = vragen.map((vraag, index) => ({
        vraag,
        antwoord: antwoorden[index] || "",
      }));

      const response = await fetch("/api/aanvraag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          naam,
          adres,
          email,
          telefoon,
          klusOmschrijving,
          antwoorden: antwoordenPayload,
          fotoUrls,
        }),
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

  if (stap === 1) {
    return (
      <form onSubmit={volgende} className="space-y-4">
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
          disabled={vragenLaden}
          className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          {vragenLaden ? "Even checken…" : "Volgende"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={versturen} className="space-y-5">
      {vragen.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-black/60 dark:text-white/60">
            Nog een paar korte vragen zodat we direct een goede offerte kunnen maken:
          </p>
          {vragen.map((vraag, index) => (
            <div key={index}>
              <label className="mb-1 block text-sm font-medium">{vraag}</label>
              <input
                value={antwoorden[index] || ""}
                onChange={(e) =>
                  setAntwoorden((huidig) => ({ ...huidig, [index]: e.target.value }))
                }
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
              />
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Foto&apos;s (optioneel)</label>
        <p className="mb-2 text-xs text-black/50 dark:text-white/50">
          Een paar foto&apos;s van de situatie helpen ons om een nauwkeurigere offerte te maken.
          Max. {MAX_FOTOS} foto&apos;s.
        </p>
        {fotos.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {fotos.map((foto, index) => (
              <div key={index} className="group relative aspect-square overflow-hidden rounded-md border border-black/10 dark:border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto.previewUrl} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => verwijderFoto(index)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs text-white"
                  aria-label="Foto verwijderen"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {fotos.length < MAX_FOTOS && (
          <label className="inline-block cursor-pointer rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10">
            Foto&apos;s toevoegen
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => voegFotosToe(e.target.files)}
              className="hidden"
            />
          </label>
        )}
      </div>

      {fout && <p className="text-sm text-red-600 dark:text-red-400">{fout}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStap(1)}
          disabled={bezig}
          className="rounded-md px-3 py-2 text-sm font-medium text-black/50 hover:bg-black/5 disabled:opacity-50 dark:text-white/50 dark:hover:bg-white/10"
        >
          Terug
        </button>
        <button
          type="submit"
          disabled={bezig}
          className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          {bezig ? "Versturen…" : "Aanvraag versturen"}
        </button>
      </div>
    </form>
  );
}
