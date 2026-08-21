"use client";

import { useState } from "react";
import { Lead, LeadsPlanning, LeadStatus } from "@/lib/types";

const STATUS_LABEL: Record<LeadStatus, string> = {
  nieuw: "Nieuw",
  geen_email: "Geen e-mail gevonden",
  klaar: "Klaar om te versturen",
  verzonden: "Verzonden",
  afgemeld: "Afgemeld",
  bounced: "Bounced",
};

const STATUS_KLASSE: Record<LeadStatus, string> = {
  nieuw: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  geen_email: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  klaar: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  verzonden: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  afgemeld: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  bounced: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const EERSTE_BATCH: { vakgebied: string; plaats: string }[] = [
  { vakgebied: "loodgieter", plaats: "Utrecht" },
  { vakgebied: "loodgieter", plaats: "Amersfoort" },
  { vakgebied: "loodgieter", plaats: "Almere" },
  { vakgebied: "loodgieter", plaats: "Zwolle" },
  { vakgebied: "elektricien", plaats: "Utrecht" },
  { vakgebied: "elektricien", plaats: "Amersfoort" },
  { vakgebied: "elektricien", plaats: "Almere" },
  { vakgebied: "elektricien", plaats: "Zwolle" },
];

const FILTERS: { waarde: LeadStatus | "alle"; label: string }[] = [
  { waarde: "alle", label: "Alle" },
  { waarde: "nieuw", label: "Nieuw" },
  { waarde: "klaar", label: "Klaar" },
  { waarde: "verzonden", label: "Verzonden" },
  { waarde: "geen_email", label: "Geen e-mail" },
  { waarde: "afgemeld", label: "Afgemeld" },
];

export default function LeadsBeheer({
  initieleLeads,
  initielePlanning,
}: {
  initieleLeads: Lead[];
  initielePlanning: LeadsPlanning;
}) {
  const [leads, setLeads] = useState(initieleLeads);
  const [planning, setPlanning] = useState(initielePlanning);
  const [planningBezig, setPlanningBezig] = useState(false);
  const [planningMelding, setPlanningMelding] = useState<string | null>(null);
  const [vakgebied, setVakgebied] = useState("");
  const [plaats, setPlaats] = useState("");
  const [zoekBezig, setZoekBezig] = useState(false);
  const [zoekMelding, setZoekMelding] = useState<string | null>(null);
  const [filter, setFilter] = useState<LeadStatus | "alle">("nieuw");
  const [uitgeklapt, setUitgeklapt] = useState<string | null>(null);
  const [bezigId, setBezigId] = useState<string | null>(null);
  const [verstuurMelding, setVerstuurMelding] = useState<string | null>(null);
  const [verstuurBezig, setVerstuurBezig] = useState(false);
  const [batchBezig, setBatchBezig] = useState(false);
  const [batchVoortgang, setBatchVoortgang] = useState<string | null>(null);
  const [batchMelding, setBatchMelding] = useState<string | null>(null);
  const [goedkeurenBezig, setGoedkeurenBezig] = useState(false);
  const [goedkeurenVoortgang, setGoedkeurenVoortgang] = useState<string | null>(null);
  const [goedkeurenMelding, setGoedkeurenMelding] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testBezig, setTestBezig] = useState(false);
  const [testMelding, setTestMelding] = useState<string | null>(null);

  const zichtbareLeads = filter === "alle" ? leads : leads.filter((l) => l.status === filter);
  const klaarAantal = leads.filter((l) => l.status === "klaar").length;
  const nieuwMetEmailAantal = leads.filter((l) => l.status === "nieuw" && l.email).length;

  async function zoeken(event: React.FormEvent) {
    event.preventDefault();
    setZoekBezig(true);
    setZoekMelding(null);
    try {
      const response = await fetch("/api/admin/leads/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vakgebied, plaats }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Zoeken mislukt");
      setLeads((huidig) => [...(data.leads as Lead[]), ...huidig]);
      setZoekMelding(
        `${data.gevonden} gevonden, ${data.nieuw} nieuw toegevoegd, ${data.overgeslagen} al bekend.`
      );
      setFilter("nieuw");
    } catch (error) {
      setZoekMelding(error instanceof Error ? error.message : "Zoeken mislukt");
    } finally {
      setZoekBezig(false);
    }
  }

  async function startEersteBatch() {
    setBatchBezig(true);
    setBatchMelding(null);
    let totaalNieuw = 0;
    for (let i = 0; i < EERSTE_BATCH.length; i++) {
      const combo = EERSTE_BATCH[i];
      setBatchVoortgang(`${i + 1}/${EERSTE_BATCH.length}: ${combo.vakgebied} in ${combo.plaats}…`);
      try {
        const response = await fetch("/api/admin/leads/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(combo),
        });
        const data = await response.json();
        if (response.ok) {
          setLeads((huidig) => [...(data.leads as Lead[]), ...huidig]);
          totaalNieuw += data.nieuw as number;
        }
      } catch {
        // Eén mislukte combinatie mag de rest van de batch niet blokkeren.
      }
    }
    setBatchVoortgang(null);
    setBatchMelding(`Eerste batch klaar: ${totaalNieuw} nieuwe leads gevonden.`);
    setFilter("nieuw");
    setBatchBezig(false);
  }

  async function alleGoedkeuren() {
    const teDoen = leads.filter((l) => l.status === "nieuw" && l.email);
    if (teDoen.length === 0) return;
    setGoedkeurenBezig(true);
    setGoedkeurenMelding(null);
    let gelukt = 0;
    for (let i = 0; i < teDoen.length; i++) {
      const lead = teDoen[i];
      setGoedkeurenVoortgang(`${i + 1}/${teDoen.length}`);
      try {
        const genResponse = await fetch(`/api/admin/leads/${lead.id}`, { method: "POST" });
        if (!genResponse.ok) continue;
        const gegenereerd = (await genResponse.json()) as Lead;
        const putResponse = await fetch(`/api/admin/leads/${lead.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailOnderwerp: gegenereerd.emailOnderwerp,
            emailTekst: gegenereerd.emailTekst,
            status: "klaar",
          }),
        });
        if (putResponse.ok) {
          const bijgewerkt = await putResponse.json();
          setLeads((huidig) => huidig.map((l) => (l.id === lead.id ? bijgewerkt : l)));
          gelukt++;
        }
      } catch {
        // Eén mislukte lead mag de rest niet blokkeren.
      }
    }
    setGoedkeurenVoortgang(null);
    setGoedkeurenMelding(`${gelukt} van ${teDoen.length} leads klaargezet om te versturen.`);
    setGoedkeurenBezig(false);
  }

  async function planningOpslaan(patch: { actief?: boolean; dagelijkseLimiet?: number }) {
    setPlanningBezig(true);
    setPlanningMelding(null);
    try {
      const response = await fetch("/api/admin/leads/planning", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Opslaan mislukt");
      setPlanning(data as LeadsPlanning);
    } catch (error) {
      setPlanningMelding(error instanceof Error ? error.message : "Opslaan mislukt");
    } finally {
      setPlanningBezig(false);
    }
  }

  async function stuurTestmail(event: React.FormEvent) {
    event.preventDefault();
    setTestBezig(true);
    setTestMelding(null);
    try {
      const response = await fetch("/api/admin/leads/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Versturen mislukt");
      setTestMelding(`Testmail verstuurd naar ${testEmail}.`);
    } catch (error) {
      setTestMelding(error instanceof Error ? error.message : "Versturen mislukt");
    } finally {
      setTestBezig(false);
    }
  }

  async function genereerConcept(id: string) {
    setBezigId(id);
    try {
      const response = await fetch(`/api/admin/leads/${id}`, { method: "POST" });
      if (!response.ok) throw new Error();
      const bijgewerkt = await response.json();
      setLeads((huidig) => huidig.map((l) => (l.id === id ? bijgewerkt : l)));
      setUitgeklapt(id);
    } finally {
      setBezigId(null);
    }
  }

  async function opslaan(lead: Lead, patch: Partial<Lead>) {
    setBezigId(lead.id);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error();
      const bijgewerkt = await response.json();
      setLeads((huidig) => huidig.map((l) => (l.id === lead.id ? bijgewerkt : l)));
    } finally {
      setBezigId(null);
    }
  }

  async function verwijderen(id: string) {
    if (!confirm("Deze lead verwijderen?")) return;
    setBezigId(id);
    try {
      const response = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setLeads((huidig) => huidig.filter((l) => l.id !== id));
    } finally {
      setBezigId(null);
    }
  }

  async function verstuurBatch() {
    setVerstuurBezig(true);
    setVerstuurMelding(null);
    try {
      const response = await fetch("/api/admin/leads/versturen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aantal: 25 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Versturen mislukt");
      setVerstuurMelding(`${data.verzonden} verzonden, ${data.mislukt} mislukt.`);
      // De route geeft geen bijgewerkte lijst terug — we markeren optimistisch
      // de eerste `verzonden` leads met status 'klaar' als verstuurd.
      setLeads((huidig) => {
        let over = data.verzonden as number;
        return huidig.map((l) => {
          if (l.status === "klaar" && over > 0) {
            over--;
            return { ...l, status: "verzonden" as LeadStatus };
          }
          return l;
        });
      });
    } catch (error) {
      setVerstuurMelding(error instanceof Error ? error.message : "Versturen mislukt");
    } finally {
      setVerstuurBezig(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
        <h2 className="mb-1 text-sm font-semibold">Eerste batch</h2>
        <p className="mb-3 text-sm text-black/60 dark:text-white/60">
          Loodgieters en elektriciens in Utrecht, Amersfoort, Almere en Zwolle (8 zoekopdrachten,
          tot ongeveer 80 leads).
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={startEersteBatch}
            disabled={batchBezig}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            {batchBezig ? "Bezig…" : "Start eerste batch"}
          </button>
          {batchVoortgang && (
            <p className="text-sm text-black/60 dark:text-white/60">{batchVoortgang}</p>
          )}
          {batchMelding && (
            <p className="text-sm text-black/60 dark:text-white/60">{batchMelding}</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-1 text-sm font-semibold">Automatisch dagelijks versturen</h2>
        <p className="mb-3 text-sm text-black/60 dark:text-white/60">
          Staat dit aan, dan verstuurt het systeem elke dag rond 9:30 automatisch de eerstvolgende
          klaarstaande leads, zonder dat je hoeft te klikken. Zet het uit om alleen handmatig te
          versturen.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={planning.actief}
              disabled={planningBezig}
              onChange={(e) => planningOpslaan({ actief: e.target.checked })}
              className="h-4 w-4"
            />
            Automatisch versturen aan
          </label>
          <label className="flex items-center gap-2 text-sm">
            Max. per dag
            <input
              type="number"
              min={1}
              max={50}
              value={planning.dagelijkseLimiet}
              disabled={planningBezig}
              onChange={(e) => setPlanning((p) => ({ ...p, dagelijkseLimiet: Number(e.target.value) }))}
              onBlur={(e) => planningOpslaan({ dagelijkseLimiet: Number(e.target.value) })}
              className="w-20 rounded-md border border-black/15 bg-transparent px-2 py-1 text-sm dark:border-white/20"
            />
          </label>
          {planning.laatstVerzondenOp && (
            <p className="text-sm text-black/50 dark:text-white/50">
              Laatst automatisch verzonden op {planning.laatstVerzondenOp}
            </p>
          )}
          {planningMelding && <p className="text-sm text-red-600">{planningMelding}</p>}
        </div>
      </div>

      <form
        onSubmit={stuurTestmail}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10"
      >
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-xs font-medium text-black/50">
            Stuur mezelf een testmail
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="jouw@e-mailadres.nl"
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
        </div>
        <button
          type="submit"
          disabled={testBezig || !testEmail.trim()}
          className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10"
        >
          {testBezig ? "Versturen…" : "Verstuur testmail"}
        </button>
        {testMelding && <p className="text-sm text-black/60 dark:text-white/60">{testMelding}</p>}
      </form>

      <form
        onSubmit={zoeken}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-black/50">Vakgebied</label>
          <input
            value={vakgebied}
            onChange={(e) => setVakgebied(e.target.value)}
            placeholder="Bijv. loodgieter"
            className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-black/50">Plaats</label>
          <input
            value={plaats}
            onChange={(e) => setPlaats(e.target.value)}
            placeholder="Bijv. Utrecht"
            className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
        </div>
        <button
          type="submit"
          disabled={zoekBezig || !vakgebied.trim() || !plaats.trim()}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          {zoekBezig ? "Zoeken…" : "Zoek nieuwe leads"}
        </button>
        {zoekMelding && <p className="text-sm text-black/60 dark:text-white/60">{zoekMelding}</p>}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10">
        <p className="text-sm text-black/60 dark:text-white/60">
          {nieuwMetEmailAantal} nieuwe lead(s) nog te beoordelen · {klaarAantal} klaar om te
          versturen.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {goedkeurenVoortgang && (
            <p className="text-sm text-black/60 dark:text-white/60">{goedkeurenVoortgang}</p>
          )}
          {goedkeurenMelding && (
            <p className="text-sm text-black/60 dark:text-white/60">{goedkeurenMelding}</p>
          )}
          <button
            onClick={alleGoedkeuren}
            disabled={goedkeurenBezig || nieuwMetEmailAantal === 0}
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10"
            title="Past de standaardtekst toe op alle nieuwe leads, zonder individuele review"
          >
            {goedkeurenBezig ? "Bezig…" : "Alles goedkeuren"}
          </button>
          {verstuurMelding && (
            <p className="text-sm text-black/60 dark:text-white/60">{verstuurMelding}</p>
          )}
          <button
            onClick={verstuurBatch}
            disabled={verstuurBezig || klaarAantal === 0}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            {verstuurBezig ? "Versturen…" : "Verstuur volgende batch (max 25)"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.waarde}
            onClick={() => setFilter(f.waarde)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              filter === f.waarde
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-black/5 text-black/60 hover:bg-black/10 dark:bg-white/10 dark:text-white/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {zichtbareLeads.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/15 p-10 text-center text-sm text-black/60 dark:border-white/15 dark:text-white/60">
          Geen leads in deze filter.
        </div>
      ) : (
        <ul className="divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/10">
          {zichtbareLeads.map((lead) => (
            <li key={lead.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{lead.bedrijfsnaam || "Naamloos"}</div>
                  <div className="text-sm text-black/60 dark:text-white/60">
                    {lead.vakgebied} · {lead.plaats}
                    {lead.email ? ` · ${lead.email}` : " · geen e-mail"}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_KLASSE[lead.status]}`}
                  >
                    {STATUS_LABEL[lead.status]}
                  </span>
                  {lead.email && lead.status !== "verzonden" && lead.status !== "afgemeld" && (
                    <button
                      onClick={() =>
                        uitgeklapt === lead.id ? setUitgeklapt(null) : genereerConcept(lead.id)
                      }
                      disabled={bezigId === lead.id}
                      className="rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10"
                    >
                      {uitgeklapt === lead.id ? "Sluiten" : lead.emailTekst ? "Bekijk concept" : "Genereer concept"}
                    </button>
                  )}
                  <button
                    onClick={() => verwijderen(lead.id)}
                    disabled={bezigId === lead.id}
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-black/50 hover:bg-black/5 disabled:opacity-50 dark:text-white/50 dark:hover:bg-white/10"
                  >
                    Verwijderen
                  </button>
                </div>
              </div>

              {uitgeklapt === lead.id && lead.emailTekst && (
                <LeadConceptEditor
                  lead={lead}
                  bezig={bezigId === lead.id}
                  onOpslaan={(patch) => opslaan(lead, patch)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LeadConceptEditor({
  lead,
  bezig,
  onOpslaan,
}: {
  lead: Lead;
  bezig: boolean;
  onOpslaan: (patch: Partial<Lead>) => void;
}) {
  const [onderwerp, setOnderwerp] = useState(lead.emailOnderwerp);
  const [tekst, setTekst] = useState(lead.emailTekst);

  return (
    <div className="mt-4 space-y-3 rounded-md border border-black/10 p-4 dark:border-white/10">
      <div>
        <label className="mb-1 block text-xs font-medium text-black/50">Onderwerp</label>
        <input
          value={onderwerp}
          onChange={(e) => setOnderwerp(e.target.value)}
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-black/50">Tekst</label>
        <textarea
          rows={8}
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() =>
            onOpslaan({ emailOnderwerp: onderwerp, emailTekst: tekst, status: "klaar" })
          }
          disabled={bezig || !onderwerp.trim() || !tekst.trim()}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          {bezig ? "Bezig…" : "Keur goed (klaar om te versturen)"}
        </button>
        <button
          onClick={() => onOpslaan({ emailOnderwerp: onderwerp, emailTekst: tekst })}
          disabled={bezig}
          className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10"
        >
          Alleen opslaan
        </button>
      </div>
    </div>
  );
}
