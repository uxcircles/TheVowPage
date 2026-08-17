import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ToastProvider } from "@/components/ui/Toast";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getLocale } from "@/lib/i18n/locale";
import { buildMetadata } from "@/lib/seo";
import "../globals.css";

// Weights limited to what's actually used site-wide (font-medium/
// font-semibold, plus the browser default 400/normal for unstyled text) -
// no font-light or font-bold appear anywhere in the app. Each extra weight
// roughly doubles this CJK font's @font-face CSS (~100 unicode-range rules
// per weight), and that stylesheet is render-blocking on every page.
const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === "en"
    ? buildMetadata({
        title: "The Vow Page | Online Wedding Invitations",
        description:
          "A digital wedding invitation platform: choose a template, edit your content, manage guests and RSVPs, and share your wedding photos.",
        locale,
      })
    : buildMetadata({
        title: "The Vow Page 摯頁｜線上電子喜帖平台",
        description: "為新人打造的電子喜帖平台：挑選模板、編輯內容、管理賓客與 RSVP、分享婚紗相簿。",
        locale,
      });
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale === "en" ? "en-GB" : "zh-Hant"} className={`${notoSansTC.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <LocaleProvider locale={locale}>
          <ToastProvider>{children}</ToastProvider>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
