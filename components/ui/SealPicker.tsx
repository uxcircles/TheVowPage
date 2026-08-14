"use client";

import { SEAL_DESIGNS } from "@/components/templates/classic/seals";

export function SealPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {SEAL_DESIGNS.map((seal) => (
        <button
          key={seal.id}
          type="button"
          onClick={() => onChange(seal.id)}
          className={`flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 transition ${
            value === seal.id
              ? "border-[var(--brand-gold)] bg-[var(--brand-gold)]/10"
              : "border-[var(--brand-line)] hover:border-[var(--brand-gold)]"
          }`}
        >
          <span className="h-7 w-7 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={seal.image} alt="" className="h-full w-full object-contain" />
          </span>
          <span className="text-sm font-medium text-foreground">{seal.name}</span>
        </button>
      ))}
    </div>
  );
}
