"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { footerCopy } from "@/lib/i18n/dictionaries/common";
import type { Locale } from "@/lib/i18n/shared";
import { marketingHref } from "@/lib/i18n/marketingPaths";

/** `locale` is optional and only needed on the static marketing pages
 * (home/terms/privacy), which don't render inside the cookie-based
 * LocaleProvider and so can't rely on useLocale() - every other caller
 * leaves it unset and gets the context value as before. */
export function SiteFooter({ locale: localeProp }: { locale?: Locale } = {}) {
  const contextLocale = useLocale();
  const locale = localeProp ?? contextLocale;

  return (
    <footer className="flex flex-col items-center gap-3 border-t border-[var(--brand-line)]/60 px-6 py-8 text-center text-xs text-[var(--brand-ink-soft)]">
      <div className="flex items-center gap-4">
        <Link href={marketingHref("/terms", locale)} className="hover:text-[var(--brand-gold)]">
          {footerCopy.terms[locale]}
        </Link>
        <Link href={marketingHref("/privacy", locale)} className="hover:text-[var(--brand-gold)]">
          {footerCopy.privacy[locale]}
        </Link>
      </div>
      <LanguageSwitcher locale={locale} />
      <p className="max-w-sm text-[11px] leading-relaxed text-[var(--brand-ink-soft)]/80">
        {footerCopy.copyrightLine[locale](new Date().getFullYear())}
      </p>
    </footer>
  );
}
