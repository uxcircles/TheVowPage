"use client";

import { useState } from "react";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`h-4 w-4 shrink-0 text-[var(--brand-ink-soft)] transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

// Native <details>/<summary> can't animate its open/close height reliably
// across browsers (it's an instant display:none<->block toggle), so this is
// a controlled accordion instead. The grid-template-rows 0fr<->1fr trick
// transitions to the answer's intrinsic height without measuring
// scrollHeight in JS - the inner overflow-hidden wrapper is what actually
// clips it mid-transition.
export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left font-medium text-foreground"
      >
        {question}
        <ChevronIcon open={open} />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="mt-3 text-sm leading-relaxed text-[var(--brand-ink-soft)]">{answer}</p>
        </div>
      </div>
    </div>
  );
}
