import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { headingFont } from "@/lib/fonts";
import { getLocale } from "@/lib/i18n/locale";
import { legalPageCopy, termsMeta, termsSections } from "@/lib/i18n/dictionaries/legal";

export async function generateMetadata() {
  const locale = await getLocale();
  return { title: termsMeta.metaTitle[locale] };
}

export default async function TermsPage() {
  const locale = await getLocale();
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[var(--brand-line)]/60 px-6 py-5 sm:px-10">
        <Link href="/" className={`${headingFont.className} text-lg text-[var(--brand-gold)]`}>
          The Vow Page 摯頁
        </Link>
        <Link href="/" className="text-sm text-[var(--brand-ink-soft)] hover:text-[var(--brand-gold)]">
          {legalPageCopy.backToHome[locale]}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-10">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">{termsMeta.eyebrow[locale]}</p>
        <h1 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>{termsMeta.title[locale]}</h1>
        <p className="mt-3 text-sm text-[var(--brand-ink-soft)]">{termsMeta.lastUpdated[locale]}</p>

        <div className="mt-10 flex flex-col gap-10">
          {termsSections.map((section) => (
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

      <SiteFooter />
    </div>
  );
}
