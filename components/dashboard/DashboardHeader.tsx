"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { headingFont } from "@/lib/fonts";

/** Only shown on the top-level wedding list. One level deep into a specific
 * wedding's own pages, WeddingChrome renders its own compact header (with
 * its own "← 返回" link) - showing this one too doubled up the navigation
 * and capped the page at this layout's own content width during preview. */
export function DashboardHeader() {
  const pathname = usePathname();
  if (/^\/dashboard\/[^/]+/.test(pathname)) return null;

  return (
    <header className="flex items-center justify-between border-b border-[var(--brand-line)] px-6 py-4">
      <Link href="/dashboard" className={`${headingFont.className} text-lg text-[var(--brand-gold)]`}>
        The Vow Page 摯頁
      </Link>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <form action={signOut}>
          <SignOutButton />
        </form>
      </div>
    </header>
  );
}
