"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Instellingen,
  Offerte,
  OfferteRegel,
  OfferteStatus,
  RegelType,
} from "@/lib/types";
import { berekenTotalen, formatEuro, regelTotaal } from "@/lib/format";
import AdresAutocomplete from "@/components/AdresAutocomplete";
import NumberInput from "@/components/NumberInput";

const STATUS_OPTIES: { waarde: OfferteStatus; label: string }[] = [
  { waarde: "aanvraag", label: "Aanvraag" },
  { waarde: "concept", label: "Concept" },
  { waarde: "verzonden", label: "Verzonden" },
  { waarde: "geaccepteerd", label: "Geaccepteerd" },
  { waarde: "afgewezen", label: "Afgewezen" },
];

function nieuweRegel(): OfferteRegel {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    omschrijving: "",
    type: "materiaal",
    aantal: 1,
    eenheid: "stuk",
    prijsPerEenheid: 0,
  };
}

export default function OfferteEditor({
  initialOfferte,
  instellingen,
}: {
  initialOfferte: Offerte;
  instellingen: Instellingen;
}) {
  const router = useRouter();
  const [offerte, setOfferte] = useState<Offerte>(initialOfferte);
  const [opslaan, setOpslaan] = useState(false);
  const [verwijderen, setVerwijderen] = useState(false);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [versturen, setVersturen] = useState(false);
  const [verstuurFout, setVerstuurFout] = useState<string | null>(null);
  const [verstuurd, setVerstuurd] = useState(false);
  const [linkGekopieerd, setLinkGekopieerd] = useState(false);

  const { subtotaal, btwBedrag, totaal } = berekenTotalen(
    offerte.regels,
    offerte.btwPercentage
  );

  function updateVeld<K extends keyof Offerte>(veld: K, waarde: Offerte[K]) {
    setOfferte((huidig) => ({ ...huidig, [veld]: waarde }));
    setOpgeslagen(false);
  }

  function updateRegel(id: string, wijziging: Partial<OfferteRegel>) {
    setOfferte((huidig) => ({
      ...huidig,
      regels: huidig.regels.map((regel) =>
        regel.id === id ? { ...regel, ...wijziging } : regel
      ),
    }));
    setOpgeslagen(false);
  }

  function verwijderRegel(id: string) {
    setOfferte((huidig) => ({
      ...huidig,
      regels: huidig.regels.filter((regel) => regel.id !== id),
    }));
    setOpgeslagen(false);
  }

  function voegRegelToe() {
    setOfferte((huidig) => ({
      ...huidig,
      regels: [...huidig.regels, nieuweRegel()],
    }));
    setOpgeslagen(false);
  }

  async function opslaanOfferte() {
    setOpslaan(true);
    try {
      const response = await fetch(`/api/offertes/${offerte.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerte),
      });
      const bijgewerkt = await response.json();
      setOfferte(bijgewerkt);
      setOpgeslagen(true);
    } finally {
      setOpslaan(false);
    }
  }

  async function verwijderOfferte() {
    if (!confirm("Deze offerte definitief verwijderen?")) return;
    setVerwijderen(true);
    await fetch(`/api/offertes/${offerte.id}`, { method: "DELETE" });
    router.push("/app");
  }

  async function verstuurPerEmail() {
    if (!offerte.klantEmail?.trim()) {
      setVerstuurFout("Vul eerst een e-mailadres van de klant in.");
      return;
    }
    setVersturen(true);
    setVerstuurFout(null);
    try {
      await opslaanOfferte();
      const response = await fetch(`/api/offertes/${offerte.id}/verstuur`, { method: "POST" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Versturen mislukt");
      }
      const bijgewerkt = await response.json();
      setOfferte(bijgewerkt);
      setVerstuurd(true);
    } catch (error) {
      setVerstuurFout(error instanceof Error ? error.message : "Versturen mislukt");
    } finally {
      setVersturen(false);
    }
  }

  async function kopieerKlantLink() {
    const url = `${window.location.origin}/offerte/${offerte.id}`;
    await navigator.clipboard.writeText(url);
    setLinkGekopieerd(true);
    setTimeout(() => setLinkGekopieerd(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 print:max-w-none print:px-0 print:py-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">{offerte.offerteNummer}</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            Aangemaakt {new Date(offerte.createdAt).toLocaleDateString("nl-NL")}
          </p>
          <button
            onClick={kopieerKlantLink}
            className="mt-1 text-xs font-medium text-black/50 underline hover:text-black dark:text-white/50 dark:hover:text-white"
          >
            {linkGekopieerd ? "Klantlink gekopieerd ✓" : "Kopieer klantlink"}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={offerte.status}
            onChange={(e) =>
              updateVeld("status", e.target.value as OfferteStatus)
            }
            className="rounded-md border border-black/15 bg-transparent px-2 py-2 text-sm dark:border-white/20"
          >
            {STATUS_OPTIES.map((optie) => (
              <option key={optie.waarde} value={optie.waarde}>
                {optie.label}
              </option>
            ))}
          </select>
          <button
            onClick={opslaanOfferte}
            disabled={opslaan}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            {opslaan ? "Opslaan…" : opgeslagen ? "Opgeslagen ✓" : "Opslaan"}
          </button>
          <a
            href={`/api/offertes/${offerte.id}/pdf`}
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Download PDF
          </a>
          <button
            onClick={() => window.print()}
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Print
          </button>
          <button
            onClick={verstuurPerEmail}
            disabled={versturen}
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10"
          >
            {versturen ? "Versturen…" : verstuurd ? "Verzonden ✓" : "Verstuur per e-mail"}
          </button>
          <button
            onClick={verwijderOfferte}
            disabled={verwijderen}
            className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            Verwijderen
          </button>
        </div>
      </div>

      {/* Briefhoofd, ook zichtbaar bij printen */}
      <div className="mb-8 flex items-start justify-between border-b border-black/10 pb-6 dark:border-white/10 print:border-black">
        <div>
          {instellingen.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={instellingen.logoUrl} alt="" className="mb-2 h-8 w-auto object-contain" />
          )}
          <div className="text-lg font-semibold">{instellingen.bedrijfsnaam}</div>
          <div className="whitespace-pre-line text-sm text-black/60 dark:text-white/60 print:text-black">
            {instellingen.adres}
          </div>
          {instellingen.kvkNummer && (
            <div className="text-sm text-black/60 dark:text-white/60 print:text-black">
              KvK {instellingen.kvkNummer}
              {instellingen.btwNummer ? ` · BTW ${instellingen.btwNummer}` : ""}
            </div>
          )}
        </div>
        <div className="text-right text-sm">
          <div className="font-medium">Offerte {offerte.offerteNummer}</div>
          <div className="text-black/60 dark:text-white/60 print:text-black">
            {new Date(offerte.createdAt).toLocaleDateString("nl-NL")}
          </div>
        </div>
      </div>

      {/* Klantgegevens */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-black/50 print:hidden">
            Klantnaam
          </label>
          <input
            value={offerte.klantnaam}
            onChange={(e) => updateVeld("klantnaam", e.target.value)}
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm print:border-none print:p-0 print:font-medium dark:border-white/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-black/50 print:hidden">
            Adres
          </label>
          <AdresAutocomplete
            value={offerte.klantadres}
            onChange={(waarde) => updateVeld("klantadres", waarde)}
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm print:border-none print:p-0 dark:border-white/20"
          />
        </div>
        <div className="print:hidden">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-black/50">
            E-mailadres klant
          </label>
          <input
            type="email"
            value={offerte.klantEmail}
            onChange={(e) => updateVeld("klantEmail", e.target.value)}
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
            placeholder="klant@voorbeeld.nl"
          />
        </div>
      </div>

      {verstuurFout && (
        <p className="mb-6 text-sm text-red-600 print:hidden dark:text-red-400">{verstuurFout}</p>
      )}

      <div className="mb-6">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-black/50 print:hidden">
          Klusomschrijving
        </label>
        <p className="text-sm text-black/80 dark:text-white/80 print:text-black">
          {offerte.klusOmschrijving}
        </p>
      </div>

      {/* Regels */}
      <div className="mb-2 overflow-x-auto print:overflow-visible">
      <table className="w-full min-w-[640px] border-collapse text-sm print:min-w-0">
        <thead>
          <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-black/50 dark:border-white/10 print:border-black print:text-black">
            <th className="py-2 pr-2">Omschrijving</th>
            <th className="w-24 py-2 pr-2">Type</th>
            <th className="w-20 py-2 pr-2">Aantal</th>
            <th className="w-20 py-2 pr-2">Eenheid</th>
            <th className="w-28 py-2 pr-2 text-right">Prijs/eenh.</th>
            <th className="w-28 py-2 pr-2 text-right">Totaal</th>
            <th className="w-8 print:hidden" />
          </tr>
        </thead>
        <tbody>
          {offerte.regels.map((regel) => (
            <tr
              key={regel.id}
              className="border-b border-black/5 dark:border-white/5 print:border-black/20"
            >
              <td className="py-2 pr-2">
                <input
                  value={regel.omschrijving}
                  onChange={(e) =>
                    updateRegel(regel.id, { omschrijving: e.target.value })
                  }
                  className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 hover:border-black/15 focus:border-black/30 print:border-none print:p-0 dark:hover:border-white/20"
                />
              </td>
              <td className="py-2 pr-2">
                <select
                  value={regel.type}
                  onChange={(e) =>
                    updateRegel(regel.id, {
                      type: e.target.value as RegelType,
                    })
                  }
                  className="w-full rounded-md border border-transparent bg-transparent px-1 py-1 hover:border-black/15 print:border-none print:p-0 dark:hover:border-white/20"
                >
                  <option value="materiaal">Materiaal</option>
                  <option value="arbeid">Arbeid</option>
                </select>
              </td>
              <td className="py-2 pr-2">
                <NumberInput
                  value={regel.aantal}
                  onChange={(waarde) => updateRegel(regel.id, { aantal: waarde })}
                  className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 hover:border-black/15 print:border-none print:p-0 dark:hover:border-white/20"
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  value={regel.eenheid}
                  onChange={(e) =>
                    updateRegel(regel.id, { eenheid: e.target.value })
                  }
                  className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 hover:border-black/15 print:border-none print:p-0 dark:hover:border-white/20"
                />
              </td>
              <td className="py-2 pr-2">
                <NumberInput
                  step="0.01"
                  value={regel.prijsPerEenheid}
                  onChange={(waarde) => updateRegel(regel.id, { prijsPerEenheid: waarde })}
                  className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-right hover:border-black/15 print:border-none print:p-0 dark:hover:border-white/20"
                />
              </td>
              <td className="py-2 pr-2 text-right">{formatEuro(regelTotaal(regel))}</td>
              <td className="py-2 text-right print:hidden">
                <button
                  onClick={() => verwijderRegel(regel.id)}
                  className="text-black/40 hover:text-red-600 dark:text-white/40"
                  aria-label="Regel verwijderen"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <button
        onClick={voegRegelToe}
        className="mb-8 text-sm font-medium text-black/60 hover:text-black print:hidden dark:text-white/60 dark:hover:text-white"
      >
        + Regel toevoegen
      </button>

      {/* Totalen */}
      <div className="ml-auto mb-8 w-64 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-black/60 dark:text-white/60 print:text-black">
            Subtotaal
          </span>
          <span>{formatEuro(subtotaal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-black/60 dark:text-white/60 print:text-black">
            BTW
            <NumberInput
              value={offerte.btwPercentage}
              onChange={(waarde) => updateVeld("btwPercentage", waarde)}
              className="w-14 rounded-md border border-black/15 bg-transparent px-1 py-0.5 text-right print:border-none dark:border-white/20"
            />
            %
          </span>
          <span>{formatEuro(btwBedrag)}</span>
        </div>
        <div className="flex justify-between border-t border-black/10 pt-1 text-base font-semibold dark:border-white/10 print:border-black">
          <span>Totaal</span>
          <span>{formatEuro(totaal)}</span>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-black/50 print:hidden">
          Opmerkingen
        </label>
        <textarea
          value={offerte.opmerkingen}
          onChange={(e) => updateVeld("opmerkingen", e.target.value)}
          rows={3}
          placeholder="Bijv. geldigheidsduur van de offerte, betalingsvoorwaarden…"
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm print:border-none print:p-0 dark:border-white/20"
        />
      </div>
    </div>
  );
}
