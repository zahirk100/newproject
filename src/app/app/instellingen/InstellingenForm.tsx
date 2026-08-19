"use client";

import { useEffect, useState } from "react";
import { Instellingen } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import AdresAutocomplete from "@/components/AdresAutocomplete";
import NumberInput from "@/components/NumberInput";

const VELDEN: { key: keyof Instellingen; label: string; type?: string }[] = [
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
  const [logoUploaden, setLogoUploaden] = useState(false);
  const [logoFout, setLogoFout] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [linkGekopieerd, setLinkGekopieerd] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  async function kopieerAanvraagLink() {
    if (!userId) return;
    await navigator.clipboard.writeText(`${window.location.origin}/aanvraag/${userId}`);
    setLinkGekopieerd(true);
    setTimeout(() => setLinkGekopieerd(false), 2000);
  }

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

  async function logoUploaden_(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !userId) return;
    setLogoFout(null);
    setLogoUploaden(true);
    try {
      const supabase = createClient();
      const extensie = file.name.split(".").pop() || "png";
      const pad = `${userId}/logo-${Date.now()}.${extensie}`;
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(pad, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("logos").getPublicUrl(pad);
      setInstellingen((huidig) => ({ ...huidig, logoUrl: publicUrlData.publicUrl }));
      setOpgeslagen(false);
    } catch (error) {
      setLogoFout(error instanceof Error ? error.message : "Uploaden mislukt");
    } finally {
      setLogoUploaden(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Instellingen</h1>
      <p className="mb-8 text-sm text-black/60 dark:text-white/60">
        Deze gegevens verschijnen op je offertes en worden gebruikt als
        standaardwaarden bij het genereren van nieuwe offertes.
      </p>

      <div className="mb-8 rounded-lg border border-black/10 p-5 dark:border-white/10">
        <h2 className="mb-1 text-sm font-semibold">Offertes aanvragen</h2>
        <p className="mb-3 text-sm text-black/60 dark:text-white/60">
          Deel deze link (bijv. op je website of WhatsApp) zodat klanten zelf een offerte kunnen
          aanvragen. Aanvragen komen binnen in je dashboard.
        </p>
        <button
          type="button"
          onClick={kopieerAanvraagLink}
          disabled={!userId}
          className="rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10"
        >
          {linkGekopieerd ? "Gekopieerd ✓" : "Kopieer aanvraaglink"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-lg border border-black/10 p-5 dark:border-white/10">
          <h2 className="mb-4 text-sm font-semibold">Huisstijl</h2>
          <div className="flex items-center gap-6">
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-black/50">
                Logo
              </div>
              <div className="flex items-center gap-3">
                {instellingen.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={instellingen.logoUrl}
                    alt="Logo"
                    className="h-12 w-12 rounded object-contain"
                  />
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded text-white"
                    style={{ backgroundColor: instellingen.merkkleur }}
                  >
                    {instellingen.bedrijfsnaam.charAt(0).toUpperCase() || "O"}
                  </div>
                )}
                <label className="cursor-pointer rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10">
                  {logoUploaden ? "Uploaden…" : "Logo uploaden"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={logoUploaden_}
                    disabled={logoUploaden || !userId}
                    className="hidden"
                  />
                </label>
              </div>
              {logoFout && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{logoFout}</p>}
            </div>
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-black/50">
                Merkkleur
              </div>
              <input
                type="color"
                value={instellingen.merkkleur}
                onChange={(e) =>
                  setInstellingen((huidig) => ({ ...huidig, merkkleur: e.target.value }))
                }
                className="h-9 w-16 cursor-pointer rounded border border-black/15 bg-transparent dark:border-white/20"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="bedrijfsnaam">
              Bedrijfsnaam
            </label>
            <input
              id="bedrijfsnaam"
              value={instellingen.bedrijfsnaam}
              onChange={(e) =>
                setInstellingen((huidig) => ({ ...huidig, bedrijfsnaam: e.target.value }))
              }
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="adres">
              Adres
            </label>
            <AdresAutocomplete
              id="adres"
              value={instellingen.adres}
              onChange={(waarde) => setInstellingen((huidig) => ({ ...huidig, adres: waarde }))}
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
            />
          </div>
          {VELDEN.map((veld) =>
            veld.type === "number" ? (
              <div key={veld.key}>
                <label className="mb-1 block text-sm font-medium" htmlFor={veld.key}>
                  {veld.label}
                </label>
                <NumberInput
                  id={veld.key}
                  value={instellingen[veld.key] as number}
                  onChange={(waarde) =>
                    setInstellingen((huidig) => ({ ...huidig, [veld.key]: waarde }))
                  }
                  className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
                />
              </div>
            ) : (
              <div key={veld.key}>
                <label className="mb-1 block text-sm font-medium" htmlFor={veld.key}>
                  {veld.label}
                </label>
                <input
                  id={veld.key}
                  value={instellingen[veld.key] as string}
                  onChange={(e) =>
                    setInstellingen((huidig) => ({ ...huidig, [veld.key]: e.target.value }))
                  }
                  className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
                />
              </div>
            )
          )}
        </div>

        <div className="rounded-lg border border-black/10 p-5 dark:border-white/10">
          <h2 className="mb-4 text-sm font-semibold">Facturatie &amp; voorrijkosten</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="betalingstermijnDagen">
                Betalingstermijn (dagen)
              </label>
              <NumberInput
                id="betalingstermijnDagen"
                value={instellingen.betalingstermijnDagen}
                onChange={(waarde) =>
                  setInstellingen((huidig) => ({ ...huidig, betalingstermijnDagen: waarde }))
                }
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
              />
              <p className="mt-1 text-xs text-black/50 dark:text-white/50">
                Bepaalt automatisch de vervaldatum van elke factuur.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="voorrijkostenPerKm">
                Voorrijkosten (€/km)
              </label>
              <NumberInput
                id="voorrijkostenPerKm"
                step="0.01"
                value={instellingen.voorrijkostenPerKm}
                onChange={(waarde) =>
                  setInstellingen((huidig) => ({ ...huidig, voorrijkostenPerKm: waarde }))
                }
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
              />
              <p className="mt-1 text-xs text-black/50 dark:text-white/50">
                0 = geen automatische voorrijkosten.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="voorrijkostenGratisTotKm">
                Gratis tot (km)
              </label>
              <NumberInput
                id="voorrijkostenGratisTotKm"
                step="0.1"
                value={instellingen.voorrijkostenGratisTotKm}
                onChange={(waarde) =>
                  setInstellingen((huidig) => ({ ...huidig, voorrijkostenGratisTotKm: waarde }))
                }
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-black/50 dark:text-white/50">
            Bij een ingevuld klantadres wordt automatisch een voorrijkosten-regel toegevoegd op
            basis van de (hemelsbrede) afstand tot je bedrijfsadres.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="extraInstructies">
            Standaardinstructies voor de AI
          </label>
          <p className="mb-2 text-xs text-black/50 dark:text-white/50">
            Dingen die de AI altijd moet meenemen bij het opstellen van een offerte: vaste
            voorwaarden, merken/materialen die je gebruikt, garantietermijn, geldigheidsduur,
            enz. Hoe specifieker, hoe minder de AI zelf hoeft te gokken.
          </p>
          <textarea
            id="extraInstructies"
            rows={4}
            value={instellingen.extraInstructies}
            onChange={(e) =>
              setInstellingen((huidig) => ({ ...huidig, extraInstructies: e.target.value }))
            }
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
            placeholder="Bijv. Wij geven altijd 2 jaar garantie op arbeid. Voor cv-ketels gebruiken wij standaard Intergas. Offertes zijn 30 dagen geldig. Voeg bij loodgieterswerk altijd een aparte regel 'afvoerkosten oud materiaal' toe."
          />
        </div>

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
