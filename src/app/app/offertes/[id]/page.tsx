import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInstellingen, getOfferte } from "@/lib/db";
import OfferteEditor from "./OfferteEditor";

export const dynamic = "force-dynamic";

export default async function OffertePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const [offerte, instellingen] = await Promise.all([
    getOfferte(supabase, user.id, id),
    getInstellingen(supabase, user.id),
  ]);

  if (!offerte) {
    notFound();
  }

  return <OfferteEditor initialOfferte={offerte} instellingen={instellingen} />;
}
