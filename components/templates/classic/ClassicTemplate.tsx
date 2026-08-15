"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { EB_Garamond, Noto_Serif_TC } from "next/font/google";
import "./classic.css";
import { THANKS_MESSAGE_FALLBACK, type ClassicTemplateData } from "./types";
import { getClassicTheme, getEnvelopeImages } from "./themes";
import { getSealDesign, getSealImage } from "./seals";
import { getMomentsStyle } from "./momentsStyles";
import { ScratchCard } from "./ScratchCard";
import { MomentsGrid } from "./MomentsGrid";
import { MomentsCarousel } from "./MomentsCarousel";
import { MomentsLightbox } from "./MomentsLightbox";
import { VenueMap } from "./VenueMap";
import { RsvpSection } from "./RsvpForm";
import { useReveal } from "./useReveal";
import { buildGoogleCalendarUrl, buildIcsDataUrl, scheduleDetails } from "./calendar";
import {
  DEFAULT_SCHEDULE_FLOWER_PATH,
  DEFAULT_SCHEDULE_FLOWER_VIEWBOX,
  SCHEDULE_FLOWER_BY_SEAL,
} from "./scheduleFlowerPaths";

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


function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function hexToUnitRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
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
  const [stackLightboxIndex, setStackLightboxIndex] = useState<number | null>(null);
  const eventDate = data.eventDate ? new Date(data.eventDate) : null;
  const momentsStyle = getMomentsStyle(data.momentsStyle);
  const theme = getClassicTheme(data.theme);
  const seal = getSealDesign(data.sealDesign);
  const scheduleFlower = SCHEDULE_FLOWER_BY_SEAL[seal.id] ?? {
    viewBox: DEFAULT_SCHEDULE_FLOWER_VIEWBOX,
    d: DEFAULT_SCHEDULE_FLOWER_PATH,
  };

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
    // Horizontal bleed protection lives in app/globals.css (overflow-x: clip
    // on html/body) - setting overflowX here too would apply as an inline
    // style, which wins over that class rule and reintroduces the exact bug
    // clip was chosen to avoid (see the comment there): "hidden" forces the
    // other axis to compute as a scroll container, breaking the moments
    // stack's position:sticky and letting mobile Safari still touch-scroll
    // the hidden axis.
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  // The site-wide <body> background (app/globals.css's --background) is a
  // warm cream tuned for the marketing pages - it doesn't match every
  // theme's own cream (e.g. the blue theme's #eef3f4), so rubber-band
  // overscroll on a themed invitation flashes the wrong color behind the
  // content. Sync body's background to this wedding's theme while mounted.
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = theme.cream;
    return () => {
      document.body.style.background = prev;
    };
  }, [theme.cream]);

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
          // Opacity races ahead of position/scale/rotation - fully visible
          // by 40% into the entrance instead of exactly when it finishes
          // settling, so each photo (especially the last one, whose
          // entrance window sits at the very end of the whole stack's
          // scroll range) doesn't require scrolling through its entire
          // slide-in distance just to stop looking faded.
          const opacityT = easeOutCubic(clamp(e / 0.4, 0, 1));
          const startX = dir * (window.innerWidth / 2 + 220);
          const startY = -40;
          const startRot = rot + dir * 18;
          x = lerp(startX, 0, te);
          y = lerp(startY, 0, te);
          scale = lerp(1.04, 1, te);
          opacity = lerp(0, 1, opacityT);
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

    function update() {
      if (wrap && path) {
        const flowerProgress = bandProgress(wrap, 0.8, -0.6);
        path.style.strokeDashoffset = String(len * (1 - flowerProgress));
      }

      // Each item reveals based on its own position scrolling into view,
      // not a shared band stretched across the rest of the page - the
      // previous approach spread items.length items evenly across
      // [itemsStart, page bottom], so schedule items (early in the
      // combined schedule+footer items array) needed scrolling most of
      // the way to the footer to fully reveal whenever dress code/RSVP
      // added enough length after the schedule section, leaving them
      // visibly stuck at partial opacity while still reading the
      // schedule itself.
      //
      // The last few items (footer name/credit) sit at the very bottom of
      // the page, where there's no more scroll room left to push their
      // top up to the band's completion point - bandProgress alone would
      // leave them permanently stuck below full opacity once the page
      // can't scroll any further. Once at (or within a hair of) max
      // scroll, force every item fully revealed rather than hold that
      // impossible-to-reach state forever.
      const atMaxScroll = window.scrollY >= document.documentElement.scrollHeight - getStableVH() - 1;
      items.forEach((li) => {
        const p = atMaxScroll ? 1 : bandProgress(li, 0.85, 0.55);
        // Opacity races ahead of the translateY settle (reaches 1 by 60%
        // of the band) so a tall item like the footer photo doesn't sit
        // faded on screen for most of its scroll band just because its
        // slide-up hasn't finished yet.
        const opacityP = atMaxScroll ? 1 : clamp(p / 0.6, 0, 1);
        li.style.opacity = String(opacityP);
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
  }, [data.schedule.length, data.showSchedule, scheduleFlower.d]);

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
  const envelopeImages = getEnvelopeImages(theme.id);
  // The decorative bg-illus PNGs (floral sprigs, the rings divider, etc.)
  // are pre-rendered in a single flat gold tone with no per-theme variants
  // (unlike the envelope/wax-seal art) - this SVG filter recolors them to
  // match the current theme.gold exactly, regardless of source pixel
  // color, by zeroing out the RGB inputs and outputting theme.gold as a
  // constant while passing alpha through untouched. useId keeps the filter
  // id collision-free when multiple instances render on one page (e.g.
  // the dashboard's live preview alongside the editor).
  const illusFilterId = `classic-illus-recolor-${useId().replace(/:/g, "")}`;
  const [illusR, illusG, illusB] = hexToUnitRgb(theme.gold);

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
          "--illus-filter": `url(#${illusFilterId})`,
        } as React.CSSProperties
      }
    >
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id={illusFilterId}>
            <feColorMatrix
              type="matrix"
              values={`0 0 0 0 ${illusR}  0 0 0 0 ${illusG}  0 0 0 0 ${illusB}  0 0 0 1 0`}
            />
          </filter>
        </defs>
      </svg>
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
                    <img src={url} alt="" onClick={() => setStackLightboxIndex(i)} />
                  </div>
                ))}
              </div>
            </section>
          )}
          {stackLightboxIndex !== null && (
            <MomentsLightbox
              photoUrls={data.momentPhotoUrls}
              openIndex={stackLightboxIndex}
              onClose={() => setStackLightboxIndex(null)}
              onNavigate={setStackLightboxIndex}
            />
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
              <svg viewBox={scheduleFlower.viewBox} xmlns="http://www.w3.org/2000/svg">
                <path ref={flowerPathRef} d={scheduleFlower.d} />
              </svg>
            </div>
            <p className="eyebrow" ref={scheduleEyebrowRef}>
              schedule
            </p>
            {data.schedule.length > 0 ? (
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
            ) : (
              <p className="schedule-empty">流程籌備中</p>
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
          {data.thanksMessage || THANKS_MESSAGE_FALLBACK}
        </p>
        <p className="names" ref={footerNamesRef}>
          {data.groomName}　＆　{data.brideName}
        </p>
        <p className="credit" ref={footerCreditRef}>
          Made with{" "}
          <a href="/" target="_blank" rel="noopener">
            The Vow Page 摯頁
          </a>
        </p>
      </footer>
    </div>
  );
}
