import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { listLeads } from "@/lib/leads";
import { getLeadsPlanning } from "@/lib/leadsPlanning";
import LeadsBeheer from "./LeadsBeheer";

export const dynamic = "force-dynamic";

export default async function LeadsPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(supabase, user.id))) notFound();

  const [leads, planning] = await Promise.all([listLeads(supabase), getLeadsPlanning(supabase)]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
      <h1 className="mb-2 text-2xl font-semibold">Leads</h1>
      <p className="mb-8 text-sm text-black/60 dark:text-white/60">
        Interne acquisitietool: zoek vakbedrijven op, keur de conceptmail per lead goed en
        verstuur in batches. Niet zichtbaar voor ondernemer-klanten.
      </p>
      <LeadsBeheer initieleLeads={leads} initielePlanning={planning} />
    </div>
  );
}
