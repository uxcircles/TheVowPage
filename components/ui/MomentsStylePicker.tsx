"use client";

import { MOMENTS_STYLES } from "@/components/templates/classic/momentsStyles";

export function MomentsStylePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {MOMENTS_STYLES.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => onChange(style.id)}
          className={`rounded-lg border px-4 py-2.5 text-left transition ${
            value === style.id
              ? "border-[var(--brand-gold)] bg-[var(--brand-gold)]/10"
              : "border-[var(--brand-line)] hover:border-[var(--brand-gold)]"
          }`}
        >
          <p className="text-sm font-medium text-foreground">{style.name}</p>
          <p className="mt-0.5 text-xs text-[var(--brand-ink-soft)]">{style.tagline}</p>
        </button>
      ))}
    </div>
  );
}
