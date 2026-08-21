import Link from "next/link";
import { EB_Garamond } from "next/font/google";
import { FaqItem } from "@/components/marketing/FaqItem";
import { HeroPhones } from "@/components/marketing/HeroPhones";
import { Reveal } from "@/components/marketing/Reveal";
import { ShowcaseCarousel } from "@/components/marketing/ShowcaseCarousel";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CLASSIC_THEMES } from "@/components/templates/classic/themes";
import { headingFont } from "@/lib/fonts";
import type { Locale } from "@/lib/i18n/shared";
import {
  nav,
  hero,
  benefitsSection,
  benefits,
  howItWorksSection,
  steps,
  showcaseSection,
  storySection,
  faqSection,
  faqs,
  closingCta,
} from "@/lib/i18n/dictionaries/marketing";

const displayFont = EB_Garamond({ subsets: ["latin"], weight: ["400", "500"] });

function IconWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-gold)]/10 text-[var(--brand-gold)]">
      <span className="[&>svg]:h-6 [&>svg]:w-6">{children}</span>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5c.6 2.8 1.4 4.6 2.6 5.9 1.2 1.2 3 2 5.9 2.6-2.8.6-4.6 1.4-5.9 2.6-1.2 1.2-2 3-2.6 5.9-.6-2.8-1.4-4.6-2.6-5.9-1.2-1.2-3-2-5.9-2.6 2.8-.6 4.6-1.4 5.9-2.6 1.2-1.2 2-3 2.6-5.9Z"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path strokeLinecap="round" d="M8.2 10.8l7.6-4.3M8.2 13.2l7.6 4.3" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 19c0-7 4-13 14-14 0 10-4 14-14 14Z" />
      <path strokeLinecap="round" d="M5 19c2-4 5-7 9-9" />
    </svg>
  );
}

function ClipboardCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 13l2.5 2.5L15.5 11" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l1-4L16 5l3 3L8 19l-4 1Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 7l3 3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
      <rect x="7" y="2" width="10" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" d="M11 18h2" />
    </svg>
  );
}

const BENEFIT_ICONS = [ShareIcon, LeafIcon, ClipboardCheckIcon, MapPinIcon, EditIcon, PhoneIcon];

