import Link from "next/link";
import { EB_Garamond } from "next/font/google";
import { Reveal } from "@/components/marketing/Reveal";
import { ShowcaseCarousel } from "@/components/marketing/ShowcaseCarousel";
import { CLASSIC_THEMES } from "@/components/templates/classic/themes";
import { headingFont } from "@/lib/fonts";

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

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4 shrink-0 text-[var(--brand-ink-soft)] transition-transform duration-200 group-open:rotate-180"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

const BENEFITS = [
  {
    icon: ShareIcon,
    title: "免印刷、免寄送",
    description: "一個連結分享給所有賓客，省下印製與郵寄的時間與費用",
  },
  {
    icon: LeafIcon,
    title: "環保無紙化",
    description: "不製造紙本浪費，符合現代新人重視的永續價值觀",
  },
  {
    icon: ClipboardCheckIcon,
    title: "RSVP 即時統計",
    description: "賓客直接線上回覆，出席人數自動彙整，不用再逐一電話確認",
  },
  {
    icon: MapPinIcon,
    title: "地圖與時區自動換算",
    description: "打上場地名稱，自動標出位置並換算時區，海外賓客也不會搞錯時間",
  },
  {
    icon: EditIcon,
    title: "隨時修改內容",
    description: "婚期異動、場地變更，後台直接更新，不用重新印製或補寄",
  },
  {
    icon: PhoneIcon,
    title: "手機也完美呈現",
    description: "拆信封、刮刮卡等互動效果，在手機上一樣流暢動人",
  },
];

const STEPS = [
  {
    number: "01",
    title: "挑選模板與配色",
    description: "選擇喜歡的樣式與色調，一鍵套用到你的喜帖",
  },
  {
    number: "02",
    title: "填寫資訊、上傳照片",
    description: "新人資訊、婚期地點、婚紗照，幾分鐘內就能完成",
  },
  {
    number: "03",
    title: "分享連結、收 RSVP",
    description: "傳給賓客，即時收到出席回覆與人數統計",
  },
];

