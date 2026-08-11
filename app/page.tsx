import Link from "next/link";
import { EB_Garamond, Chiron_Sung_HK } from "next/font/google";
import { InvitationCardVisual, InvitationPreviewCard } from "@/components/marketing/InvitationPreviewCard";
import { CLASSIC_THEMES } from "@/components/templates/classic/themes";

const displayFont = EB_Garamond({ subsets: ["latin"], weight: ["400", "500"] });
const headingFont = Chiron_Sung_HK({ subsets: ["latin"], weight: ["500", "600"] });

const BENEFITS = [
  {
    title: "免印刷、免寄送",
    description: "一個連結分享給所有賓客，立刻看到喜帖，省下印製與郵寄的時間與費用。",
  },
  {
    title: "環保無紙化",
    description: "不製造紙本浪費，符合現代新人重視永續、簡約的價值觀。",
  },
  {
    title: "RSVP 即時回覆與統計",
    description: "賓客直接在頁面上回覆出席與否，人數自動彙整，不用再一一電話確認。",
  },
  {
    title: "地址自動定位、時區自動換算",
    description: "只要打場地名稱，系統自動標出地圖位置並換算正確時區，海外賓客也不會搞錯時間。",
  },
  {
    title: "隨時修改內容",
    description: "婚期異動、場地變更，直接在後台更新，不用重新印製或補寄。",
  },
  {
    title: "手機也完美呈現",
    description: "拆信封、刮刮卡等精緻互動效果，在手機上一樣流暢動人。",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[var(--brand-line)]/60 px-6 py-5 sm:px-10">
        <span className={`${headingFont.className} text-lg text-[var(--brand-gold)]`}>The Vow Page 摯頁</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-[var(--brand-ink-soft)] hover:text-[var(--brand-gold)]">
            登入
          </Link>
          <Link
            href="/create"
            className="rounded bg-[var(--brand-gold)] px-4 py-2 text-white transition-opacity hover:opacity-90"
          >
            免費試做喜帖
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-6 py-16 sm:px-10 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">wedding invitation</p>
            <h1
              className={`${headingFont.className} mt-4 text-4xl font-semibold leading-tight text-foreground sm:text-5xl`}
            >
              為新人打造的
              <br />
              電子喜帖平台
            </h1>
            <p className="mt-6 max-w-md text-[var(--brand-ink-soft)]">
              挑選模板、放上照片、填好資訊，幾分鐘內完成一份能收 RSVP
              的專屬喜帖網站——不用懂設計，也不用寫程式。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/create"
                className="rounded bg-[var(--brand-gold)] px-8 py-3 text-white transition-opacity hover:opacity-90"
              >
                開始建立你的喜帖
              </Link>
              <a
                href="#showcase"
                className="text-sm text-[var(--brand-ink-soft)] underline underline-offset-4 hover:text-[var(--brand-gold)]"
              >
                先看看作品範例
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xs">
            <div className="absolute -right-4 -top-4 w-full rotate-3 opacity-60">
              <InvitationCardVisual theme={CLASSIC_THEMES[1]} />
            </div>
            <div className="relative -rotate-2">
              <InvitationPreviewCard theme={CLASSIC_THEMES[0]} />
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-white/50 px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">why digital</p>
            <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>
              為什麼新人都選擇電子喜帖
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map((b) => (
                <div key={b.title}>
                  <div className="mb-3 h-px w-8 bg-[var(--brand-gold)]" />
                  <h3 className="font-medium text-foreground">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--brand-ink-soft)]">
                    {b.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Template showcase */}
        <section id="showcase" className="px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">showcase</p>
            <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>作品範例</h2>
            <p className="mt-3 max-w-lg text-[var(--brand-ink-soft)]">
              目前提供「經典」模板，可自由選擇配色氛圍；更多版面模板陸續推出中。
            </p>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {CLASSIC_THEMES.map((theme) => (
                <InvitationPreviewCard key={theme.name} theme={theme} />
              ))}
              <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--brand-line)] text-center">
                <p className={`${displayFont.className} text-lg text-[var(--brand-ink-soft)]`}>
                  Coming Soon
                </p>
                <p className="text-sm text-[var(--brand-ink-soft)]">更多模板敬請期待</p>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="px-6 py-20 sm:px-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl bg-[var(--foreground)] px-8 py-16 text-center text-[var(--background)]">
            <h2 className={`${headingFont.className} text-3xl font-semibold`}>準備好開始了嗎？</h2>
            <p className="max-w-md text-white/70">
              不用先註冊，直接試做看看——準備好要儲存時再建立帳號，內容不會遺失。
            </p>
            <Link
              href="/create"
              className="rounded bg-[var(--brand-gold)] px-8 py-3 text-white transition-opacity hover:opacity-90"
            >
              開始建立你的喜帖
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--brand-line)]/60 px-6 py-8 text-center text-xs text-[var(--brand-ink-soft)]">
        © {new Date().getFullYear()} The Vow Page 摯頁
      </footer>
    </div>
  );
}
