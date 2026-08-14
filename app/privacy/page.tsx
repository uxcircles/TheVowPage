import Link from "next/link";
import { headingFont } from "@/lib/fonts";

export const metadata = {
  title: "隱私權政策｜The Vow Page 摯頁",
};

const SECTIONS = [
  {
    title: "一、適用範圍",
    body: [
      "本隱私權政策說明 The Vow Page 摯頁（以下稱「本服務」）如何蒐集、使用、儲存與保護您的個人資料，適用於所有使用本服務的帳號擁有者（新人）以及透過公開喜帖頁面填寫 RSVP 的賓客。",
      "使用本服務即表示您已閱讀並同意本政策之內容。",
    ],
  },
  {
    title: "二、我們蒐集哪些資料",
    body: [
      "帳號資料：當您以電子郵件／密碼或 Google 帳號註冊時，我們會蒐集您的電子郵件地址，並透過 Supabase Auth 儲存加密後的登入憑證。",
      "喜帖內容：您於編輯喜帖時輸入的新人姓名、雙方家長資訊、婚禮日期時間、場地資訊、婚宴流程、感謝詞等文字內容，以及您上傳的照片。",
      "賓客名單與 RSVP 回覆：您自行於後台輸入的賓客姓名與備註，以及賓客於公開喜帖頁面填寫的姓名、是否出席、出席人數、飲食需求與留言。",
      "付款資料：付款透過 Stripe 處理，我們僅會收到付款是否成功、金額與交易識別碼等紀錄，不會接觸或儲存您的完整信用卡卡號。",
      "技術資料：為維持服務運作與安全，我們可能記錄基本的存取紀錄（如時間戳記、錯誤訊息），用於除錯與防止濫用。",
    ],
  },
  {
    title: "三、我們如何使用您的資料",
    body: [
      "提供並維運本服務，包含儲存並顯示您的喜帖內容、處理付款、寄送必要的服務通知（如付款成功、帳號相關通知）。",
      "根據您輸入的場地地址，透過 Google 地圖服務轉換為地圖座標與時區，用於喜帖上的地圖顯示與活動時間換算。",
      "改善服務品質與排除技術問題。",
      "我們不會將您的個人資料用於與本服務無關的行銷用途，亦不會出售您的個人資料予第三方。",
    ],
  },
  {
    title: "四、資料分享與第三方服務",
    body: [
      "為提供本服務，我們使用以下第三方服務商處理部分資料，這些服務商僅依我們的指示處理資料，並各自受其隱私政策規範：",
      "・Supabase：提供資料庫、帳號驗證與照片儲存服務。",
      "・Stripe：處理付款交易，詳見 Stripe 隱私權政策。",
      "・Google：提供 Google 登入（OAuth）與地址轉地圖座標／時區之地理定位服務。",
      "除法律要求或為保護本服務與使用者權益之必要情形外，我們不會將您的個人資料提供予其他第三方。",
    ],
  },
  {
    title: "五、Cookie 使用說明",
    body: [
      "本服務使用必要的 Cookie 以維持您的登入狀態與網站基本功能運作，目前未使用第三方廣告或行銷追蹤 Cookie。若未來新增此類用途，我們將更新本政策並另行說明。",
    ],
  },
  {
    title: "六、資料保存期限",
    body: [
      "已發布的喜帖網址自付款完成日起提供一年公開瀏覽期間，到期後將自動下架、不再對外公開，但相關內容與設定仍保留於您的帳號中，供您日後查閱或重新發布。",
      "若您刪除喜帖或帳號，相關的喜帖內容、照片與賓客回覆資料將自我們的系統中刪除；因備份機制之故，完整清除可能需要一段合理時間。",
    ],
  },
  {
    title: "七、資料安全",
    body: [
      "我們透過 Supabase 提供的存取權限控制（Row Level Security）等機制，確保僅有帳號擁有者本人能夠存取、修改自己的喜帖內容與賓客資料。我們會採取合理的技術與管理措施保護您的資料，但無法保證絕對的資訊安全。",
    ],
  },
  {
    title: "八、您的權利",
    body: [
      "您可以隨時於後台查詢、修改您輸入的喜帖內容與賓客資料，並可自行刪除喜帖或整個帳號。",
      "若您需要進一步協助查詢、更正或刪除您的個人資料，歡迎透過 thevowpage@gmail.com 與我們聯絡，我們將於合理期間內處理您的請求。",
    ],
  },
  {
    title: "九、賓客資料的特別說明",
    body: [
      "透過公開喜帖頁面填寫 RSVP 的賓客，其資料是應帳號擁有者（新人）的要求而蒐集，帳號擁有者為該筆資料實際的蒐集與管理者，我們僅提供技術層面之儲存與呈現。",
      "若您是填寫 RSVP 的賓客，並希望查詢、更正或刪除您所填寫的資料，請直接聯絡邀請您的新人；若無法聯絡，您也可以透過 thevowpage@gmail.com 與我們聯絡，我們將協助處理。",
    ],
  },
  {
    title: "十、未成年人保護",
    body: [
      "本服務並非設計給兒童使用，帳號註冊須年滿法定成年年齡。RSVP 表單中的「小孩人數」欄位僅蒐集出席人數，不會另外蒐集兒童的姓名或其他可識別個人身分之資料。",
    ],
  },
  {
    title: "十一、政策修改",
    body: [
      "我們可能不時修改本政策，修改後將更新本頁面之公告日期。若有重大變更，我們會以合理方式另行通知。您於修改後繼續使用本服務，即視為同意修改後之政策。",
    ],
  },
  {
    title: "十二、聯絡我們",
    body: ["若您對本政策或您的個人資料有任何疑問，歡迎透過 thevowpage@gmail.com 與我們聯絡。"],
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[var(--brand-line)]/60 px-6 py-5 sm:px-10">
        <Link href="/" className={`${headingFont.className} text-lg text-[var(--brand-gold)]`}>
          The Vow Page 摯頁
        </Link>
        <Link href="/" className="text-sm text-[var(--brand-ink-soft)] hover:text-[var(--brand-gold)]">
          回首頁
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-10">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">privacy policy</p>
        <h1 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>隱私權政策</h1>
        <p className="mt-3 text-sm text-[var(--brand-ink-soft)]">最後更新日期：2026 年 8 月 14 日</p>

        <div className="mt-10 flex flex-col gap-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-medium text-foreground">{section.title}</h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.body.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-[var(--brand-ink-soft)]">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-[var(--brand-line)]/60 px-6 py-8 text-center text-xs text-[var(--brand-ink-soft)]">
        © {new Date().getFullYear()} The Vow Page 摯頁
      </footer>
    </div>
  );
}
