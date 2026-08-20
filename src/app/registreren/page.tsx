"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function RegistrerenPage() {
  const router = useRouter();
  const [bedrijfsnaam, setBedrijfsnaam] = useState("");
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [emailVerzonden, setEmailVerzonden] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFout(null);
    setBezig(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: wachtwoord,
      options: {
        data: { bedrijfsnaam },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setFout(error.message);
      setBezig(false);
      return;
    }

    // De database-trigger zet bedrijfsnaam meteen op het nieuwe profiel
    // (uit de meegegeven signup-metadata), dus hier is geen extra call nodig.

    if (data.session) {
      router.push("/app");
      router.refresh();
    } else {
      // e-mailbevestiging staat aan in dit Supabase-project
      setEmailVerzonden(true);
      setBezig(false);
    }
  }

  if (emailVerzonden) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 text-center dark:bg-neutral-950">
        <div className="max-w-sm">
          <h1 className="mb-2 text-xl font-semibold">Check je inbox</h1>
          <p className="mb-6 text-sm text-black/60 dark:text-white/60">
            We hebben een bevestigingsmail gestuurd naar <strong>{email}</strong>. Klik op de
            link daarin om je account te activeren. Daarna kun je inloggen.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Naar inloggen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 dark:bg-neutral-950">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-900">
          <h1 className="mb-6 text-xl font-semibold">Registreer je bedrijf</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="bedrijfsnaam">
                Bedrijfsnaam
              </label>
              <input
                id="bedrijfsnaam"
                required
                value={bedrijfsnaam}
                onChange={(e) => setBedrijfsnaam(e.target.value)}
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
                placeholder="Bijv. Jansen Installatietechniek"
              />
            </div>
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
                minLength={6}
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
              {bezig ? "Account aanmaken…" : "Account aanmaken"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-black/60 dark:text-white/60">
          Al een account?{" "}
          <Link href="/login" className="font-medium underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
