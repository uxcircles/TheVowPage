import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "../../globals.css";

// Same font config as (app)/layout.tsx and (marketing-zh)/layout.tsx - see
// (app)/layout.tsx's comment for why the weight list is trimmed. Duplicated
// here because next/font requires each call site to instantiate its own
// font, and this group has its own independent root layout.
const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "The Vow Page | Online Wedding Invitations",
  description:
    "A digital wedding invitation platform: choose a template, edit your content, manage guests and RSVPs, and share your wedding photos.",
};

export default function MarketingEnLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${notoSansTC.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