const FAQS = [
  {
    question: "真的可以完全免費試做嗎？",
    answer: "可以。不用註冊就能直接編輯喜帖內容、上傳照片、預覽完整效果；準備好要正式發布、讓賓客看到時才需要建立帳號並付費。",
  },
  {
    question: "什麼時候需要付費？",
    answer:
      "只有在你要「發布」喜帖、產生可分享的公開網址時才需要付費，一次性 £39，不是訂閱制，設計與編輯階段完全免費。發布後提供一整年的公開瀏覽期，涵蓋婚禮前後所有需要賓客查看的時間。",
  },
  {
    question: "如果不滿意可以退款嗎？",
    answer:
      "可以。我們提供 14 天安心退款保證：付款後 14 天內，只要賓客尚未開始回覆 RSVP、且婚禮尚未舉行，都能透過信箱申請全額退款。",
  },
  {
    question: "賓客需要下載 App 或註冊帳號嗎？",
    answer: "不需要。賓客只要點連結就能看到喜帖並直接填寫 RSVP，不用下載任何東西，也不用註冊。",
  },
  {
    question: "喜帖網址可以自訂嗎？",
    answer: "可以，在後台可以自訂網址最後的英文名稱，方便記憶與分享給賓客。",
  },
  {
    question: "發布後還能修改內容嗎？",
    answer: "可以，發布後仍能隨時回後台修改文字內容、更換照片，不需要重新製作或補寄。",
  },
  {
    question: "手機上瀏覽會不會跑版？",
    answer: "不會，喜帖模板針對手機瀏覽完整優化，拆信封、刮刮卡等互動效果在手機上也能流暢呈現。",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--brand-line)]/60 bg-[var(--background)]/90 px-6 py-5 backdrop-blur sm:px-10">
        <span className={`${headingFont.className} text-lg text-[var(--brand-gold)]`}>The Vow Page 摯頁</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-[var(--brand-ink-soft)] hover:text-[var(--brand-gold)]">
            登入
          </Link>
          <Link
            href="/create"
            className="rounded bg-[var(--brand-gold-dark)] px-4 py-2 text-white transition-opacity hover:opacity-90"
          >
            免費試做喜帖
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
                開幕限定・前 20 組新人獨享優惠
              </span>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">wedding invitation</p>
              <h1
                className={`${headingFont.className} mt-4 text-4xl font-semibold leading-tight text-foreground sm:text-5xl`}
              >
                親手打造，專屬於你們的質感喜帖
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-6 max-w-md text-[var(--brand-ink-soft)]">
                融合封蠟拆封與 RSVP 回覆，輕鬆打造專屬互動喜帖
              </p>
            </Reveal>
            <Reveal delay={360}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/create"
                  className="rounded bg-[var(--brand-gold-dark)] px-8 py-3 text-white transition-opacity hover:opacity-90"
                >
                  免費體驗試做
                </Link>
                <a
                  href="#showcase"
                  className="text-sm text-[var(--brand-ink-soft)] underline underline-offset-4 hover:text-[var(--brand-gold)]"
                >
                  欣賞範例喜帖
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={480} className="mx-auto w-full max-w-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/templates/classic/hero-iphone-mockup.webp"
              alt="喜帖範例畫面"
              className="w-full"
            />
          </Reveal>
        </section>

        {/* Benefits */}
        <section className="bg-white/50 px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">why digital</p>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>
                為什麼新人都選擇電子喜帖
              </h2>
              <p className="mt-3 max-w-lg text-[var(--brand-ink-soft)]">
                紙本喜帖印刷、寄送耗時耗力，場地或時間異動時還常常來不及通知，這些麻煩，電子喜帖都幫你省下來
              </p>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map((b, i) => (
                <Reveal key={b.title} delay={(i % 3) * 100}>
                  <IconWrap>
                    <b.icon />
                  </IconWrap>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--brand-ink-soft)]">{b.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">how it works</p>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>三步驟完成喜帖</h2>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 120}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-gold)]/10">
                    <span className={`${headingFont.className} text-xl text-[var(--brand-gold)]`}>{step.number}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--brand-ink-soft)]">{step.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Template showcase */}
        <section id="showcase" className="bg-white/50 px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">showcase</p>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>作品範例</h2>
              <p className="mt-3 max-w-lg text-[var(--brand-ink-soft)]">
                目前提供「經典」模板，可自由選擇配色氛圍；更多版面模板陸續推出
              </p>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <ShowcaseCarousel themes={CLASSIC_THEMES} />
              <Reveal delay={(CLASSIC_THEMES.length % 4) * 100}>
                <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--brand-line)] text-center">
                  <p className={`${displayFont.className} text-lg text-[var(--brand-ink-soft)]`}>
                    Coming Soon
                  </p>
                  <p className="text-sm text-[var(--brand-ink-soft)]">更多模板敬請期待</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Founder story */}
        <section className="px-6 py-20 sm:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">our story</p>
            <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>
              為什麼我們做這個
            </h2>
            <p className="mt-6 text-[var(--brand-ink-soft)] leading-relaxed">
              「摯頁」的誕生，來自於一場我們想給朋友的驚喜。
            </p>
            <p className="mt-4 text-[var(--brand-ink-soft)] leading-relaxed">
              當時我們希望能有一張既有儀式感，可以溫柔拆開信封、刮開婚期彩蛋，又能讓賓客一鍵 RSVP
              回覆的數位喜帖。但找遍了市面上的工具，總覺得少了點質感與溫度，於是我們決定親手為他們打造。
            </p>
            <p className="mt-4 text-[var(--brand-ink-soft)] leading-relaxed">
              婚禮過後，陸續收到身邊朋友問：「這個喜帖太棒了，之後能不能借我用？」這才催生了摯頁，一個讓每對新人都能輕鬆上手、自由編輯並發布的喜帖平台。
            </p>
            <p className="mt-4 text-[var(--brand-ink-soft)] leading-relaxed">
              摯頁目前還是一個剛起步的小小雛形。如果你也喜歡這樣的儀式感，我們無比珍惜、也非常期待能參與你們這份專屬的幸福。
            </p>
          </Reveal>
        </section>

        {/* FAQ */}
        <section className="bg-white/50 px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <Reveal className="text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">faq</p>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>
                常見問題
              </h2>
            </Reveal>
            <div className="mt-10 flex flex-col divide-y divide-[var(--brand-line)] border-y border-[var(--brand-line)]">
              {FAQS.map((faq, i) => (
                <Reveal key={faq.question} delay={(i % 3) * 80}>
                  <details className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                      {faq.question}
                      <ChevronIcon />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--brand-ink-soft)]">{faq.answer}</p>
                  </details>
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
              src="/templates/classic/illus-cherub.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 bottom-0 w-64 opacity-40 sm:w-80"
            />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2 className={`${headingFont.className} text-3xl font-semibold`}>為你們的婚禮，開啟第一頁浪漫</h2>
              <p className="max-w-md text-white/70">
                無需事先註冊，隨心挑選封蠟與配色，親手拼湊出滿意的模樣後再為你們留下
              </p>
              <Link
                href="/create"
                className="rounded bg-[var(--brand-gold)] px-8 py-3 text-white transition-opacity hover:opacity-90"
              >
                免費開始創作喜帖
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="flex flex-col items-center gap-3 border-t border-[var(--brand-line)]/60 px-6 py-8 text-center text-xs text-[var(--brand-ink-soft)]">
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-[var(--brand-gold)]">
            服務條款
          </Link>
          <Link href="/privacy" className="hover:text-[var(--brand-gold)]">
            隱私權政策
          </Link>
        </div>
        <p>© {new Date().getFullYear()} The Vow Page 摯頁</p>
      </footer>
    </div>
  );
}
