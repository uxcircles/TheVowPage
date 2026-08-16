"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { footerCopy } from "@/lib/i18n/dictionaries/common";

export function SiteFooter() {
  const locale = useLocale();

  return (
    <footer className="flex flex-col items-center gap-3 border-t border-[var(--brand-line)]/60 px-6 py-8 text-center text-xs text-[var(--brand-ink-soft)]">
      <div className="flex items-center gap-4">
        <Link href="/terms" className="hover:text-[var(--brand-gold)]">
          {footerCopy.terms[locale]}
        </Link>
        <Link href="/privacy" className="hover:text-[var(--brand-gold)]">
          {footerCopy.privacy[locale]}
        </Link>
      </div>
      <LanguageSwitcher />
      <p>
        © {new Date().getFullYear()} {footerCopy.copyright[locale]}
      </p>
    </footer>
  );
}
