"use client";

import { useEffect, type RefObject } from "react";

/**
 * Fades/slides in any `.reveal` element inside `rootRef` as it scrolls into
 * view (mirrors the original site's IntersectionObserver behaviour).
 * `#hero-frame` is skipped because the envelope-open animation drives it.
 */
export function useReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>(".reveal:not(#hero-frame)");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}
