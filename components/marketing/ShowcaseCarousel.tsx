"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { ClassicTheme } from "@/components/templates/classic/themes";

const copy = {
  popular: { zh: "熱門配色", en: "Popular" },
  viewExample: { zh: "查看完整範例 →", en: "View full example →" },
};

// The card shows a fixed aspect-[4/5] window (matches the old hero-only
// crop) onto the *top* of a full-page screenshot that's much taller than
// that window. `--scroll-pct` is how far up (in % of the image's own
// height) the image needs to translate for its bottom edge to reach the
// window's bottom - computed per image since each demo page is a
// different total height. Hover-only slow scroll-through, gated by the
// same `@media (hover: hover)` Tailwind's group-hover already implies, so
// touch devices just keep the static top crop (matching their tap-to-open
// fallback link below).
const CONTAINER_ASPECT = 5 / 4; // aspect-[4/5] → height / width

function applyShowcaseScrollPct(img: HTMLImageElement) {
  const imageAspect = img.naturalHeight / img.naturalWidth;
  const scrollPct = Math.max(0, (1 - CONTAINER_ASPECT / imageAspect) * 100);
  img.style.setProperty("--scroll-pct", `-${scrollPct}%`);
}

// A plain `onLoad` prop misses images the browser serves from its disk
// cache and finishes loading before React hydrates and attaches the
// listener - checking `img.complete` in the ref callback covers that race
// as well as the normal not-yet-loaded case.
function showcaseImageRef(img: HTMLImageElement | null) {
  if (!img) return;
  if (img.complete && img.naturalWidth > 0) {
    applyShowcaseScrollPct(img);
  } else {
    img.addEventListener("load", () => applyShowcaseScrollPct(img), { once: true });
  }
}

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
 * The card visual itself is a real, full-page screenshot of the matching
 * demo wedding (public/showcase/demo-{themeId}.jpg, regenerate via
 * scripts/capture-showcase-screenshots.mjs if the demo content changes),
 * not the abstract InvitationCardVisual mockup - a real photo of the actual
 * product reads as more convincing than a generic placeholder. */
export function ShowcaseCarousel({ themes }: { themes: ClassicTheme[] }) {
  const locale = useLocale();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % themes.length), 3200);
    return () => clearInterval(id);
  }, [themes.length]);

  return (
    <>
      {themes.map((theme, i) => (
        <Reveal key={theme.name.zh} delay={(i % 4) * 100}>
          <Link
            href={`/w/demo-${theme.id}`}
            className={`group block transition-transform duration-500 ease-out ${
              active === i ? "-translate-y-2" : ""
            }`}
          >
            <div className="relative aspect-[4/5] w-full rounded-lg shadow-[0_20px_45px_-25px_rgba(60,53,44,0.45)]">
              {active === i && (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--brand-gold-dark)] px-3 py-1 text-xs text-white shadow-sm">
                  {copy.popular[locale]}
                </span>
              )}
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={showcaseImageRef}
                  src={`/showcase/demo-${theme.id}.jpg`}
                  alt={theme.name[locale]}
                  className="absolute inset-x-0 top-[-11%] w-full translate-y-0 transition-transform duration-[6000ms] ease-in-out group-hover:translate-y-[var(--scroll-pct)] group-hover:duration-[14000ms] group-hover:ease-linear"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 px-6 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
                <span className="rounded-full bg-white px-5 py-2.5 text-center text-sm font-medium text-foreground shadow-sm">
                  {copy.viewExample[locale]}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-medium text-foreground">{theme.name[locale]}</p>
              <p className="text-sm text-[var(--brand-ink-soft)]">{theme.tagline[locale]}</p>
            </div>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-[var(--brand-gold-dark)] [@media(hover:hover)]:hidden">
              {copy.viewExample[locale]}
            </span>
          </Link>
        </Reveal>
      ))}
    </>
  );
}
