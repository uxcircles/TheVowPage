"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { momentsViewerCopy } from "@/lib/i18n/dictionaries/template";

/** Full-screen click-to-zoom viewer shared by both the grid and carousel
 * moments styles - prev/next, Escape, click-outside to close, all driven by
 * the parent's `openIndex` state rather than owning it, since both callers
 * need that index for their own card highlighting too.
 *
 * Rendered via a portal to the page's `.classic` root rather than in place:
 * the carousel style's root has the `.reveal` scroll-in class, which sets a
 * CSS `transform` (even `translateY(0)` once revealed) - any transform on
 * an ancestor turns this overlay's `position: fixed` into `position:
 * absolute` relative to that ancestor instead of the viewport, so without
 * the portal the "full-screen" backdrop only covers the moments section's
 * own box. Portaling to `.classic` (rather than all the way to
 * `document.body`) keeps it outside that transformed ancestor while
 * staying inside the `.classic .lightbox`-scoped stylesheet. */
export function MomentsLightbox({
  photoUrls,
  openIndex,
  onClose,
  onNavigate,
}: {
  photoUrls: string[];
  openIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const locale = useLocale();
  // Locks background scroll for as long as the lightbox is mounted (open to
  // close, not re-run per photo navigated to). `overflow: hidden` on body
  // alone doesn't stop touch-scroll on iOS Safari, which still rubber-bands
  // the page underneath - pinning body to the current scroll position via
  // `position: fixed` is the reliable cross-browser way to actually lock it.
  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const prev = { position: body.style.position, top: body.style.top, width: body.style.width };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      // `behavior: "instant"` overrides the template's global
      // `scrollBehavior: smooth` (set for the calendar/anchor links) - without
      // it, restoring scroll here visibly animates from the top back down to
      // where the user was, instead of landing there instantly.
      window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((openIndex - 1 + photoUrls.length) % photoUrls.length);
      if (e.key === "ArrowRight") onNavigate((openIndex + 1) % photoUrls.length);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openIndex, photoUrls.length, onClose, onNavigate]);

  return createPortal(
    <div className="lightbox is-open" onClick={onClose}>
      <button type="button" className="lightbox-close" aria-label={momentsViewerCopy.closeAria[locale]} onClick={onClose}>
        &times;
      </button>
      <button
        type="button"
        className="lightbox-nav lightbox-prev"
        aria-label={momentsViewerCopy.prevAria[locale]}
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((openIndex - 1 + photoUrls.length) % photoUrls.length);
        }}
      >
        &#8249;
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="lightbox-img"
        src={photoUrls[openIndex]}
        alt=""
        onClick={(e) => e.stopPropagation()}
      />
      <button
        type="button"
        className="lightbox-nav lightbox-next"
        aria-label={momentsViewerCopy.nextAria[locale]}
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((openIndex + 1) % photoUrls.length);
        }}
      >
        &#8250;
      </button>
    </div>,
    document.querySelector(".classic") ?? document.body
  );
}
