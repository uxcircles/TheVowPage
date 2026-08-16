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

/** The screen cutout inside each frame PNG, as a fraction of that phone's
 * own box - i.e. where the frame is transparent, found by scanning each
 * row for a transparent run that doesn't touch either image edge (the
 * background transparency around the phone itself always does touch an
 * edge, which is what separates it from the screen hole). */
const PHONE_1_SCREEN = { left: 32 / 1299, top: 46 / 3086, width: (1180 - 32) / 1299, height: (3037 - 46) / 3086 };
const PHONE_2_SCREEN = { left: 118 / 1298, top: 45 / 3086, width: (1267 - 118) / 1298, height: (3039 - 45) / 3086 };

function PhoneScreen({
  screen,
  children,
}: {
  screen: { left: number; top: number; width: number; height: number };
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute overflow-hidden"
      style={{
        left: `${screen.left * 100}%`,
        top: `${screen.top * 100}%`,
        width: `${screen.width * 100}%`,
        height: `${screen.height * 100}%`,
      }}
    >
      {children}
    </div>
  );
}

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
        <PhoneScreen screen={PHONE_2_SCREEN}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/showcase/demo-rose.jpg"
            alt="喜帖範例頁面截圖"
            className="block w-full animate-hero-screen-pan"
          />
        </PhoneScreen>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/templates/classic/hero-phone-2.webp" alt="" className="absolute inset-0 h-full w-full" />
      </div>

      <div
        ref={phone1Ref}
        className="absolute will-change-transform"
        style={{ left: `${PHONE_1.left * 100}%`, top: `${PHONE_1.top * 100}%`, width: `${PHONE_1.width * 100}%`, aspectRatio: PHONE_1.aspect }}
      >
        <PhoneScreen screen={PHONE_1_SCREEN}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/templates/classic/env.png"
            alt="拆信封畫面"
            className="block h-full w-full object-cover animate-hero-screen-kenburns"
          />
        </PhoneScreen>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/templates/classic/hero-phone-1.webp" alt="" className="absolute inset-0 h-full w-full" />
      </div>
    </div>
  );
}
