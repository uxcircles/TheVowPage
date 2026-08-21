import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { buildMetadata } from "@/lib/seo";
import "../globals.css";

// Same font config as (app)/layout.tsx - see that file's comment for why
// the weight list is trimmed to 400/500/600. Duplicated here (rather than
// shared) because next/font requires each call site to instantiate its
// own font, and this group has its own independent root layout.
const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = buildMetadata({
  title: "The Vow Page 摯頁｜線上電子喜帖平台",
  description:
    "為新人打造的電子喜帖平台：拆信封、刮刮卡等互動效果，挑選模板、編輯內容、管理賓客與 RSVP、分享婚紗相簿。免費試做，發布只要一次性 £39。",
  path: "/",
  locale: "zh",
});

export default function MarketingZhLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" className={`${notoSansTC.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
