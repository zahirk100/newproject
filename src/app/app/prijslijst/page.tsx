import { createClient } from "@/lib/supabase/server";
import { listPrijslijst } from "@/lib/db";
import PrijslijstBeheer from "./PrijslijstBeheer";

export const dynamic = "force-dynamic";

export default async function PrijslijstPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const prijslijst = user ? await listPrijslijst(supabase, user.id) : [];

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Prijslijst</h1>
      <p className="mb-8 text-sm text-black/60 dark:text-white/60">
        Voeg je eigen materialen en diensten met vaste prijzen toe. De AI gebruikt deze exacte
        prijzen bij het opstellen van offertes in plaats van zelf te schatten.
      </p>
      <PrijslijstBeheer initieleItems={prijslijst} />
    </div>
  );
}
