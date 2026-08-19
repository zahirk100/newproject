"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFout(null);
    setBezig(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: wachtwoord,
    });
    if (error) {
      setFout(
        error.message === "Invalid login credentials"
          ? "E-mailadres of wachtwoord klopt niet."
          : error.message
      );
      setBezig(false);
      return;
    }
    router.push(searchParams.get("next") || "/app");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 dark:bg-neutral-950">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center text-lg font-semibold tracking-tight">
          OfferteFlits
        </Link>
        <div className="rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-900">
          <h1 className="mb-6 text-xl font-semibold">Inloggen</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="email">
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="wachtwoord">
                Wachtwoord
              </label>
              <input
                id="wachtwoord"
                type="password"
                required
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
              />
            </div>
            {fout && <p className="text-sm text-red-600 dark:text-red-400">{fout}</p>}
            <button
              type="submit"
              disabled={bezig}
              className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
            >
              {bezig ? "Inloggen…" : "Inloggen"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-black/60 dark:text-white/60">
          Nog geen account?{" "}
          <Link href="/registreren" className="font-medium underline">
            Registreer je bedrijf
          </Link>
        </p>
      </div>
    </div>
  );
}
