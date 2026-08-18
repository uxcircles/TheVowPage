import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EB_Garamond } from "next/font/google";
import { ClassicTemplate } from "@/components/templates/classic/ClassicTemplate";
import { localizedName } from "@/components/templates/classic/types";
import { getPublicWeddingData } from "@/lib/weddings";
import { headingFont } from "@/lib/fonts";
import { getLocale } from "@/lib/i18n/locale";
import type { Locale } from "@/lib/i18n/shared";
import { expiredNoticeCopy, tryDesignCopy } from "@/lib/i18n/dictionaries/template";
import { buildMetadata } from "@/lib/seo";

const displayFont = EB_Garamond({ subsets: ["latin"], weight: ["400", "500"] });

// Distinct from not-found.tsx's "doesn't exist / not published" state -
// this is a wedding that *was* live and now has an expired one-year term,
// so the copy and CTA are about renewing rather than a broken link.
function ExpiredNotice({ locale }: { locale: Locale }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[var(--brand-line)]/60 px-6 py-5 sm:px-10">
        <Link href="/" className={`${headingFont.className} text-lg text-[var(--brand-gold)]`}>
          The Vow Page 摯頁
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <img
          src="/templates/classic/wax-seal.webp"
          alt=""
          aria-hidden="true"
          className="h-20 w-20 opacity-40 grayscale"
        />
        <p className={`${displayFont.className} mt-6 text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]`}>
          {expiredNoticeCopy.badge[locale]}
        </p>
        <h1 className={`${headingFont.className} mt-3 text-2xl font-semibold text-foreground sm:text-3xl`}>
          {expiredNoticeCopy.title[locale]}
        </h1>
        <p className="mt-4 max-w-sm text-sm text-[var(--brand-ink-soft)]">
          {expiredNoticeCopy.body1[locale]}
          <br />
          {expiredNoticeCopy.body2[locale]}
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/login"
            className="rounded bg-[var(--brand-gold)] px-6 py-2.5 text-sm text-white transition-opacity hover:opacity-90"
          >
            {expiredNoticeCopy.renewCta[locale]}
          </Link>
          <Link href="/" className="text-sm text-[var(--brand-ink-soft)] underline underline-offset-4 hover:text-[var(--brand-gold)]">
            {expiredNoticeCopy.backHome[locale]}
          </Link>
        </div>
      </main>
    </div>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l1-4L16 5l3 3L8 19l-4 1Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 7l3 3" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5 12 4l8 6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9.5V20h5v-6h2v6h5V9.5" />
    </svg>
  );
}

// Floating CTA shown only on the permanent showcase demo weddings ([[vowpage_showcase_demo_weddings]]),
// never on a real customer's own invitation - carries the demo's theme/seal/moments
// style over to /create via query params so "I like this one" leads straight into
// editing with the same look already selected.
function TryThisDesignCta({
  theme,
  seal,
  momentsStyle,
  locale,
}: {
  theme: string;
  seal: string;
  momentsStyle: string;
  locale: Locale;
}) {
  const href = `/create?theme=${encodeURIComponent(theme)}&seal=${encodeURIComponent(seal)}&moments=${encodeURIComponent(momentsStyle)}`;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-3 px-4 pb-4">
      <Link
        href="/#showcase"
        aria-label={tryDesignCopy.backHomeAria[locale]}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-lg transition-opacity hover:opacity-90"
      >
        <HomeIcon />
      </Link>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-white shadow-lg transition-opacity hover:opacity-90"
      >
        {tryDesignCopy.cta[locale]}
        <EditIcon />
      </Link>
    </div>
  );
}

const weddingOgCopy = {
  titleSuffix: { zh: "的婚禮邀請", en: "'s Wedding Invitation" },
  withDetails: {
    zh: (names: string, date: string, venue: string) =>
      `${names} 誠摯邀請您參加他們的婚禮${date ? `，${date}` : ""}${venue ? ` 於 ${venue}` : ""}。點擊查看喜帖並回覆 RSVP。`,
    en: (names: string, date: string, venue: string) =>
      `${names} invite you to their wedding${date ? ` on ${date}` : ""}${venue ? ` at ${venue}` : ""}. View the invitation and RSVP.`,
  },
  fallback: { zh: "點擊查看這份電子喜帖並回覆 RSVP。", en: "View this digital wedding invitation and RSVP." },
  notFoundTitle: { zh: "找不到喜帖", en: "Invitation not found" },
  notFoundDescription: {
    zh: "這個連結指向的喜帖不存在，或尚未公開發布。",
    en: "This link doesn't point to an existing or published invitation.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [result, locale] = await Promise.all([getPublicWeddingData(slug), getLocale()]);

  // A wedding's own OG image/title is real content someone might share -
  // still worth good link-preview copy even once expired or if the slug
  // never existed. But every /w/[slug] page (this branch and the "ok" one
  // below) sets noIndex - these are the couple's private event details
  // (date, venue address), not something that should turn up in Google
  // for a stranger searching the couple's names.
  if (result.status !== "ok") {
    return buildMetadata({
      title: weddingOgCopy.notFoundTitle[locale],
      description: weddingOgCopy.notFoundDescription[locale],
      path: `/w/${slug}`,
      locale,
      noIndex: true,
    });
  }

  const {
    groomName,
    groomNameEn,
    groomLabel,
    brideName,
    brideNameEn,
    brideLabel,
    eventDate,
    timezone,
    venueName,
    venueNameEn,
    heroPhotoUrl,
  } = result.data;
  const groomDisplay = localizedName(groomName, groomNameEn, locale);
  const brideDisplay = localizedName(brideName, brideNameEn, locale);
  const venueNameDisplay = localizedName(venueName, venueNameEn, locale);
  const names = `${groomDisplay || groomLabel} ＆ ${brideDisplay || brideLabel}`;
  const dateLabel = eventDate
    ? new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "zh-Hant", {
        timeZone: timezone || undefined,
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(eventDate))
    : "";
  const description =
    dateLabel || venueNameDisplay
      ? weddingOgCopy.withDetails[locale](names, dateLabel, venueNameDisplay || "")
      : weddingOgCopy.fallback[locale];

  return buildMetadata({
    title: `${names}${weddingOgCopy.titleSuffix[locale]}`,
    description,
    path: `/w/${slug}`,
    locale,
    noIndex: true,
    image: heroPhotoUrl ? { url: heroPhotoUrl } : undefined,
  });
}

export default async function PublicWeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublicWeddingData(slug);
  const locale = await getLocale();

  if (result.status === "not_found") notFound();
  if (result.status === "expired") return <ExpiredNotice locale={locale} />;

  return (
    <>
      <ClassicTemplate data={result.data} />
      {result.isDemo && (
        <TryThisDesignCta
          theme={result.data.theme}
          seal={result.data.sealDesign}
          momentsStyle={result.data.momentsStyle}
          locale={locale}
        />
      )}
    </>
  );
}
