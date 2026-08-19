import { createClient } from "@/lib/supabase/server";
import { listOffertes } from "@/lib/db";
import PlanningLijst from "./PlanningLijst";

export const dynamic = "force-dynamic";

export default async function PlanningPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const offertes = user ? await listOffertes(supabase, user.id) : [];
  const teplannen = offertes.filter((o) => o.status === "geaccepteerd");

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Planning</h1>
      <p className="mb-8 text-sm text-black/60 dark:text-white/60">
        Stel een datum voor bij een geaccepteerde offerte. De klant kan akkoord gaan of een
        andere datum voorstellen — jij beslist uiteindelijk welke datum definitief wordt.
      </p>
      <PlanningLijst initieleOffertes={teplannen} />
    </div>
  );
}
