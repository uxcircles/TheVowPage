import Link from "next/link";
import { notFound } from "next/navigation";
import { EB_Garamond } from "next/font/google";
import { ClassicTemplate } from "@/components/templates/classic/ClassicTemplate";
import { getPublicWeddingData } from "@/lib/weddings";
import { headingFont } from "@/lib/fonts";

const displayFont = EB_Garamond({ subsets: ["latin"], weight: ["400", "500"] });

// Distinct from not-found.tsx's "doesn't exist / not published" state -
// this is a wedding that *was* live and now has an expired one-year term,
// so the copy and CTA are about renewing rather than a broken link.
function ExpiredNotice() {
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
          已到期
        </p>
        <h1 className={`${headingFont.className} mt-3 text-2xl font-semibold text-foreground sm:text-3xl`}>
          這份喜帖的公開期限已到期
        </h1>
        <p className="mt-4 max-w-sm text-sm text-[var(--brand-ink-soft)]">
          喜帖網址發布一年後會自動下線。
          <br />
          如果你是新人本人，登入後台即可續約重新上線。
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/login"
            className="rounded bg-[var(--brand-gold)] px-6 py-2.5 text-sm text-white transition-opacity hover:opacity-90"
          >
            登入續約
          </Link>
          <Link href="/" className="text-sm text-[var(--brand-ink-soft)] underline underline-offset-4 hover:text-[var(--brand-gold)]">
            返回首頁
          </Link>
        </div>
      </main>
    </div>
  );
}

export default async function PublicWeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublicWeddingData(slug);

  if (result.status === "not_found") notFound();
  if (result.status === "expired") return <ExpiredNotice />;

  return <ClassicTemplate data={result.data} />;
}
