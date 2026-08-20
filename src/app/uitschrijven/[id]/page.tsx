import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import AfmeldKnop from "./AfmeldKnop";

export const dynamic = "force-dynamic";

export default async function UitschrijvenPagina({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: lead } = await admin
    .from("leads")
    .select("id, bedrijfsnaam, status")
    .eq("id", id)
    .maybeSingle();

  if (!lead) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-10 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-neutral-900">
        {lead.status === "afgemeld" ? (
          <p className="text-sm text-black/70 dark:text-white/70">
            {lead.bedrijfsnaam || "Dit adres"} is al afgemeld. Je ontvangt geen berichten meer
            van OfferteFlits.
          </p>
        ) : (
          <>
            <h1 className="mb-2 text-lg font-semibold">Afmelden</h1>
            <p className="mb-6 text-sm text-black/60 dark:text-white/60">
              Wil je geen berichten meer ontvangen van OfferteFlits namens{" "}
              {lead.bedrijfsnaam || "dit bedrijf"}?
            </p>
            <AfmeldKnop leadId={lead.id} />
          </>
        )}
      </div>
    </div>
  );
}
