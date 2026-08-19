import { getInstellingen } from "@/lib/store";
import InstellingenForm from "./InstellingenForm";

export const dynamic = "force-dynamic";

export default async function InstellingenPage() {
  const instellingen = await getInstellingen();
  return <InstellingenForm initialInstellingen={instellingen} />;
}
