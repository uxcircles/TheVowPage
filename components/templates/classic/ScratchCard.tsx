"use client";

import { useEffect, useRef, useState } from "react";
import { launchConfetti } from "./confetti";
import type { ClassicTheme } from "./themes";

// Lightens (positive percent) or darkens (negative percent) a hex color by
// blending each channel toward white/black - used to build the scratch-foil
// gradient and confetti palette from a single theme accent color instead of
// a hardcoded gold gradient.
function shadeHex(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((num >> 16) + amt);
  const g = clamp(((num >> 8) & 0x00ff) + amt);
  const b = clamp((num & 0x0000ff) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Wedding date/time is always shown in the venue's local time (resolved
// from the venue's location), not the visiting guest's browser timezone.
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    weekday: get("weekday"),
  };
}

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function formatDateLabel(date: Date, timeZone: string) {
  const p = zonedParts(date, timeZone);
  return `${p.year}年${p.month}月${p.day}日 星期${WEEKDAYS[WEEKDAY_INDEX[p.weekday] ?? 0]}`;
}

// Taiwanese wedding banquets are almost always either a lunch (午宴) or
// dinner (晚宴) seating - infer which from the actual hour instead of
// always saying "晚宴" regardless of what time was entered.
function formatTimeLabel(date: Date, timeZone: string) {
  const p = zonedParts(date, timeZone);
  const hh = p.hour === "24" ? "00" : p.hour;
  const mealLabel = Number(p.hour) < 15 ? "午宴入席" : "晚宴入席";
  return `${hh}:${p.minute} ${mealLabel}`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function ScratchCard({
  eventDate,
  venueLabel,
  timeZone,
  theme,
}: {
  eventDate: Date | null;
  venueLabel: string;
  timeZone: string;
  theme: ClassicTheme;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiLayerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState({ d: "00", h: "00", m: "00", s: "00" });

  useEffect(() => {
    const card = cardRef.current;
    const canvas = canvasRef.current;
    if (!card || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let scratching = false;
    let localRevealed = false;
    let ticking = false;

    function sizeCanvas() {
      if (!card || !canvas) return;
      const rect = card.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (!localRevealed) drawFoil();
    }

    function drawFoil() {
      if (!ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.globalCompositeOperation = "source-over";

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, shadeHex(theme.gold, 30));
      grad.addColorStop(0.22, shadeHex(theme.gold, 10));
      grad.addColorStop(0.5, shadeHex(theme.gold, 20));
      grad.addColorStop(0.78, shadeHex(theme.gold, -6));
      grad.addColorStop(1, shadeHex(theme.gold, -16));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      for (let x = -h; x < w; x += 5) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h, h);
        ctx.stroke();
      }
      ctx.restore();

      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = `italic ${Math.max(13, w * 0.048)}px "EB Garamond", serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("scratch to reveal", w / 2, h / 2);
    }

    function getPos(e: MouseEvent | TouchEvent) {
      const rect = canvas!.getBoundingClientRect();
      const point =
        "touches" in e && e.touches[0]
          ? e.touches[0]
          : "changedTouches" in e && e.changedTouches[0]
            ? e.changedTouches[0]
            : (e as MouseEvent);
      return { x: point.clientX - rect.left, y: point.clientY - rect.top };
    }

    function scratchAt(x: number, y: number) {
      if (!ctx || !canvas) return;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, canvas.width * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }

    function checkProgress() {
      if (localRevealed || !ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      const step = 6;
      const data = ctx.getImageData(0, 0, w, h).data;
      let cleared = 0;
      let total = 0;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          total++;
          if (data[(y * w + x) * 4 + 3] < 40) cleared++;
        }
      }
      if (total > 0 && cleared / total > 0.5) reveal();
    }

    function reveal() {
      localRevealed = true;
      setRevealed(true);
      if (confettiLayerRef.current) {
        launchConfetti(confettiLayerRef.current, [
          theme.gold,
          shadeHex(theme.gold, 20),
          theme.creamDeep,
          theme.inkSoft,
          theme.cream,
        ]);
      }
      startCountdown();
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;
    function startCountdown() {
      if (!eventDate) return;
      const target = eventDate.getTime();
      function tick() {
        const diff = Math.max(0, target - Date.now());
        setCountdown({
          d: pad(Math.floor(diff / 86400000)),
          h: pad(Math.floor((diff % 86400000) / 3600000)),
          m: pad(Math.floor((diff % 3600000) / 60000)),
          s: pad(Math.floor((diff % 60000) / 1000)),
        });
      }
      tick();
      intervalId = setInterval(tick, 1000);
    }

    function handleMove(e: MouseEvent | TouchEvent) {
      if (!scratching || localRevealed) return;
      const { x, y } = getPos(e);
      scratchAt(x, y);
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          checkProgress();
          ticking = false;
        });
      }
    }

    function startScratch(e: MouseEvent | TouchEvent) {
      if (localRevealed) return;
      scratching = true;
      const { x, y } = getPos(e);
      scratchAt(x, y);
    }
    function endScratch() {
      scratching = false;
    }

    function handleTouchStart(e: TouchEvent) {
      startScratch(e);
      e.preventDefault();
    }
    function handleTouchMove(e: TouchEvent) {
      handleMove(e);
      e.preventDefault();
    }

    canvas.addEventListener("mousedown", startScratch);
    canvas.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", endScratch);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", endScratch);
    window.addEventListener("resize", sizeCanvas);

    sizeCanvas();

    return () => {
      canvas.removeEventListener("mousedown", startScratch);
      canvas.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", endScratch);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", endScratch);
      window.removeEventListener("resize", sizeCanvas);
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventDate, theme]);

  return (
    <section className="scratch-section">
      <p className="eyebrow reveal">save the date</p>
      <div className="scratch-card" ref={cardRef}>
        <div className="scratch-reveal">
          <p className="cn">{eventDate ? formatDateLabel(eventDate, timeZone) : "日期籌備中"}</p>
          <p className="detail">{eventDate ? formatTimeLabel(eventDate, timeZone) : ""}</p>
          <p className="venue">{venueLabel}</p>
        </div>
        <canvas ref={canvasRef} className={`scratch-canvas${revealed ? " is-cleared" : ""}`} />
      </div>
      <p className={`scratch-caption${revealed ? " is-hidden" : ""}`}>手指刮開，看看日期</p>
      {eventDate && (
        <div className={`countdown${revealed ? " is-visible" : ""}`}>
          <div className="countdown-item">
            <span className="countdown-num">{countdown.d}</span>
            <span className="countdown-label">days</span>
          </div>
          <div className="countdown-item">
            <span className="countdown-num">{countdown.h}</span>
            <span className="countdown-label">hrs</span>
          </div>
          <div className="countdown-item">
            <span className="countdown-num">{countdown.m}</span>
            <span className="countdown-label">min</span>
          </div>
          <div className="countdown-item">
            <span className="countdown-num">{countdown.s}</span>
            <span className="countdown-label">sec</span>
          </div>
        </div>
      )}
      <img
        className="bg-illus is-right"
        src="/templates/classic/illus-cherub.png"
        alt=""
        aria-hidden="true"
      />
      <img
        className="bg-illus is-left"
        src="/templates/classic/illus-bouquet.png"
        alt=""
        aria-hidden="true"
      />
      <div className="confetti-layer" ref={confettiLayerRef} />
    </section>
  );
}
