"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/app", label: "Dashboard", icon: "📊" },
  { href: "/app/offertes/nieuw", label: "Nieuwe offerte", icon: "➕" },
  { href: "/app/klanten", label: "Klanten", icon: "👥" },
  { href: "/app/prijslijst", label: "Prijslijst", icon: "💰" },
  { href: "/app/planning", label: "Planning", icon: "📅" },
  { href: "/app/facturen", label: "Facturen", icon: "🧾" },
  { href: "/app/instellingen", label: "Instellingen", icon: "⚙️" },
];

function Logo({
  bedrijfsnaam,
  logoUrl,
  merkkleur,
}: {
  bedrijfsnaam: string;
  logoUrl: string | null;
  merkkleur: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={bedrijfsnaam}
          width={28}
          height={28}
          className="rounded object-contain"
          unoptimized
        />
      ) : (
        <span
          className="flex h-7 w-7 items-center justify-center rounded text-sm font-semibold text-white"
          style={{ backgroundColor: merkkleur }}
        >
          {bedrijfsnaam.charAt(0).toUpperCase() || "O"}
        </span>
      )}
      <span className="truncate text-sm font-semibold">{bedrijfsnaam || "OfferteFlits"}</span>
    </div>
  );
}

function NavLinks({ pathname, onNavigeer }: { pathname: string; onNavigeer?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {LINKS.map((link) => {
        const actief =
          link.href === "/app" ? pathname === "/app" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigeer}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              actief
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
            }`}
          >
            <span aria-hidden>{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppSidebar({
  bedrijfsnaam,
  logoUrl,
  merkkleur,
}: {
  bedrijfsnaam: string;
  logoUrl: string | null;
  merkkleur: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobielOpen, setMobielOpen] = useState(false);

  async function logUit() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobiele topbalk */}
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 md:hidden dark:border-white/10 print:hidden">
        <Logo bedrijfsnaam={bedrijfsnaam} logoUrl={logoUrl} merkkleur={merkkleur} />
        <button
          onClick={() => setMobielOpen(true)}
          aria-label="Menu openen"
          className="rounded-md p-2 text-xl hover:bg-black/5 dark:hover:bg-white/10"
        >
          ☰
        </button>
      </div>

      {/* Mobiel uitklapmenu */}
      {mobielOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobielOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-neutral-50 shadow-xl dark:bg-neutral-950">
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-5 dark:border-white/10">
              <Logo bedrijfsnaam={bedrijfsnaam} logoUrl={logoUrl} merkkleur={merkkleur} />
              <button
                onClick={() => setMobielOpen(false)}
                aria-label="Menu sluiten"
                className="rounded-md p-1 text-xl hover:bg-black/5 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigeer={() => setMobielOpen(false)} />
            <div className="border-t border-black/10 px-3 py-4 dark:border-white/10">
              <button
                onClick={logUit}
                className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
              >
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vaste zijbalk op desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-black/10 bg-neutral-50 md:flex print:hidden dark:border-white/10 dark:bg-neutral-950">
        <div className="border-b border-black/10 px-5 py-5 dark:border-white/10">
          <Logo bedrijfsnaam={bedrijfsnaam} logoUrl={logoUrl} merkkleur={merkkleur} />
        </div>
        <NavLinks pathname={pathname} />
        <div className="border-t border-black/10 px-3 py-4 dark:border-white/10">
          <button
            onClick={logUit}
            className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
          >
            Uitloggen
          </button>
        </div>
      </aside>
    </>
  );
}
