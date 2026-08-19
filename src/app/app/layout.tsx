import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInstellingen } from "@/lib/db";
import AppSidebar from "@/components/AppSidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const instellingen = await getInstellingen(supabase, user.id);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AppSidebar
        bedrijfsnaam={instellingen.bedrijfsnaam}
        logoUrl={instellingen.logoUrl}
        merkkleur={instellingen.merkkleur}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
