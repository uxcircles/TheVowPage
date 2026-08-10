"use client";

import { useState } from "react";
import { MomentsLightbox } from "./MomentsLightbox";

/** Masonry photo wall + click-to-zoom lightbox - the v1-style alternative to
 * the scroll-scrubbed polaroid stack, for weddings with more photos where
 * guests actually want to browse each one closely rather than watch a
 * passive animation. */
export function MomentsGrid({ photoUrls }: { photoUrls: string[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="moments-grid">
        {photoUrls.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={url + i} className="reveal" src={url} alt="" onClick={() => setOpenIndex(i)} />
        ))}
      </div>
      {openIndex !== null && (
        <MomentsLightbox
          photoUrls={photoUrls}
          openIndex={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </>
  );
}
