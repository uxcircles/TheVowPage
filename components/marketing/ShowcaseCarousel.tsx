"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { InvitationPreviewCard } from "./InvitationPreviewCard";
import { Reveal } from "./Reveal";
import type { ClassicTheme } from "@/components/templates/classic/themes";

/** Cycles a "熱門配色" highlight across the theme cards so the showcase grid
 * has some motion instead of sitting static once revealed. Each card links
 * to a real, published demo wedding (/w/demo-{themeId}) rather than just
 * showing the static mockup, so visitors can see the actual product. */
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
          <Link
            href={`/w/demo-${theme.id}`}
            target="_blank"
            className={`group relative block rounded-lg transition-transform duration-500 ease-out ${
              active === i ? "-translate-y-2" : ""
            }`}
          >
            {active === i && (
              <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--brand-gold-dark)] px-3 py-1 text-xs text-white shadow-sm">
                熱門配色
              </span>
            )}
            <InvitationPreviewCard theme={theme} />
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm">
                查看完整範例 →
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </>
  );
}
