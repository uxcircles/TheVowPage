"use client";

import { CLASSIC_THEMES } from "@/components/templates/classic/themes";

export function ThemePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {CLASSIC_THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onChange(theme.id)}
          className={`flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 transition ${
            value === theme.id
              ? "border-[var(--brand-gold)] bg-[var(--brand-gold)]/10"
              : "border-[var(--brand-line)] hover:border-[var(--brand-gold)]"
          }`}
        >
          <span
            className="h-7 w-7 shrink-0 rounded-full border border-black/10"
            style={{ backgroundColor: theme.gold }}
          />
          <span className="text-sm font-medium text-foreground">{theme.name}</span>
        </button>
      ))}
    </div>
  );
}
