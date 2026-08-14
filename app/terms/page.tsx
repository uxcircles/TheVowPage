import Link from "next/link";
import { headingFont } from "@/lib/fonts";

export const metadata = {
  title: "服務條款｜The Vow Page 摯頁",
};

const SECTIONS = [
  {
    title: "一、服務說明",
    body: [
      "The Vow Page 摯頁（以下稱「本服務」）是一個線上電子喜帖平台，提供新人挑選喜帖模板、編輯內容、上傳照片、管理賓客名單與 RSVP 回覆等功能。",
      "本服務由 The Vow Page 摯頁團隊（以下稱「我們」）提供，聯絡信箱為 thevowpage@gmail.com。",
    ],
  },
  {
    title: "二、帳號註冊與使用資格",
    body: [
      "您可以透過電子郵件／密碼或 Google 帳號註冊並登入本服務。您有責任妥善保管帳號密碼，並對於使用您帳號進行的所有活動負責。",
      "若您發現帳號遭未經授權使用，請立即透過 thevowpage@gmail.com 與我們聯絡。",
    ],
  },
  {
    title: "三、免費試做與付費發布",
    body: [
      "您可以在不註冊帳號的情況下，直接於「試做喜帖」頁面編輯喜帖內容、上傳照片並預覽效果。",
      "若要將喜帖發布為可分享給賓客的公開網址，需要建立帳號並完成一次性付費。付費為一次性費用，非訂閱制；發布後的喜帖網址自付款完成日起提供一年的公開瀏覽期間，到期後將自動下架，其設定與內容仍保留在您的帳號中。",
      "確切費用金額將於付款頁面顯示，並可能不時調整；調整後的價格不影響您已完成的付款。",
    ],
  },
  {
    title: "四、付款與退款",
    body: [
      "本服務透過第三方金流服務商 Stripe 處理付款，我們不會直接接觸或儲存您的信用卡卡號等付款資訊。",
      "由於發布服務屬於數位內容即時提供之性質，一經付款發布成功後，原則上不提供退款；若因系統錯誤導致重複扣款或服務無法正常提供，請於 7 日內與我們聯絡，我們將協助處理。",
    ],
  },
  {
    title: "五、使用者內容與智慧財產權",
    body: [
      "您於本服務上傳、輸入的所有文字、照片與其他內容（以下稱「使用者內容」）之權利仍歸您所有。您保證您擁有上傳這些內容所需的權利，且內容不侵害第三人（包含照片中出現的人物）之權益。",
      "為提供本服務（包含儲存、顯示、傳輸您的喜帖內容），您授予我們在必要範圍內使用、儲存與公開展示您使用者內容的權利，此授權於您刪除該內容或帳號後終止。",
      "本服務之模板設計、程式碼、介面與品牌（包含「The Vow Page 摯頁」名稱與標誌）之智慧財產權歸我們所有，未經授權不得重製或另行商業使用。",
    ],
  },
  {
    title: "六、賓客資料與 RSVP",
    body: [
      "您可以透過本服務蒐集賓客於公開喜帖頁面填寫的 RSVP 回覆（包含姓名、是否出席、人數、飲食需求與留言），以及您自行於後台輸入的賓客名單。",
      "這些資料由您（帳號擁有者）自行蒐集與管理，您應確保已依適用法令告知賓客資料蒐集之目的，並對這些資料的使用負最終責任。我們僅作為技術服務提供者，協助儲存與呈現這些資料。",
    ],
  },
  {
    title: "七、禁止行為",
    body: [
      "您不得利用本服務上傳違法、侵權、詐騙、騷擾或其他不當內容，不得嘗試入侵、干擾本服務系統，或以自動化方式大量存取、蒐集本服務資料。",
      "若您違反本條款，我們保留暫停或終止您帳號使用權限的權利，且不另行退款。",
    ],
  },
  {
    title: "八、服務中斷與變更",
    body: [
      "我們會盡力維持本服務穩定運作，但不保證服務不中斷或無錯誤。我們保留隨時修改、暫停或終止本服務全部或部分功能的權利，重大變更將盡可能事先於網站上公告。",
    ],
  },
  {
    title: "九、責任限制",
    body: [
      "在法律允許的最大範圍內，我們對於因使用或無法使用本服務所生之任何間接、附帶或衍生性損害，不負賠償責任。本服務依「現況」提供，不另作明示或默示之保證。",
    ],
  },
  {
    title: "十、服務終止",
    body: [
      "您可以隨時於後台刪除您的喜帖或帳號。若您嚴重違反本條款，我們亦得終止提供服務予您，並刪除相關內容。",
    ],
  },
  {
    title: "十一、準據法與管轄",
    body: [
      "本條款之解釋與適用，以及與本條款有關的爭議，均應依中華民國法律予以解釋和規範，並以台灣台北地方法院為第一審管轄法院。",
    ],
  },
  {
    title: "十二、條款修改",
    body: [
      "我們可能不時修改本條款，修改後將更新本頁面之公告日期。您於修改後繼續使用本服務，即視為同意修改後之條款。",
    ],
  },
  {
    title: "十三、聯絡我們",
    body: ["若您對本條款有任何疑問，歡迎透過 thevowpage@gmail.com 與我們聯絡。"],
  },
];

export default function TermsPage() {
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
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-gold)]">terms of service</p>
        <h1 className={`${headingFont.className} mt-3 text-3xl font-semibold text-foreground`}>服務條款</h1>
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
