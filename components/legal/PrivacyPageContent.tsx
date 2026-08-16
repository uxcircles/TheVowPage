import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { headingFont } from "@/lib/fonts";
import type { Locale } from "@/lib/i18n/shared";
import { marketingHref } from "@/lib/i18n/marketingPaths";
import { legalPageCopy, privacyMeta, privacySections } from "@/lib/i18n/dictionaries/legal";

export function PrivacyPageContent({ locale }: { locale: Locale }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[var(--brand-line)]/60 px-6 py-5 sm:px-10">
        <Link href={marketingHref("/", locale)} className={`${headingFont.className} text-lg text-[var(--brand-gold)]`}>
          The Vow Page 摯頁
        </Link>
        <Link href={marketingHref("/", locale)} className="text-sm text-[var(--brand-ink-soft)] hover:text-[var(--brand-gold)]">
          {legalPageCopy.backToHome[locale]}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-10">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">{privacyMeta.eyebrow[locale]}</p>
        <h1 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>{privacyMeta.title[locale]}</h1>
        <p className="mt-3 text-sm text-[var(--brand-ink-soft)]">{privacyMeta.lastUpdated[locale]}</p>

        <div className="mt-10 flex flex-col gap-10">
          {privacySections.map((section) => (
            <section key={section.title.zh}>
              <h2 className="text-lg font-medium text-foreground">{section.title[locale]}</h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.body.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-[var(--brand-ink-soft)]">
                    {p[locale]}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
