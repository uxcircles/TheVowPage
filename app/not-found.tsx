import Link from "next/link";
import { EB_Garamond, Chiron_Sung_HK } from "next/font/google";

const displayFont = EB_Garamond({ subsets: ["latin"], weight: ["400", "500"] });
const headingFont = Chiron_Sung_HK({ subsets: ["latin"], weight: ["500", "600"] });

export default function NotFound() {
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
          這份喜帖不存在，或尚未公開
        </h1>
        <p className="mt-4 max-w-sm text-sm text-[var(--brand-ink-soft)]">
          可能是連結有誤，或喜帖還在準備中、尚未發布。
          <br />
          如果你是新人本人，登入後台即可確認發布狀態。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded bg-[var(--brand-gold)] px-6 py-2.5 text-sm text-white transition-opacity hover:opacity-90"
          >
            返回首頁
          </Link>
          <Link
            href="/login"
            className="text-sm text-[var(--brand-ink-soft)] underline underline-offset-4 hover:text-[var(--brand-gold)]"
          >
            登入查看我的喜帖
          </Link>
        </div>
      </main>
    </div>
  );
}
