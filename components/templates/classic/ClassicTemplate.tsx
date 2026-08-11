"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EB_Garamond, Noto_Serif_TC } from "next/font/google";
import "./classic.css";
import type { ClassicTemplateData } from "./types";
import { getClassicTheme, getEnvelopeImages } from "./themes";
import { getSealDesign, getSealImage } from "./seals";
import { getMomentsStyle } from "./momentsStyles";
import { ScratchCard } from "./ScratchCard";
import { MomentsGrid } from "./MomentsGrid";
import { MomentsCarousel } from "./MomentsCarousel";
import { VenueMap } from "./VenueMap";
import { RsvpSection } from "./RsvpForm";
import { useReveal } from "./useReveal";
import { buildGoogleCalendarUrl, buildIcsDataUrl, scheduleDetails } from "./calendar";

const displayFont = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
  variable: "--classic-font-display",
});

const bodyFont = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--classic-font-body",
});

const FLOWER_PATH =
  "M0.205078 222.358C6.87174 225.358 29.9051 228.458 68.7051 216.858C117.205 202.358 144.604 188.358 165.705 188.358C186.205 188.358 199.626 193.357 206.205 203.357C218.705 222.358 237.705 262.857 238.705 267.357C239.705 271.857 228.205 240.857 228.205 233.857M228.205 233.857C227.705 230.857 226.705 218.358 225.705 214.858C224.705 211.358 218.205 205.858 216.705 198.858C215.205 191.858 206.205 164.857 208.705 167.358C211.205 169.858 216.705 188.358 216.705 190.858C216.705 193.358 208.705 188.358 201.705 182.858C194.705 177.358 177.205 171.858 165.705 167.358C154.205 162.858 156.205 150.858 149.705 142.358C143.205 133.858 131.705 132.358 127.205 131.358C122.705 130.358 131.705 133.858 138.705 135.358C145.705 136.858 158.705 135.358 177.205 139.858C195.705 144.358 205.286 158.679 207.205 160.357C211.205 163.857 217.205 164.358 221.205 161.358C225.205 158.357 225.624 154.857 225.624 143.357C225.624 131.857 217.205 117.857 189.705 104.857C167.705 94.4572 141.872 105.857 131.705 112.857C137.872 111.857 151.905 109.857 158.705 109.857C171.205 109.857 179.205 114.357 189.705 126.357C200.205 138.357 200.705 143.357 201.705 148.357C202.705 153.357 202.205 158.357 204.205 164.857C206.205 171.357 217.705 197.357 221.205 203.357C221.677 204.166 222.149 205.184 222.612 206.357M228.205 233.857C228.705 236.857 222.705 224.021 221.205 214.858C219.705 205.695 223.205 128.858 223.205 119.358C223.205 109.857 223.205 88.3577 223.205 83.8577C223.205 80.2577 220.872 65.3577 219.705 58.3577C219.155 55.0558 217.705 56.3577 217.705 60.3577C217.705 65.3577 219.705 104.358 226.705 105.858C233.705 107.358 236.705 104.358 240.205 95.8578C243.705 87.3578 251.705 68.8578 261.705 54.3578C271.705 39.8578 288.705 25.3578 295.205 23.3578C301.705 21.3578 297.205 17.8578 284.705 19.3578C272.205 20.8578 254.205 40.3577 249.705 44.3577C245.205 48.3577 243.205 54.3578 232.205 54.3578C221.205 54.3578 211.205 52.8577 211.705 41.8577C212.205 30.8577 216.205 19.8577 234.205 10.8577C252.205 1.85765 259.705 -2.14235 270.205 2.35765C280.705 6.85765 299.205 18.8574 290.705 29.3574C282.205 39.8574 255.205 48.8574 249.705 50.8574C244.205 52.8574 238.705 55.8574 240.205 50.8574C241.705 45.8574 247.205 29.8574 249.705 29.8574C252.205 29.8574 249.517 40.8574 245.205 48.3574C240.893 55.8574 227.747 56.8574 223.205 56.8574C221.205 56.8574 218.916 56.5082 218.916 56.5082M228.205 233.857C228.205 227.801 225.585 213.885 222.612 206.357M428.205 173.357C423.038 175.357 409.605 178.157 397.205 173.357C381.705 167.358 354.205 149.857 315.705 151.857C277.205 153.857 254.705 162.857 245.705 178.857C242.505 184.546 239.748 191.119 237.725 197.857M237.725 197.857C234.058 210.074 234.305 229.335 237.205 238.357C241.705 252.357 241.661 239.858 239.205 224.857C236.749 209.857 237.205 183.357 249.205 177.357C261.205 171.357 268.705 169.857 278.705 171.357C288.705 172.857 295.205 175.357 294.205 175.857C293.205 176.357 282.205 174.357 278.705 178.857C275.205 183.357 277.205 187.358 272.205 190.858C267.205 194.357 252.205 194.857 247.705 199.857C243.205 204.857 237.705 210.357 237.205 217.857C236.805 223.857 235.78 230.024 235.947 232.857C234.447 221.524 233.005 197.257 234.205 186.857C235.705 173.857 239.334 160.055 244.705 153.857C251.205 146.357 261.705 145.857 266.705 136.857C272.311 126.767 272.177 116.077 271.705 111.357C271.205 106.357 269.705 101.857 267.705 102.857C265.705 103.857 266.422 105.423 261.705 114.857C257.705 122.857 250.082 131.727 247.705 138.857C246.205 143.357 245.662 150.431 256.205 149.268C257.735 149.1 259.551 148.801 261.705 148.357C278.705 144.857 298.848 140.357 311.705 131.357C321.705 124.357 325.705 119.857 331.205 118.357C337.931 116.523 341.897 117.36 348.205 120.948M348.205 120.948C348.698 121.229 349.198 121.531 349.705 121.857C356.705 126.357 365.705 128.857 368.205 126.357C370.705 123.857 357.299 109.542 345.205 99.3574C335.705 91.3574 324.205 84.8571 317.705 80.8574C311.317 76.9268 290.705 65.3574 278.705 67.3574C266.786 69.3439 262.705 75.358 264.205 83.8577C265.705 92.3574 267.944 101.981 280.205 111.357C288.705 117.857 296.205 120.948 304.705 119.357C311.705 118.047 318.705 112.357 326.205 112.857C332.205 113.257 343.372 118.418 348.205 120.948ZM365.705 121.857C360.538 115.691 345.805 102.957 328.205 101.357C315.705 100.221 305.205 101.357 296.205 104.857C291.005 106.88 285.306 109.151 282.205 110.357M282.205 110.357C279.94 111.239 279.76 111.357 278.705 111.357C276.205 111.357 289.291 89.2716 290.705 87.8574C293.205 85.3574 295.705 86.3574 293.205 92.3574C291.205 97.1574 284.538 106.496 282.205 110.357ZM256.205 149.268C253.705 150.298 248.105 153.557 245.705 158.357C242.705 164.357 239.833 173.949 238.705 180.857C237.725 186.857 238.052 194.524 237.725 197.857M237.725 104.857C236.219 105.024 232.705 106.257 230.705 109.857C228.205 114.357 227.705 116.857 226.705 123.857C225.705 130.857 225.205 164.357 224.205 174.857C223.405 183.257 222.81 199.357 222.612 206.357";

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function ClassicTemplate({ data }: { data: ClassicTemplateData }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroFrameRef = useRef<HTMLDivElement>(null);
  const momentsSectionRef = useRef<HTMLElement>(null);
  const stackViewportRef = useRef<HTMLDivElement>(null);
  const scheduleSectionRef = useRef<HTMLDivElement>(null);
  const flowerWrapRef = useRef<HTMLDivElement>(null);
  const flowerPathRef = useRef<SVGPathElement>(null);
  const scheduleEyebrowRef = useRef<HTMLParagraphElement>(null);
  const calendarCtaRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const footerPhotoRef = useRef<HTMLImageElement>(null);
  const footerThanksRef = useRef<HTMLParagraphElement>(null);
  const footerNamesRef = useRef<HTMLParagraphElement>(null);
  const footerCreditRef = useRef<HTMLParagraphElement>(null);
  const timelineItemRefs = useRef<(HTMLElement | undefined)[]>([]);

  const [envelopeState, setEnvelopeState] = useState<"locked" | "opening" | "hidden">("locked");
  const eventDate = data.eventDate ? new Date(data.eventDate) : null;
  const momentsStyle = getMomentsStyle(data.momentsStyle);

  useReveal(rootRef);

  // Envelope open + scroll lock
  useEffect(() => {
    if (envelopeState === "locked") {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "";
      document.body.style.height = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, [envelopeState]);

  useEffect(() => {
    // Applied to <body> (not the .classic wrapper) so it doesn't create a
    // nested scroll container - that would break position:sticky in the
    // moments stack below.
    document.documentElement.style.scrollBehavior = "smooth";
    document.body.style.overflowX = "hidden";
    return () => {
      document.documentElement.style.scrollBehavior = "";
      document.body.style.overflowX = "";
    };
  }, []);

  function openEnvelope() {
    setEnvelopeState("opening");
    setTimeout(() => {
      setEnvelopeState("hidden");
      heroFrameRef.current?.classList.add("in");
    }, 450);
  }

  // Moments: scroll-scrubbed polaroid stack (only when that style is
  // selected - the grid style renders neither ref's DOM node, so this
  // would no-op anyway via the null checks below, but skipping it outright
  // avoids attaching scroll/resize listeners that will never do anything)
  useEffect(() => {
    if (momentsStyle.id !== "stack") return;
    const section = momentsSectionRef.current;
    const viewport = stackViewportRef.current;
    if (!section || !viewport || data.momentPhotoUrls.length === 0) return;

    const photos = Array.from(viewport.querySelectorAll<HTMLElement>(".polaroid"));
    const N = photos.length;
    const SEGMENT_RATIO = 0.9;
    const rotations = [-4, 6, -8, 5, -7, 9, -5, 7, -9, 4, -6, 8, -4, 7, -8];
    const depthKeyframes = [
      { x: 0, y: 0, scale: 1.0, opacity: 1.0 },
      { x: 14, y: 18, scale: 0.965, opacity: 0.9 },
      { x: 26, y: 32, scale: 0.93, opacity: 0.75 },
      { x: 36, y: 46, scale: 0.9, opacity: 0.0 },
    ];

    let stableVH = window.innerHeight;
    let lastVW = window.innerWidth;
    function getStableVH() {
      if (window.innerWidth !== lastVW) {
        lastVW = window.innerWidth;
        stableVH = window.innerHeight;
      }
      return stableVH;
    }

    function update() {
      const vh = getStableVH();
      const totalScrollable = section!.offsetHeight - vh;
      const rect = section!.getBoundingClientRect();
      const scrolled = clamp(-rect.top, 0, Math.max(totalScrollable, 0));
      const progress = totalScrollable > 0 ? scrolled / totalScrollable : 0;
      const rawIndex = 1 + progress * (N - 1);

      photos.forEach((el, i) => {
        const rot = rotations[i % rotations.length];
        const dir = i === 0 ? 0 : i % 2 === 1 ? 1 : -1;
        const e = clamp(rawIndex - i, 0, 1);
        const a = clamp(rawIndex - i - 1, 0, 3);

        let x: number, y: number, scale: number, opacity: number, rotation: number;

        if (e < 1) {
          const te = easeOutCubic(e);
          const startX = dir * (window.innerWidth / 2 + 220);
          const startY = -40;
          const startRot = rot + dir * 18;
          x = lerp(startX, 0, te);
          y = lerp(startY, 0, te);
          scale = lerp(1.04, 1, te);
          opacity = lerp(0, 1, te);
          rotation = lerp(startRot, rot, te);
        } else {
          const lo = Math.floor(a);
          const hi = Math.min(lo + 1, 3);
          const t = a - lo;
          const A = depthKeyframes[lo];
          const B = depthKeyframes[hi];
          x = lerp(A.x, B.x, t);
          y = lerp(A.y, B.y, t);
          scale = lerp(A.scale, B.scale, t);
          opacity = lerp(A.opacity, B.opacity, t);
          rotation = rot;
        }

        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.zIndex = String(100 + i);
      });
    }

    function layout() {
      const vh = getStableVH();
      const segment = vh * SEGMENT_RATIO;
      section!.style.height = vh + (N - 1) * segment + "px";
      update();
    }

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", layout);
    layout();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", layout);
    };
  }, [data.momentPhotoUrls.length, momentsStyle.id]);

  // Schedule: flower draws in, then timeline + calendar + footer items
  // reveal. The flower/timeline (wrap/path) are optional - showSchedule can
  // hide them - but the footer reveal must keep working regardless, so it's
  // anchored on the always-present schedule section rather than the flower.
  useEffect(() => {
    const wrap = flowerWrapRef.current;
    const section = scheduleSectionRef.current;
    const path = flowerPathRef.current;
    const footer = footerRef.current;
    if (!section || !footer) return;

    const items = [
      scheduleEyebrowRef.current,
      ...timelineItemRefs.current,
      calendarCtaRef.current,
      footerPhotoRef.current,
      footerThanksRef.current,
      footerNamesRef.current,
      footerCreditRef.current,
    ].filter((el): el is HTMLElement => Boolean(el));

    const len = path?.getTotalLength() ?? 0;
    if (path) {
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = String(len);
    }

    let stableVH = window.innerHeight;
    let lastVW = window.innerWidth;
    function getStableVH() {
      if (window.innerWidth !== lastVW) {
        lastVW = window.innerWidth;
        stableVH = window.innerHeight;
      }
      return stableVH;
    }

    function bandProgress(el: HTMLElement, startVH: number, endVH: number) {
      const r = el.getBoundingClientRect();
      const vh = getStableVH();
      const total = vh * startVH - vh * endVH + r.height;
      const scrolled = vh * startVH - r.top;
      return clamp(total > 0 ? scrolled / total : 0, 0, 1);
    }

    function scrollBandProgress(startScrollY: number) {
      const vh = getStableVH();
      const endScrollY = document.documentElement.scrollHeight - vh;
      const total = endScrollY - startScrollY;
      const scrolled = window.scrollY - startScrollY;
      return clamp(total > 0 ? scrolled / total : 0, 0, 1);
    }

    function update() {
      if (wrap && path) {
        const flowerProgress = bandProgress(wrap, 0.8, -0.6);
        path.style.strokeDashoffset = String(len * (1 - flowerProgress));
      }

      const itemsStart = section!.offsetTop - getStableVH() * 0.7;
      const itemsProgress = scrollBandProgress(itemsStart);
      // Each item's own reveal (fade + slide) takes this fraction of the
      // scroll band. Start positions are spread evenly across the
      // remaining [0, 1 - duration] range so the count of items - which
      // varies with the couple's schedule length - can't push any item's
      // start past the point where it'd never reach full opacity.
      const revealDuration = 0.19;
      items.forEach((li, i) => {
        const start =
          items.length > 1 ? (i / (items.length - 1)) * (1 - revealDuration) : 0;
        const p = clamp((itemsProgress - start) / revealDuration, 0, 1);
        li.style.opacity = String(p);
        li.style.transform = `translateY(${lerp(16, 0, p)}px)`;
      });
    }

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", update);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [data.schedule.length, data.showSchedule]);

  // Add-to-calendar: Google link is a deterministic URL, safe to compute
  // during render. The .ics link needs a client-only Blob URL, so it's
  // filled in imperatively after mount (see effect below) to avoid a
  // server/client hydration mismatch on a random blob: URL.
  const eventTime = eventDate?.getTime() ?? null;
  const googleCalendarUrl = useMemo(() => {
    if (!eventDate) return null;
    const title = `${data.groomName} ＆ ${data.brideName} 婚禮晚宴`;
    const location = [data.venueName, data.venueHall, data.venueAddress].filter(Boolean).join("，");
    const details = scheduleDetails(data.schedule);
    const start = eventDate;
    const end = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);
    return buildGoogleCalendarUrl({ title, location, details, start, end });
  }, [eventTime, data.groomName, data.brideName, data.venueName, data.venueHall, data.venueAddress, data.schedule]);

  const icsLinkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!eventDate || !icsLinkRef.current) return;
    const title = `${data.groomName} ＆ ${data.brideName} 婚禮晚宴`;
    const location = [data.venueName, data.venueHall, data.venueAddress].filter(Boolean).join("，");
    const details = scheduleDetails(data.schedule);
    const start = eventDate;
    const end = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);
    const ics = buildIcsDataUrl({
      title,
      location,
      details,
      start,
      end,
      uid: `${data.weddingId}@classic-wedding`,
    });
    icsLinkRef.current.href = ics;
    icsLinkRef.current.download = `${data.groomName}${data.brideName}婚禮.ics`;
    return () => URL.revokeObjectURL(ics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTime, data.groomName, data.brideName, data.venueName, data.venueHall, data.venueAddress, data.schedule, data.weddingId]);

  const venueLabel = [data.venueName, data.venueHall].filter(Boolean).join(" ・ ");
  const theme = getClassicTheme(data.theme);
  const seal = getSealDesign(data.sealDesign);
  const envelopeImages = getEnvelopeImages(theme.id);

  return (
    <div
      ref={rootRef}
      className={`classic ${displayFont.variable} ${bodyFont.variable}`}
      style={
        {
          "--cream": theme.cream,
          "--cream-deep": theme.creamDeep,
          "--ink": theme.ink,
          "--ink-soft": theme.inkSoft,
          "--gold": theme.gold,
          "--line": theme.line,
          "--envelope-shadow-rgb": theme.envelopeShadowRgb,
        } as React.CSSProperties
      }
    >
      <div
        className={`envelope-intro${envelopeState === "opening" ? " is-opening" : ""}${
          envelopeState === "hidden" ? " is-hidden" : ""
        }`}
        style={envelopeState === "hidden" ? { display: "none" } : undefined}
      >
        <div className="envelope-stage">
          <div className="envelope-bottom-stack">
            <img
              className={`envelope-bottom-frame is-base${envelopeState !== "locked" ? " is-fading-base" : ""}`}
              src={envelopeImages.bottom}
              alt=""
            />
          </div>
          <div className="envelope-top-group">
            <img className="envelope-flap" src={envelopeImages.flap} alt="" />
            <button type="button" className="wax-seal" aria-label="拆開信封" onClick={openEnvelope}>
              <img src={getSealImage(seal, theme.id)} alt="" />
            </button>
          </div>
        </div>
        <p className="envelope-hint">點擊封蠟，拆開信封</p>
      </div>

      <section className="hero">
        <img
          className="bg-illus is-left"
          src="/templates/classic/illus-doves-heart.png"
          alt=""
          aria-hidden="true"
        />
        <div className="frame reveal" id="hero-frame" ref={heroFrameRef}>
          {data.heroPhotoUrl ? (
            <img className="photo-slot" src={data.heroPhotoUrl} alt={`${data.groomName} 與 ${data.brideName}`} />
          ) : (
            <div className="photo-slot" />
          )}
          <img className="bg-illus" src="/templates/classic/illus-sprig.png" alt="" aria-hidden="true" />
        </div>
        <p className="eyebrow reveal">wedding invitation</p>
        <p className="name-logo reveal">
          {data.groomName || data.groomLabel} ＆ {data.brideName || data.brideLabel}
        </p>
      </section>

      <ScratchCard eventDate={eventDate} venueLabel={venueLabel} timeZone={data.timezone} theme={theme} />

      {data.showFamily && (
        <section className="family">
          <p className="eyebrow reveal">our families</p>
          <div className="family-grid">
            <div className="side reveal">
              <p className="role">{data.groomLabel}</p>
              <p className="name">{data.groomName || data.groomLabel}</p>
              <p className="parents">
                {[data.groomParents, data.groomParentsRelation].filter(Boolean).join("　")}
              </p>
            </div>
            <div className="amp reveal">&amp;</div>
            <div className="side reveal">
              <p className="role">{data.brideLabel}</p>
              <p className="name">{data.brideName || data.brideLabel}</p>
              <p className="parents">
                {[data.brideParents, data.brideParentsRelation].filter(Boolean).join("　")}
              </p>
            </div>
          </div>
          {data.familyPhotoUrl && (
            <div className="family-photo-wrap">
              <img className="family-photo reveal" src={data.familyPhotoUrl} alt="新人合影" />
            </div>
          )}
          <img className="bg-illus is-left" src="/templates/classic/illus-peony-stem.png" alt="" aria-hidden="true" />
        </section>
      )}

      {data.momentPhotoUrls.length > 0 && (
        <>
          <div className="section-divider">
            <img src="/templates/classic/illus-heart-vine-divider.png" alt="" aria-hidden="true" />
          </div>
          <p className="eyebrow moments-label reveal">moments</p>
          {momentsStyle.id === "grid" ? (
            <MomentsGrid photoUrls={data.momentPhotoUrls} />
          ) : momentsStyle.id === "carousel" ? (
            <MomentsCarousel photoUrls={data.momentPhotoUrls} />
          ) : (
            <section className="moments" ref={momentsSectionRef}>
              <div className="stack-viewport" ref={stackViewportRef}>
                {data.momentPhotoUrls.map((url, i) => (
                  <div className="polaroid" key={url + i}>
                    <img src={url} alt="" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <section className="venue">
        <img className="bg-illus" src="/templates/classic/illus-venue-building.png" alt="" aria-hidden="true" />
        <p className="eyebrow reveal">venue</p>
        <h2 className="reveal">{data.venueName || "場地籌備中"}</h2>
        {data.venueHall && <p className="hall reveal">{data.venueHall}</p>}
        {data.venueAddress && <p className="addr reveal">{data.venueAddress}</p>}
        {data.venueAddress && (
          <a
            className="map-link reveal"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.venueAddress)}`}
            target="_blank"
            rel="noopener"
          >
            open map →
          </a>
        )}
        {data.venueLat !== null && data.venueLng !== null && (
          <div className="map-wrap reveal">
            <VenueMap lat={data.venueLat} lng={data.venueLng} label={data.venueName} />
          </div>
        )}
      </section>

      <section className="schedule" ref={scheduleSectionRef}>
        {data.showSchedule && (
          <>
            <div className="flower-wrap" ref={flowerWrapRef}>
              <svg viewBox="0 0 429 269" xmlns="http://www.w3.org/2000/svg">
                <path ref={flowerPathRef} d={FLOWER_PATH} />
              </svg>
            </div>
            <p className="eyebrow" ref={scheduleEyebrowRef}>
              schedule
            </p>
            {data.schedule.length > 0 && (
              <ul className="timeline">
                {data.schedule.map((item, i) => (
                  <li
                    key={i}
                    ref={(el) => {
                      timelineItemRefs.current[i] = el ?? undefined;
                      return () => {
                        timelineItemRefs.current[i] = undefined;
                      };
                    }}
                  >
                    <span className="time">{item.time}</span>
                    <span className="event">{item.event}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <div className="calendar-cta" ref={calendarCtaRef}>
          {googleCalendarUrl && (
            <>
              <a className="cal-btn" href={googleCalendarUrl} target="_blank" rel="noopener">
                + Google 日曆
              </a>
              <a className="cal-btn" ref={icsLinkRef}>
                + Apple / Outlook
              </a>
            </>
          )}
        </div>
        <img
          className="bg-illus is-right"
          src="/templates/classic/illus-champagne-tower.png"
          alt=""
          aria-hidden="true"
        />
      </section>

      {data.showDressCode && data.dressCode && (
        <section className="dress-code">
          <p className="eyebrow reveal">dress code</p>
          <p className="dress-code-text reveal">{data.dressCode}</p>
        </section>
      )}

      {data.showRsvp && <RsvpSection weddingId={data.weddingId} />}

      <footer ref={footerRef}>
        {data.footerPhotoUrl && (
          <div className="footer-photo">
            <img ref={footerPhotoRef} src={data.footerPhotoUrl} alt="戒指" />
          </div>
        )}
        <img className="bg-illus footer-rings-accent" src="/templates/classic/illus-rings.png" alt="" aria-hidden="true" />
        <p className="thanks" ref={footerThanksRef}>
          {data.thanksMessage || "感謝您撥冗參與，見證我們人生中最重要的時刻"}
        </p>
        <p className="names" ref={footerNamesRef}>
          {data.groomName}　＆　{data.brideName}
        </p>
        <p className="credit" ref={footerCreditRef}>
          Made with The Vow Page 摯頁
        </p>
      </footer>
    </div>
  );
}
