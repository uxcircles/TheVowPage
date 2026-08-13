import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Vow Page 摯頁｜線上電子喜帖平台",
  description: "為新人打造的電子喜帖平台：挑選模板、編輯內容、管理賓客與 RSVP、分享婚紗相簿。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${notoSansTC.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
