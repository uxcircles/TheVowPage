"use client";

import { CLASSIC_THEMES } from "@/components/templates/classic/themes";
import { InvitationCardVisual } from "@/components/marketing/InvitationPreviewCard";

export function ThemePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {CLASSIC_THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onChange(theme.id)}
          className={`flex flex-col gap-2 rounded-lg p-2 text-left transition ${
            value === theme.id
              ? "ring-2 ring-[var(--brand-gold)]"
              : "ring-1 ring-transparent hover:ring-[var(--brand-line)]"
          }`}
        >
          <InvitationCardVisual theme={theme} />
          <div>
            <p className="text-sm font-medium text-foreground">{theme.name}</p>
            <p className="text-xs text-[var(--brand-ink-soft)]">{theme.tagline}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
