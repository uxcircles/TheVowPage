import Link from "next/link";
import { EB_Garamond } from "next/font/google";
import { headingFont } from "@/lib/fonts";
import { getLocale } from "@/lib/i18n/locale";
import { notFoundCopy } from "@/lib/i18n/dictionaries/template";

const displayFont = EB_Garamond({ subsets: ["latin"], weight: ["400", "500"] });

export default async function NotFound() {
  const locale = await getLocale();
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
          404
        </p>
        <h1 className={`${headingFont.className} mt-3 text-2xl font-semibold text-foreground sm:text-3xl`}>
          {notFoundCopy.title[locale]}
        </h1>
        <p className="mt-4 max-w-sm text-sm text-[var(--brand-ink-soft)]">
          {notFoundCopy.body1[locale]}
          <br />
          {notFoundCopy.body2[locale]}
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/"
            className="rounded bg-[var(--brand-gold)] px-6 py-2.5 text-sm text-white transition-opacity hover:opacity-90"
          >
            {notFoundCopy.backHome[locale]}
          </Link>
          <Link
            href="/login"
            className="text-sm text-[var(--brand-ink-soft)] underline underline-offset-4 hover:text-[var(--brand-gold)]"
          >
            {notFoundCopy.loginToView[locale]}
          </Link>
        </div>
      </main>
    </div>
  );
}
