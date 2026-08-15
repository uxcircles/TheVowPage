"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";
import type { ClassicTheme } from "@/components/templates/classic/themes";

/** Cycles a "熱門配色" highlight across the theme cards so the showcase grid
 * has some motion instead of sitting static once revealed. Each card links
 * to a real, published demo wedding (/w/demo-{themeId}) rather than just
 * showing the static mockup, so visitors can see the actual product.
 *
 * Two different "查看完整範例" presentations, split by the device's actual
 * hover capability (not just viewport width, which a resized desktop
 * window would still get wrong): a dark hover overlay on devices with a
 * real pointer, and an always-visible text link on touch devices, where
 * hover has no meaning and a tap should just navigate immediately.
 * Tailwind's `hover:`/`group-hover:` are already scoped to
 * `@media (hover: hover)`, so the overlay is inert (not just invisible)
 * on touch - no double-tap-to-follow-the-link surprise.
 *
 * The card visual itself is a real screenshot of the matching demo wedding
 * (public/showcase/demo-{themeId}.jpg, regenerate via
 * scripts/capture-showcase-screenshots.mjs if the demo content changes),
 * not the abstract InvitationCardVisual mockup - a real photo of the actual
 * product reads as more convincing than a generic placeholder. */
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
            className={`group block transition-transform duration-500 ease-out ${
              active === i ? "-translate-y-2" : ""
            }`}
          >
            <div className="relative rounded-lg">
              {active === i && (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--brand-gold-dark)] px-3 py-1 text-xs text-white shadow-sm">
                  熱門配色
                </span>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/showcase/demo-${theme.id}.jpg`}
                alt={`${theme.name} 範例喜帖畫面`}
                className="aspect-[4/5] w-full rounded-lg object-cover shadow-[0_20px_45px_-25px_rgba(60,53,44,0.45)]"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 px-6 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
                <span className="rounded-full bg-white px-5 py-2.5 text-center text-sm font-medium text-foreground shadow-sm">
                  查看完整範例 →
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-medium text-foreground">{theme.name}</p>
              <p className="text-sm text-[var(--brand-ink-soft)]">{theme.tagline}</p>
            </div>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-[var(--brand-gold-dark)] [@media(hover:hover)]:hidden">
              查看完整範例 →
            </span>
          </Link>
        </Reveal>
      ))}
    </>
  );
}
