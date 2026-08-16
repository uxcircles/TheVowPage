"use client";

import { useEffect, useRef } from "react";

/** Position/size of each phone as a fraction of the shared container.
 * Originally measured directly off the original merged mockup
 * (2783x3690): phone 1 sits flush to the top-right, phone 2 lower-left.
 * PHONE_2.top has since been hand-tuned upward from that measured value,
 * shortening the vertical stagger between the two. Keeping the two
 * images separate (instead of one merged image) is what lets them
 * parallax at different speeds. */
const CONTAINER_ASPECT = "2783 / 3690";
const PHONE_1 = { left: 1484 / 2783, top: 0, width: 1299 / 2783, aspect: "1299 / 3086" };
const PHONE_2 = { left: 0, top: 0.123686, width: 1298 / 2783, aspect: "1298 / 3086" };

/** The screen cutout inside each frame PNG, as a fraction of that phone's
 * own box - i.e. where the frame is transparent, found by scanning each
 * row for a transparent run that doesn't touch either image edge (the
 * background transparency around the phone itself always does touch an
 * edge, which is what separates it from the screen hole). Both frames
 * show the phone's near edge flush against the viewer (thin bezel) and
 * its far edge turned away (visible side/thickness) - 1.png's near edge
 * is on the left, 2.png's on the right - which is what the "origin" side
 * in PhoneScreen below is for: a flat screenshot dropped straight into
 * this rectangular hole looks pasted-on, since it doesn't share the
 * frame's own perspective, so PhoneScreen re-applies that same tilt to
 * the content before the frame clips it back down to the hole shape. */
const PHONE_1_SCREEN = { left: 32 / 1299, top: 46 / 3086, width: (1180 - 32) / 1299, height: (3037 - 46) / 3086 };
const PHONE_2_SCREEN = { left: 118 / 1298, top: 45 / 3086, width: (1267 - 118) / 1298, height: (3039 - 45) / 3086 };

function PhoneScreen({
  screen,
  originSide,
  rotateDeg,
  extraLeftInset = 0,
  override,
  children,
}: {
  screen: { left: number; top: number; width: number; height: number };
  /** Which edge of the screen is closest to the viewer in the frame's own
   * render - that edge stays put; the opposite edge is the one that tilts
   * away, so it's the pivot for the rotateY below. */
  originSide: "left" | "right";
  rotateDeg: number;
  /** Extra pull-in from the left specifically, beyond SAFETY - both
   * frames render some of the phone's own side/thickness as visually
   * part of the left portion of the screen area, which isn't actually
   * screen at all, so the safety-only inset wasn't enough there. */
  extraLeftInset?: number;
  /** Bypasses the screen+SAFETY+extraLeftInset math below entirely and
   * uses these exact fractions instead - found by hand (via the browser
   * inspector) to sit tighter against the bezel than the computed values
   * for this particular phone/image pairing. */
  override?: { left: number; top: number; width: number; height: number };
  children: React.ReactNode;
}) {
  // Inward pull beyond the measured hole so this box's sharp corners
  // tuck fully under the frame's rounded bezel instead of poking past it
  // right at the curve (the hole itself is rounded; this box is a plain
  // rectangle). The frame image painted on top still does the final
  // precise clipping to the hole's true shape either way - this is just
  // to stay safely inside it.
  const SAFETY = 0.01;

  const left = override ? override.left : screen.left + SAFETY + extraLeftInset;
  const top = override ? override.top : screen.top + SAFETY;
  const width = override ? override.width : screen.width - SAFETY * 2 - extraLeftInset;
  const height = override ? override.height : screen.height - SAFETY * 2;

  return (
    <div
      className="absolute"
      style={{
        left: `${left * 100}%`,
        top: `${top * 100}%`,
        width: `${width * 100}%`,
        height: `${height * 100}%`,
        perspective: "900px",
      }}
    >
      <div
        className="h-full w-full overflow-hidden rounded-[12%]"
        style={{
          transform: `rotateY(${originSide === "left" ? -rotateDeg : rotateDeg}deg)`,
          transformOrigin: originSide === "left" ? "left center" : "right center",
        }}
      >
        {children}
      </div>
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
      if (phone1Ref.current) phone1Ref.current.style.transform = `translateY(${Math.min(y * 0.05, 40)}px)`;
      if (phone2Ref.current) phone2Ref.current.style.transform = `translateY(${-Math.min(y * 0.12, 90)}px)`;
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
        {/* Soft glow behind this phone specifically, so it doesn't look
         * like it's floating flat against the page background - sized
         * off the phone's own width (not its height) so it reads as a
         * centered halo rather than a tall oval, and sits behind via DOM
         * order, no z-index needed since nothing here sets one. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-2xl"
          style={{
            background:
              "radial-gradient(closest-side, var(--brand-gold) 0%, transparent 70%)",
          }}
        />
        <PhoneScreen
          screen={PHONE_2_SCREEN}
          originSide="right"
          rotateDeg={14}
          override={{ left: 0.085909, top: 0.024582, width: 0.890208, height: 0.950188 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/showcase/demo-gold.jpg"
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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-2xl"
          style={{
            background:
              "radial-gradient(closest-side, var(--brand-gold) 0%, transparent 70%)",
          }}
        />
        <PhoneScreen
          screen={PHONE_1_SCREEN}
          originSide="left"
          rotateDeg={14}
          override={{ left: 0.0196343, top: 0.024906, width: 0.908757, height: 0.949216 }}
        >
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
