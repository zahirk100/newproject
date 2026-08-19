import Link from "next/link";

export default function Nav() {
  return (
    <header className="border-b border-black/10 dark:border-white/15 print:hidden">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          OfferteFlits
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link href="/" className="hover:underline">
            Offertes
          </Link>
          <Link href="/offertes/nieuw" className="hover:underline">
            Nieuwe offerte
          </Link>
          <Link href="/instellingen" className="hover:underline">
            Instellingen
          </Link>
        </nav>
      </div>
    </header>
  );
}
