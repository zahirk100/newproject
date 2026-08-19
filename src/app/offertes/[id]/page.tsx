import { notFound } from "next/navigation";
import { getInstellingen, getOfferte } from "@/lib/store";
import OfferteEditor from "./OfferteEditor";

export default async function OffertePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [offerte, instellingen] = await Promise.all([
    getOfferte(id),
    getInstellingen(),
  ]);

  if (!offerte) {
    notFound();
  }

  return <OfferteEditor initialOfferte={offerte} instellingen={instellingen} />;
}
