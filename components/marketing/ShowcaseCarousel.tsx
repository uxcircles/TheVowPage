"use client";

import { useEffect, useState } from "react";
import { InvitationPreviewCard } from "./InvitationPreviewCard";
import { Reveal } from "./Reveal";
import type { ClassicTheme } from "@/components/templates/classic/themes";

/** Cycles a "熱門配色" highlight across the theme cards so the showcase grid
 * has some motion instead of sitting static once revealed. */
export function ShowcaseCarousel({ themes }: { themes: ClassicTheme[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % themes.length), 3200);
    return () => clearInterval(id);
  }, [themes.length]);

  return (
    <>
      {themes.map((theme, i) => (
        <Reveal key={theme.name} delay={(i % 4) * 100}>
          <div
            className={`relative rounded-lg transition-transform duration-500 ease-out ${
              active === i ? "-translate-y-2" : ""
            }`}
          >
            {active === i && (
              <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--brand-gold-dark)] px-3 py-1 text-xs text-white shadow-sm">
                熱門配色
              </span>
            )}
            <InvitationPreviewCard theme={theme} />
          </div>
        </Reveal>
      ))}
    </>
  );
}
