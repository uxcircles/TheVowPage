"use client";

import { useEffect } from "react";

/** Full-screen click-to-zoom viewer shared by both the grid and carousel
 * moments styles - prev/next, Escape, click-outside to close, all driven by
 * the parent's `openIndex` state rather than owning it, since both callers
 * need that index for their own card highlighting too. */
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
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((openIndex - 1 + photoUrls.length) % photoUrls.length);
      if (e.key === "ArrowRight") onNavigate((openIndex + 1) % photoUrls.length);
    }
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, photoUrls.length]);

  return (
    <div className="lightbox is-open" onClick={onClose}>
      <button type="button" className="lightbox-close" aria-label="關閉" onClick={onClose}>
        &times;
      </button>
      <button
        type="button"
        className="lightbox-nav lightbox-prev"
        aria-label="上一張"
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
        aria-label="下一張"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((openIndex + 1) % photoUrls.length);
        }}
      >
        &#8250;
      </button>
    </div>
  );
}
