import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getInstellingen } from "@/lib/db";
import AanvraagFormulier from "./AanvraagFormulier";

export const dynamic = "force-dynamic";

export default async function AanvraagPagina({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const admin = createAdminClient();

  let instellingen;
  try {
    instellingen = await getInstellingen(admin, profileId);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-10 dark:bg-neutral-950">
      <div className="mx-auto max-w-lg rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <div className="mb-6 flex items-center gap-2">
          {instellingen.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={instellingen.logoUrl} alt="" className="h-8 w-auto object-contain" />
          ) : (
            <span
              className="flex h-8 w-8 items-center justify-center rounded text-sm font-semibold text-white"
              style={{ backgroundColor: instellingen.merkkleur }}
            >
              {instellingen.bedrijfsnaam.charAt(0).toUpperCase() || "O"}
            </span>
          )}
          <span className="font-semibold">{instellingen.bedrijfsnaam}</span>
        </div>
        <h1 className="mb-2 text-xl font-semibold">Offerte aanvragen</h1>
        <p className="mb-6 text-sm text-black/60 dark:text-white/60">
          Vul je gegevens en de klus in — {instellingen.bedrijfsnaam || "wij"} nemen zo snel
          mogelijk contact met je op met een offerte.
        </p>
        <AanvraagFormulier profileId={profileId} />
      </div>
    </div>
  );
}
