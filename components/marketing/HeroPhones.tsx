"use client";

import { useEffect, useRef } from "react";

/** Position/size of each phone as a fraction of the shared container,
 * measured directly off the original merged mockup (2783x3690): phone 1
 * sits flush to the top-right, phone 2 sits lower-left, offset down by
 * exactly the gap between them. Keeping the two images separate (instead
 * of one merged image) is what lets them parallax at different speeds. */
const CONTAINER_ASPECT = "2783 / 3690";
const PHONE_1 = { left: 1484 / 2783, top: 0, width: 1299 / 2783, aspect: "1299 / 3086" };
const PHONE_2 = { left: 0, top: 604 / 3690, width: 1298 / 2783, aspect: "1298 / 3086" };

/** The screen cutout inside hero-phone-2.webp, as a fraction of that
 * phone's own box - i.e. where the frame PNG is transparent, found by
 * scanning each row for a transparent run that doesn't touch either
 * image edge (the actual background transparency around the phone
 * always does touch an edge, so this isolates just the screen hole). */
const PHONE_2_SCREEN = { left: 118 / 1298, top: 45 / 3086, width: (1267 - 118) / 1298, height: (3039 - 45) / 3086 };

export function HeroPhones() {
  const phone1Ref = useRef<HTMLDivElement>(null);
  const phone2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    function update() {
      const y = window.scrollY;
      if (phone1Ref.current) phone1Ref.current.style.transform = `translateY(${-Math.min(y * 0.12, 90)}px)`;
      if (phone2Ref.current) phone2Ref.current.style.transform = `translateY(${-Math.min(y * 0.06, 50)}px)`;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative w-full" style={{ aspectRatio: CONTAINER_ASPECT }}>
      <div
        ref={phone2Ref}
        className="absolute will-change-transform"
        style={{ left: `${PHONE_2.left * 100}%`, top: `${PHONE_2.top * 100}%`, width: `${PHONE_2.width * 100}%`, aspectRatio: PHONE_2.aspect }}
      >
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${PHONE_2_SCREEN.left * 100}%`,
            top: `${PHONE_2_SCREEN.top * 100}%`,
            width: `${PHONE_2_SCREEN.width * 100}%`,
            height: `${PHONE_2_SCREEN.height * 100}%`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/showcase/demo-rose.jpg"
            alt="喜帖範例頁面截圖"
            className="block w-full animate-hero-screen-pan"
          />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/templates/classic/hero-phone-2.webp" alt="" className="absolute inset-0 h-full w-full" />
      </div>

      <div
        ref={phone1Ref}
        className="absolute will-change-transform"
        style={{ left: `${PHONE_1.left * 100}%`, top: `${PHONE_1.top * 100}%`, width: `${PHONE_1.width * 100}%`, aspectRatio: PHONE_1.aspect }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/templates/classic/hero-phone-1.webp" alt="" className="absolute inset-0 h-full w-full" />
      </div>
    </div>
  );
}
