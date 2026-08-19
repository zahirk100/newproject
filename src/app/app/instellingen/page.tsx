import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInstellingen } from "@/lib/db";
import InstellingenForm from "./InstellingenForm";

export const dynamic = "force-dynamic";

export default async function InstellingenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const instellingen = await getInstellingen(supabase, user.id);
  return <InstellingenForm initialInstellingen={instellingen} />;
}
