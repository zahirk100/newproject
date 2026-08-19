"use client";

import { useEffect, useRef, useState } from "react";

interface Suggestie {
  id: string;
  weergavenaam: string;
}

export default function AdresAutocomplete({
  id,
  value,
  onChange,
  placeholder,
  className,
}: {
  id?: string;
  value: string;
  onChange: (waarde: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [suggesties, setSuggesties] = useState<Suggestie[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function buitenKlik(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", buitenKlik);
    return () => document.removeEventListener("mousedown", buitenKlik);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value.trim().length < 4) {
        setSuggesties([]);
        return;
      }
      try {
        const response = await fetch(
          `https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest?q=${encodeURIComponent(
            value
          )}&fq=type:adres&rows=5`
        );
        if (!response.ok) return;
        const data = await response.json();
        const docs = (data?.response?.docs ?? []) as Suggestie[];
        setSuggesties(docs);
        setOpen(docs.length > 0);
      } catch {
        // Adressuggesties zijn een gemak, geen kritieke functie — bij een
        // netwerkfout blijft gewoon handmatig typen mogelijk.
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggesties.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />
      {open && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-black/15 bg-white text-sm shadow-lg dark:border-white/20 dark:bg-neutral-900">
          {suggesties.map((suggestie) => (
            <li key={suggestie.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(suggestie.weergavenaam);
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"
              >
                {suggestie.weergavenaam}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
