import { createClient } from "@/lib/supabase/server";
import { listKlanten } from "@/lib/db";
import KlantenLijst from "./KlantenLijst";

export const dynamic = "force-dynamic";

export default async function KlantenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const klanten = user ? await listKlanten(supabase, user.id) : [];

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Klanten</h1>
      <p className="mb-8 text-sm text-black/60 dark:text-white/60">
        Sla klantgegevens op en hergebruik ze bij het aanmaken van nieuwe offertes.
      </p>
      <KlantenLijst initialeKlanten={klanten} />
    </div>
  );
}
