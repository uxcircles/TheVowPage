"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/shared";

const LABELS: Record<Locale, string> = { zh: "中文", en: "English" };

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();

  function setLocale(next: Locale) {
    if (next === locale) return;
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
