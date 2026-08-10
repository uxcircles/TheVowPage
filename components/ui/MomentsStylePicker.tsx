"use client";

import { MOMENTS_STYLES, type MomentsStyleId } from "@/components/templates/classic/momentsStyles";

// Small line icons hinting at each layout, drawn to a shared 24x24 grid so
// they sit consistently at any size - purely decorative (aria-hidden).
const ICONS: Record<MomentsStyleId, React.ReactNode> = {
  stack: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="4" width="13" height="11" rx="1.3" opacity="0.45" />
      <rect x="4.5" y="7" width="13" height="11" rx="1.3" opacity="0.7" />
      <rect x="3" y="10" width="13" height="11" rx="1.3" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="8" height="8" rx="1.2" />
      <rect x="13" y="3" width="8" height="8" rx="1.2" />
      <rect x="3" y="13" width="8" height="8" rx="1.2" />
      <rect x="13" y="13" width="8" height="8" rx="1.2" />
    </svg>
  ),
  carousel: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="7" width="6" height="12" rx="1.2" transform="rotate(-10 4.5 13)" opacity="0.55" />
      <rect x="16.5" y="7" width="6" height="12" rx="1.2" transform="rotate(10 19.5 13)" opacity="0.55" />
      <rect x="8.5" y="3" width="7" height="18" rx="1.4" />
    </svg>
  ),
};

export function MomentsStylePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {MOMENTS_STYLES.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => onChange(style.id)}
          className={`flex items-start gap-3 rounded-lg border px-4 py-2.5 text-left transition ${
            value === style.id
              ? "border-[var(--brand-gold)] bg-[var(--brand-gold)]/10"
              : "border-[var(--brand-line)] hover:border-[var(--brand-gold)]"
          }`}
        >
          <span
            className={`mt-0.5 h-6 w-6 shrink-0 ${
              value === style.id ? "text-[var(--brand-gold)]" : "text-[var(--brand-ink-soft)]"
            }`}
            aria-hidden="true"
          >
            {ICONS[style.id]}
          </span>
          <span>
            <p className="text-sm font-medium text-foreground">{style.name}</p>
            <p className="mt-0.5 text-xs text-[var(--brand-ink-soft)]">{style.tagline}</p>
          </span>
        </button>
      ))}
    </div>
  );
}
