"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/shared";
import { marketingHref, type MarketingPath } from "@/lib/i18n/marketingPaths";

const LABELS: Record<Locale, string> = { zh: "中文", en: "English" };

const MARKETING_PATHS: MarketingPath[] = ["/", "/terms", "/privacy"];

/** The home/terms/privacy pages live at two fixed, statically-rendered
 * URLs per locale (bare path for zh, /en-prefixed for en) rather than
 * reading the locale cookie - so switching languages there has to
 * navigate to the sibling URL instead of just setting a cookie and
 * refreshing. Returns the bare (zh-shaped) path if `pathname` is one of
 * those three pages in either locale, otherwise null. */
function marketingBasePath(pathname: string): MarketingPath | null {
  const stripped = pathname === "/en" ? "/" : pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
  return MARKETING_PATHS.includes(stripped as MarketingPath) ? (stripped as MarketingPath) : null;
}

export function LanguageSwitcher({
  className = "",
  locale: localeProp,
}: {
  className?: string;
  locale?: Locale;
}) {
  const contextLocale = useLocale();
  const locale = localeProp ?? contextLocale;
  const pathname = usePathname();
  const router = useRouter();

  function setLocale(next: Locale) {
    if (next === locale) return;
    const marketingPath = marketingBasePath(pathname);
    if (marketingPath) {
      router.push(marketingHref(marketingPath, next));
      return;
    }
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className={`flex items-center gap-1 text-xs ${className}`}>
      {(["zh", "en"] as const).map((code, i) => (
        <span key={code} className="flex items-center gap-1">
          {i > 0 && <span className="text-[var(--brand-line)]">/</span>}
          <button
            type="button"
            onClick={() => setLocale(code)}
            aria-current={locale === code}
            className={
              locale === code
                ? "font-medium text-[var(--brand-gold)]"
                : "text-[var(--brand-ink-soft)] hover:text-[var(--brand-gold)]"
            }
          >
            {LABELS[code]}
          </button>
        </span>
      ))}
    </div>
  );
}
