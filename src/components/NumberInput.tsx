"use client";

import { useState } from "react";

/**
 * Cijferveld dat zijn eigen teksttoestand bijhoudt terwijl je typt, in
 * plaats van bij elke toetsaanslag terug te synchroniseren met de
 * bovenliggende numerieke waarde. Dat laatste veroorzaakt op mobiel (en
 * met een 0-waarde) een storende bug: zodra je een "0" leeghaalt, wordt
 * "leeg" meteen weer als 0 gelezen en verschijnt de 0 terug — waardoor het
 * lijkt of het veld niet aan te passen is.
 */
export default function NumberInput({
  id,
  value,
  onChange,
  step,
  placeholder,
  className,
}: {
  id?: string;
  value: number;
  onChange: (waarde: number) => void;
  step?: string;
  placeholder?: string;
  className?: string;
}) {
  const [tekst, setTekst] = useState(value === 0 ? "" : String(value));

  function wijzig(nieuweTekst: string) {
    setTekst(nieuweTekst);
    if (nieuweTekst.trim() === "") {
      onChange(0);
      return;
    }
    // Nederlandse toetsenborden typen een komma als decimaalteken (bijv.
    // "0,50"), maar Number() begrijpt alleen een punt — zonder deze
    // omzetting levert dat NaN op en wordt de invoer stilletjes genegeerd.
    const parsed = Number(nieuweTekst.replace(",", "."));
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      value={tekst}
      onChange={(e) => wijzig(e.target.value)}
      step={step}
      placeholder={placeholder ?? "0"}
      className={className}
    />
  );
}
