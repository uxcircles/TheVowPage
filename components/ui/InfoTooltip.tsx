"use client";

import { useEffect, useRef, useState } from "react";
import { useHasFinePointer } from "@/lib/useHasFinePointer";

// Click-to-toggle on touch devices, since hover alone doesn't fire on tap -
// but on devices with a real mouse, showing only on click feels sluggish
// for a quick glance, so those also get a hover reveal (plus focus, for
// keyboard navigation).
export function InfoTooltip({ text }: { text: string }) {
  const hasFinePointer = useHasFinePointer();
  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
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

  const visible = open || (hasFinePointer && hovering);

  return (
    <span
      ref={containerRef}
      className="relative inline-block align-middle"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onFocus={() => setHovering(true)}
        onBlur={() => setHovering(false)}
        aria-label="更多說明"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[var(--brand-line)] text-[10px] leading-none text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]"
      >
        i
      </button>
      {visible && (
        <span className="absolute left-1/2 top-full z-20 mt-1.5 w-56 -translate-x-1/2 rounded border border-[var(--brand-line)] bg-white p-2.5 text-xs leading-relaxed text-[var(--brand-ink-soft)] shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}
