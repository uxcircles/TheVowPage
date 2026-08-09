import { EB_Garamond, Noto_Serif_TC } from "next/font/google";
import type { ClassicTheme } from "@/components/templates/classic/themes";

const displayFont = EB_Garamond({ subsets: ["latin"], weight: ["400", "500"] });
const bodyFont = Noto_Serif_TC({ subsets: ["latin"], weight: ["400", "500"] });

/** Just the envelope/wax-seal visual, no caption - for decorative use (e.g.
 * a rotated card peeking out behind another one), where a second caption
 * would overlap the front card's caption instead of sitting behind it. */
export function InvitationCardVisual({ theme }: { theme: ClassicTheme }) {
  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden rounded-lg shadow-[0_20px_45px_-25px_rgba(60,53,44,0.45)]"
      style={{ backgroundColor: theme.cream }}
    >
      <div
        className="absolute inset-4 flex flex-col items-center justify-center gap-3 rounded border"
        style={{ borderColor: theme.gold + "55" }}
      >
        <p className="text-[10px] uppercase tracking-[0.35em]" style={{ color: theme.gold }}>
          wedding invitation
        </p>
        <p className={`${displayFont.className} text-2xl`} style={{ color: theme.ink }}>
          <span className={bodyFont.className}>新郎</span> &amp;{" "}
          <span className={bodyFont.className}>新娘</span>
        </p>
        <div
          className="mt-2 flex h-11 w-11 items-center justify-center rounded-full text-[10px] shadow-inner"
          style={{ backgroundColor: theme.gold, color: theme.cream }}
        >
          囍
        </div>
        <p className="text-[11px] tracking-[0.2em]" style={{ color: theme.gold }}>
          SAVE THE DATE
        </p>
      </div>
    </div>
  );
}

/** A stylized static mockup of the Classic invitation's envelope + wax seal
 * moment, re-themed by color - not the live interactive template, which
 * would be far too heavy (Leaflet, canvas scratch card, IntersectionObserver
 * reveals) to mount three times on a marketing page. */
export function InvitationPreviewCard({ theme }: { theme: ClassicTheme }) {
  return (
    <div className="flex flex-col gap-4">
      <InvitationCardVisual theme={theme} />
      <div>
        <p className="font-medium text-foreground">{theme.name}</p>
        <p className="text-sm text-[var(--brand-ink-soft)]">{theme.tagline}</p>
      </div>
    </div>
  );
}
