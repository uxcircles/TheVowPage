"use client";

import { useRef, useState } from "react";
import { MomentsLightbox } from "./MomentsLightbox";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { momentsViewerCopy } from "@/lib/i18n/dictionaries/template";

/** 3D coverflow-style carousel: 5 cards visible on desktop (center + 2 on
 * each side, the outer pair semi-transparent), 3 on mobile (the outer pair
 * hidden via CSS). Drag/swipe the stage to move between photos, click a
 * side card to bring it to center, click the center card to open the
 * lightbox. */
export function MomentsCarousel({ photoUrls }: { photoUrls: string[] }) {
  const locale = useLocale();
  const [centerIndex, setCenterIndex] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dragRef = useRef<{ startX: number } | null>(null);

  function goTo(i: number) {
    setCenterIndex(Math.max(0, Math.min(photoUrls.length - 1, i)));
  }

  function handlePointerDown(e: React.PointerEvent) {
    dragRef.current = { startX: e.clientX };
  }
  function handlePointerUp(e: React.PointerEvent) {
    const start = dragRef.current;
    dragRef.current = null;
    if (!start) return;
    const deltaX = e.clientX - start.startX;
    const THRESHOLD = 40;
    if (deltaX > THRESHOLD) goTo(centerIndex - 1);
    else if (deltaX < -THRESHOLD) goTo(centerIndex + 1);
  }

  const cards = [-2, -1, 0, 1, 2]
    .map((offset) => ({ offset, i: centerIndex + offset }))
    .filter((c) => c.i >= 0 && c.i < photoUrls.length);

  return (
    <div className="moments-carousel reveal">
      <div
        className="carousel-stage"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {cards.map(({ offset, i }) => {
          const abs = Math.abs(offset);
          const dir = Math.sign(offset);
          const translatePct = abs === 1 ? 68 : 120;
          const rotateDeg = abs === 1 ? 24 : 34;
          const scale = abs === 0 ? 1 : abs === 1 ? 0.82 : 0.65;
          return (
            <button
              type="button"
              key={photoUrls[i] + i}
              className={`carousel-card${abs === 2 ? " is-far" : ""}`}
              style={{
                transform: `translate(-50%, -50%) translateX(${dir * translatePct}%) rotateY(${-dir * rotateDeg}deg) scale(${scale})`,
                opacity: abs === 2 ? 0.45 : 1,
                zIndex: 30 - abs * 10,
              }}
              onClick={() => (offset === 0 ? setOpenIndex(i) : goTo(i))}
              aria-label={offset === 0 ? momentsViewerCopy.zoomAria[locale] : momentsViewerCopy.switchAria[locale]}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrls[i]} alt="" draggable={false} />
            </button>
          );
        })}
      </div>
      <p className="carousel-counter">
        {centerIndex + 1} / {photoUrls.length}
      </p>
      {openIndex !== null && (
        <MomentsLightbox
          photoUrls={photoUrls}
          openIndex={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </div>
  );
}
