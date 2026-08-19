import { createClient } from "@/lib/supabase/server";
import { listFacturen } from "@/lib/db";
import FacturenLijst from "./FacturenLijst";

export const dynamic = "force-dynamic";

export default async function FacturenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const facturen = user ? await listFacturen(supabase, user.id) : [];

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Facturen</h1>
      <p className="mb-8 text-sm text-black/60 dark:text-white/60">
        Facturen worden automatisch aangemaakt en gemaild zodra een klant een offerte goedkeurt.
      </p>
      <FacturenLijst initieleFacturen={facturen} />
    </div>
  );
}