export function HomePageContent({ locale }: { locale: Locale }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--brand-line)]/60 bg-[var(--background)]/90 px-6 py-5 backdrop-blur sm:px-10">
        <span className={`${headingFont.className} text-lg text-[var(--brand-gold)]`}>The Vow Page 摯頁</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-[var(--brand-ink-soft)] hover:text-[var(--brand-gold)]">
            {nav.login[locale]}
          </Link>
          <Link
            href="/create"
            className="rounded bg-[var(--brand-gold-dark)] px-4 py-2 text-white transition-opacity hover:opacity-90"
          >
            {nav.tryFree[locale]}
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-6 py-16 sm:px-10 sm:py-24 lg:grid-cols-2">
          <div className="lg:-translate-y-10">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-gold)]/10 px-3 py-1 text-xs font-medium text-[var(--brand-gold-dark)]">
                <SparkleIcon />
                {hero.badge[locale]}
              </span>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">wedding invitation</p>
              <h1
                className={`${headingFont.className} mt-4 text-4xl font-semibold leading-tight text-foreground sm:text-5xl`}
              >
                {hero.title[locale]}
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-6 max-w-md text-[var(--brand-ink-soft)]">{hero.subtitle[locale]}</p>
            </Reveal>
            <Reveal delay={360}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/create"
                  className="rounded bg-[var(--brand-gold-dark)] px-8 py-3 text-white transition-opacity hover:opacity-90"
                >
                  {hero.ctaPrimary[locale]}
                </Link>
                <a
                  href="#showcase"
                  className="text-sm text-[var(--brand-ink-soft)] underline underline-offset-4 hover:text-[var(--brand-gold)]"
                >
                  {hero.ctaSecondary[locale]}
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={480} className="mx-auto w-full max-w-lg">
            <HeroPhones />
          </Reveal>
        </section>

        {/* Benefits */}
        <section className="relative overflow-hidden bg-white/50 px-6 py-20 sm:px-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/templates/classic/illus-peony-stem.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-6 hidden w-40 opacity-25 sm:block lg:w-52"
          />
          <div className="relative mx-auto max-w-5xl">
            <Reveal>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">{benefitsSection.eyebrow[locale]}</p>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>
                {benefitsSection.title[locale]}
              </h2>
              <p className="mt-3 max-w-lg text-[var(--brand-ink-soft)]">{benefitsSection.intro[locale]}</p>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b, i) => {
                const Icon = BENEFIT_ICONS[i];
                return (
                  <Reveal key={b.title.zh} delay={(i % 3) * 100}>
                    <IconWrap>
                      <Icon />
                    </IconWrap>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{b.title[locale]}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--brand-ink-soft)]">{b.description[locale]}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <Reveal className="text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">{howItWorksSection.eyebrow[locale]}</p>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>{howItWorksSection.title[locale]}</h2>
            </Reveal>
            <div className="relative mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
              <div
                className="absolute top-7 hidden h-px bg-[var(--brand-gold)]/30 sm:block"
                style={{ left: "16.6667%", right: "16.6667%" }}
                aria-hidden="true"
              />
              {steps.map((step, i) => (
                <Reveal
                  key={step.title.zh}
                  delay={i * 120}
                  className="relative flex flex-col items-center text-center sm:items-center"
                >
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--brand-gold)] bg-[var(--background)]">
                    <span className={`${headingFont.className} text-xl text-[var(--brand-gold)]`}>{`0${i + 1}`}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title[locale]}</h3>
                  <p className="mt-2 max-w-[26ch] text-sm leading-relaxed text-[var(--brand-ink-soft)]">
                    {step.description[locale]}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Template showcase */}
        <section id="showcase" className="bg-white/50 px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">{showcaseSection.eyebrow[locale]}</p>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>{showcaseSection.title[locale]}</h2>
              <p className="mt-3 max-w-lg text-[var(--brand-ink-soft)]">{showcaseSection.intro[locale]}</p>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <ShowcaseCarousel themes={CLASSIC_THEMES} locale={locale} />
              <Reveal delay={(CLASSIC_THEMES.length % 4) * 100}>
                <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--brand-line)] text-center">
                  <p className={`${displayFont.className} text-lg text-[var(--brand-ink-soft)]`}>
                    {showcaseSection.comingSoon[locale]}
                  </p>
                  <p className="text-sm text-[var(--brand-ink-soft)]">{showcaseSection.comingSoonSubtitle[locale]}</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Founder story */}
        <section className="px-6 py-20 sm:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">{storySection.eyebrow[locale]}</p>
            <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>
              {storySection.title[locale]}
            </h2>
            {storySection.paragraphs.map((p, i) => (
              <p key={i} className={`${i === 0 ? "mt-6" : "mt-4"} text-[var(--brand-ink-soft)] leading-relaxed`}>
                {p[locale]}
              </p>
            ))}
          </Reveal>
        </section>

        {/* FAQ */}
        <section className="bg-white/50 px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <Reveal className="text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">{faqSection.eyebrow[locale]}</p>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>
                {faqSection.title[locale]}
              </h2>
            </Reveal>
            <div className="mt-10 flex flex-col divide-y divide-[var(--brand-line)] border-y border-[var(--brand-line)]">
              {faqs.map((faq, i) => (
                <Reveal key={faq.question.zh} delay={(i % 3) * 80}>
                  <FaqItem question={faq.question[locale]} answer={faq.answer[locale]} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="px-6 py-20 sm:px-10">
          <Reveal className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-[var(--foreground)] px-8 py-16 text-center text-[var(--background)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/templates/classic/illus-cherub.webp"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 bottom-0 w-64 opacity-40 sm:w-80"
            />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2 className={`${headingFont.className} text-3xl font-semibold`}>{closingCta.title[locale]}</h2>
              <p className="max-w-md text-white/70">{closingCta.subtitle[locale]}</p>
              <Link
                href="/create"
                className="rounded bg-[var(--brand-gold)] px-8 py-3 text-white transition-opacity hover:opacity-90"
              >
                {closingCta.cta[locale]}
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
