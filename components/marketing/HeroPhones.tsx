"use client";

import { useEffect, useRef } from "react";

/** Position/size of each phone as a fraction of the shared container,
 * measured directly off the original merged mockup (2783x3690): phone 1
 * sits flush to the top-right, phone 2 sits lower-left, offset down by
 * exactly the gap between them. Keeping the two images separate (instead
 * of one merged image) is what lets them parallax at different speeds. */
const CONTAINER_ASPECT = "2783 / 3690";
const PHONE_1 = { left: 1484 / 2783, top: 0, width: 1299 / 2783 };
const PHONE_2 = { left: 0, top: 604 / 3690, width: 1298 / 2783 };

export function HeroPhones() {
  const phone1Ref = useRef<HTMLImageElement>(null);
  const phone2Ref = useRef<HTMLImageElement>(null);

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={phone2Ref}
        src="/templates/classic/hero-phone-2.webp"
        alt=""
        className="absolute will-change-transform"
        style={{ left: `${PHONE_2.left * 100}%`, top: `${PHONE_2.top * 100}%`, width: `${PHONE_2.width * 100}%` }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={phone1Ref}
        src="/templates/classic/hero-phone-1.webp"
        alt="喜帖範例畫面"
        className="absolute will-change-transform"
        style={{ left: `${PHONE_1.left * 100}%`, top: `${PHONE_1.top * 100}%`, width: `${PHONE_1.width * 100}%` }}
      />
    </div>
  );
}
