"use client";

import { useEffect, useRef, useState } from "react";

// Click-to-toggle rather than hover-only, so it works the same way on
// touch devices as it does with a mouse - hover alone doesn't fire on tap.
export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  return (
    <span ref={containerRef} className="relative inline-block align-middle">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label="更多說明"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[var(--brand-line)] text-[10px] leading-none text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]"
      >
        i
      </button>
      {open && (
        <span className="absolute left-1/2 top-full z-20 mt-1.5 w-56 -translate-x-1/2 rounded border border-[var(--brand-line)] bg-white p-2.5 text-xs leading-relaxed text-[var(--brand-ink-soft)] shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}
