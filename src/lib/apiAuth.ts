import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

export async function getAuthedContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Voor routes die alleen de platformbeheerder mag gebruiken (bijv. leads). */
export async function getAdminContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = user ? await isAdmin(supabase, user.id) : false;
  return { supabase, user, admin };
}
