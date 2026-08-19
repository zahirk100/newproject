import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOfferte } from "@/lib/db";
import AanvraagDetail from "./AanvraagDetail";

export const dynamic = "force-dynamic";

export default async function AanvraagPagina({
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

  const offerte = await getOfferte(supabase, user.id, id);
  if (!offerte) notFound();

  // Eenmaal omgezet is dit een gewone offerte — daar hoort de editor bij.
  if (offerte.status !== "aanvraag") {
    redirect(`/app/offertes/${id}`);
  }

  return <AanvraagDetail aanvraag={offerte} />;
}
