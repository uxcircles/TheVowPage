export const legalPageCopy = {
  backToHome: { zh: "回首頁", en: "Back to home" },
};

type Section = { title: { zh: string; en: string }; body: { zh: string; en: string }[] };

export const termsMeta = {
  metaTitle: { zh: "服務條款｜The Vow Page 摯頁", en: "Terms of Service | The Vow Page" },
  eyebrow: { zh: "terms of service", en: "terms of service" },
  title: { zh: "服務條款", en: "Terms of Service" },
  lastUpdated: { zh: "最後更新日期：2026 年 8 月 15 日", en: "Last updated: 15 August 2026" },
};

export const termsSections: Section[] = [
  {
    title: { zh: "一、服務說明", en: "1. About the Service" },
    body: [
      {
        zh: "The Vow Page 摯頁（以下稱「本服務」）是一個線上電子喜帖平台，提供新人挑選喜帖模板、編輯內容、上傳照片、管理賓客名單與 RSVP 回覆等功能。",
        en: "The Vow Page (the \"Service\") is an online digital wedding invitation platform that lets couples choose an invitation template, edit its content, upload photos, and manage their guest list and RSVP replies.",
      },
      {
        zh: "本服務由 UX CIRCLES Ltd（於英格蘭與威爾斯註冊之公司，以下稱「我們」）提供，聯絡信箱為 thevowpage@gmail.com。",
        en: "The Service is provided by UX CIRCLES Ltd (a company registered in England & Wales, \"we\" or \"us\"). You can contact us at thevowpage@gmail.com.",
      },
    ],
  },
  {
    title: { zh: "二、帳號註冊與使用資格", en: "2. Account Registration and Eligibility" },
    body: [
      {
        zh: "您可以透過電子郵件／密碼或 Google 帳號註冊並登入本服務。您有責任妥善保管帳號密碼，並對於使用您帳號進行的所有活動負責。",
        en: "You may register and sign in using an email address and password, or a Google account. You are responsible for keeping your account credentials secure and for all activity carried out under your account.",
      },
      {
        zh: "若您發現帳號遭未經授權使用，請立即透過 thevowpage@gmail.com 與我們聯絡。",
        en: "If you become aware of any unauthorised use of your account, please contact us immediately at thevowpage@gmail.com.",
      },
    ],
  },
  {
    title: { zh: "三、免費試做與付費發布", en: "3. Free Trial and Paid Publishing" },
    body: [
      {
        zh: "您可以在不註冊帳號的情況下，直接於「試做喜帖」頁面編輯喜帖內容、上傳照片並預覽效果。我們保留於系統合理使用範圍內，限制照片上傳數量或大小之權利。",
        en: "You can edit your invitation, upload photos and preview the result on the \"Try it\" page without creating an account. We reserve the right to limit the number or size of photos you can upload, within the bounds of reasonable use of the system.",
      },
      {
        zh: "若要將喜帖發布為可分享給賓客的公開網址，需要建立帳號並完成一次性付費。付費為一次性費用，非訂閱制；發布後的喜帖網址自付款完成日起提供一年的公開瀏覽期間，到期後將自動下架，其設定與內容仍保留在您的帳號中。",
        en: "To publish your invitation as a public, shareable web address, you'll need to create an account and make a one-off payment. This is a single payment, not a subscription. Once published, your invitation's web address remains publicly viewable for one year from the date of payment, after which it is automatically taken offline; its settings and content remain saved in your account.",
      },
      {
        zh: "一年期滿後，您可隨時付費重新發布或延長公開期限。若您的帳號超過二年未登入使用，我們保留隨時清理或刪除該帳號草稿內容與媒體檔案之權利，且不另行通知。請您自行妥善備份個人內容；我們對於因資料清理所致之損失不負保管或賠償責任。",
        en: "After the one-year period ends, you may pay to republish or extend it at any time. If your account has not been signed into for more than two years, we reserve the right to clear or delete that account's draft content and media files at any time, without further notice. Please keep your own backup of your content; we accept no responsibility for safekeeping, and no liability for any loss, resulting from such data clean-up.",
      },
      {
        zh: "確切費用金額將於付款頁面顯示，並可能不時調整；調整後的價格不影響您已完成的付款。",
        en: "The exact fee is shown on the payment page and may change from time to time; any change in price does not affect payments you have already made.",
      },
    ],
  },
  {
    title: { zh: "四、付款與 14 天安心退款保證", en: "4. Payment and the 14-Day Peace of Mind Guarantee" },
    body: [
      {
        zh: "本服務透過第三方金流服務商 Stripe 處理付款，我們不會直接接觸或儲存您的信用卡卡號等付款資訊。",
        en: "Payments are processed by our third-party payment provider, Stripe. We do not directly access or store your card number or other payment details.",
      },
      {
        zh: "您同意按下「付款發布」後，我們將立即開始提供數位內容與公開網址服務。依據英國《消費者合約條例》（Consumer Contracts Regulations）及類似消費者保護法規，數位服務一經即時提供開始，即代表您同意放棄原本可能享有之無條件 14 天猶豫期取消與退款權利。",
        en: "By clicking \"Pay to publish\", you agree that we will begin supplying the digital content and public web address service immediately. Under the UK Consumer Contracts Regulations and similar consumer protection laws, once supply of digital content begins immediately in this way, you thereby acknowledge and agree that you lose any statutory unconditional 14-day cooling-off right to cancel and receive a refund.",
      },
      {
        zh: "儘管如此，我們仍自願提供「14 天安心退款保證」：自付款完成日起 14 天內，若您尚未收到任何賓客的 RSVP 回覆，可透過 thevowpage@gmail.com 申請全額退款；退款成功後，該喜帖網址將立即轉為草稿狀態並停止公開瀏覽。",
        en: "Notwithstanding this, we voluntarily offer a \"14-Day Peace of Mind Guarantee\": within 14 days of completing payment, if you have not yet received any guest RSVP replies, you may request a full refund by emailing thevowpage@gmail.com. Once a refund is issued, that invitation's web address is immediately reverted to draft status and taken offline.",
      },
      {
        zh: "以下情形不適用本保證：（一）已有賓客透過公開喜帖頁面提交 RSVP 回覆（不含您自行測試用途的回覆）；（二）您的宴客日（喜帖內設定之婚禮日期）已於申請退款前到來。此時視為服務已實質履行。",
        en: "This guarantee does not apply where: (i) a guest has already submitted an RSVP reply via the public invitation page (not including replies you submitted yourself for testing purposes); or (ii) your wedding date (as set in the invitation) has already passed before you request the refund. In either case, the service is considered to have been substantially performed.",
      },
      {
        zh: "若因系統錯誤導致重複扣款或服務無法正常提供，不受上述條件限制，請與我們聯絡，我們將協助處理。",
        en: "Where a system error results in duplicate charges or the service failing to work properly, the above conditions do not apply - please contact us and we will help resolve it.",
      },
    ],
  },
  {
    title: { zh: "五、使用者內容與智慧財產權", en: "5. User Content and Intellectual Property" },
    body: [
      {
        zh: "您於本服務上傳、輸入的所有文字、照片與其他內容（以下稱「使用者內容」）之權利仍歸您所有。您保證您擁有上傳這些內容所需的權利，且內容不侵害第三人（包含照片中出現的人物）之權益。",
        en: "You retain ownership of all text, photos and other content you upload or enter into the Service (\"User Content\"). You warrant that you hold the rights necessary to upload this content, and that it does not infringe the rights of any third party (including anyone appearing in your photos).",
      },
      {
        zh: "為提供本服務（包含儲存、顯示、傳輸您的喜帖內容），您授予我們在必要範圍內使用、儲存與公開展示您使用者內容的權利，此授權於您刪除該內容或帳號後終止。",
        en: "To provide the Service (including storing, displaying and transmitting your invitation content), you grant us the right to use, store and publicly display your User Content to the extent necessary. This licence ends when you delete that content or your account.",
      },
      {
        zh: "本服務之模板設計、程式碼、介面與品牌（包含「The Vow Page 摯頁」名稱與標誌）之智慧財產權歸我們所有，未經授權不得重製或另行商業使用。",
        en: "Intellectual property rights in the Service's template designs, code, interface and branding (including the \"The Vow Page\" name and logo) belong to us and may not be reproduced or used commercially without authorisation.",
      },
      {
        zh: "若我們收到第三方（如攝影師、版權所有人或照片當事人）之通知，主張您上傳之內容侵害其智慧財產權或肖像權，我們保留於通知您後，暫時隱藏或移除該內容之權利。",
        en: "If we receive notice from a third party (such as a photographer, copyright holder, or someone appearing in a photo) claiming that content you have uploaded infringes their intellectual property or image rights, we reserve the right to temporarily hide or remove that content after notifying you.",
      },
    ],
  },
  {
    title: { zh: "六、賓客資料與 RSVP", en: "6. Guest Data and RSVPs" },
    body: [
      {
        zh: "您可以透過本服務蒐集賓客於公開喜帖頁面填寫的 RSVP 回覆（包含姓名、是否出席、人數、飲食需求與留言），以及您自行於後台輸入的賓客名單。",
        en: "The Service lets you collect guest RSVP replies submitted through the public invitation page (including name, attendance, headcount, dietary requirements and messages), as well as any guest list you enter yourself in your dashboard.",
      },
      {
        zh: "這些資料由您（帳號擁有者）自行蒐集與管理，您應確保已依適用法令告知賓客資料蒐集之目的，並對這些資料的使用負最終責任。我們僅作為技術服務提供者，協助儲存與呈現這些資料。",
        en: "This data is collected and managed by you, the account holder. You are responsible for informing guests of the purpose of collecting their data in accordance with applicable law, and for the ultimate use of that data. We act only as a technical service provider, helping to store and display it.",
      },
      {
        zh: "若賓客欲查詢、更正或刪除其於 RSVP 中填寫之個人資料，應直接聯絡喜帖發起人（即您）；若有技術上的協助需求，賓客亦可透過 thevowpage@gmail.com 與我們聯絡。",
        en: "Guests wishing to access, correct or delete the personal data they submitted in an RSVP should contact the invitation's creator (i.e. you) directly; for technical assistance, guests may also contact us at thevowpage@gmail.com.",
      },
    ],
  },
  {
    title: { zh: "七、禁止行為", en: "7. Prohibited Conduct" },
    body: [
      {
        zh: "您不得利用本服務上傳違法、侵權、詐騙、騷擾或其他不當內容，不得嘗試入侵、干擾本服務系統，或以自動化方式大量存取、蒐集本服務資料。",
        en: "You must not use the Service to upload unlawful, infringing, fraudulent, harassing or otherwise inappropriate content, attempt to breach or interfere with our systems, or use automated means to access or harvest data from the Service at scale.",
      },
      {
        zh: "若您違反本條款，我們保留暫停或終止您帳號使用權限的權利，且不另行退款。",
        en: "If you breach these Terms, we reserve the right to suspend or terminate your account access, without further refund.",
      },
    ],
  },
  {
    title: { zh: "八、服務中斷與變更", en: "8. Service Interruption and Changes" },
    body: [
      {
        zh: "我們會盡力維持本服務穩定運作，但不保證服務不中斷或無錯誤。我們保留隨時修改、暫停或終止本服務全部或部分功能的權利，重大變更將盡可能事先於網站上公告。",
        en: "We will do our best to keep the Service running reliably, but we do not guarantee it will be uninterrupted or error-free. We reserve the right to modify, suspend or discontinue all or part of the Service at any time; where practicable, we will announce material changes on our website in advance.",
      },
    ],
  },
  {
    title: { zh: "九、責任限制", en: "9. Limitation of Liability" },
    body: [
      {
        zh: "在法律允許的最大範圍內，我們對於因使用或無法使用本服務所生之任何間接、附帶或衍生性損害，不負賠償責任。本服務依「現況」提供，不另作明示或默示之保證。",
        en: "To the maximum extent permitted by law, we are not liable for any indirect, incidental or consequential loss arising from your use of, or inability to use, the Service. The Service is provided \"as is\", without any further express or implied warranty.",
      },
      {
        zh: "在法律允許的最大範圍內，我們因本服務所生之最大總賠償責任，以您就該次爭議所涉之特定喜帖服務實際支付予我們之費用總額（即該次發布費用）為上限。",
        en: "To the maximum extent permitted by law, our total liability arising from the Service is capped at the total amount you actually paid us for the specific invitation service giving rise to the dispute (i.e. that publishing fee).",
      },
    ],
  },
  {
    title: { zh: "十、服務終止", en: "10. Termination" },
    body: [
      {
        zh: "您可以隨時於後台刪除您的喜帖或帳號。若您嚴重違反本條款，我們亦得終止提供服務予您，並刪除相關內容。",
        en: "You may delete your invitation or account from your dashboard at any time. If you seriously breach these Terms, we may also terminate the Service to you and delete the related content.",
      },
    ],
  },
  {
    title: { zh: "十一、準據法與管轄", en: "11. Governing Law and Jurisdiction" },
    body: [
      {
        zh: "本條款之解釋與適用，以及與本條款有關的爭議，均應依英格蘭與威爾斯法律（the laws of England and Wales）予以解釋和規範，並以英格蘭與威爾斯法院為管轄法院。",
        en: "These Terms, and any dispute arising out of or in connection with them, are governed by and construed in accordance with the laws of England and Wales, and are subject to the exclusive jurisdiction of the courts of England and Wales.",
      },
      {
        zh: "若您是消費者，本條款不影響您依所在地（例如台灣）法律享有之任何強制性消費者保護權利。",
        en: "If you are a consumer, nothing in these Terms affects any mandatory consumer protection rights you may have under the law of your own country of residence (for example, Taiwan).",
      },
    ],
  },
  {
    title: { zh: "十二、條款修改", en: "12. Changes to These Terms" },
    body: [
      {
        zh: "我們可能不時修改本條款，修改後將更新本頁面之公告日期。您於修改後繼續使用本服務，即視為同意修改後之條款。",
        en: "We may update these Terms from time to time; the \"last updated\" date on this page will be revised accordingly. Your continued use of the Service after any changes take effect constitutes your acceptance of the updated Terms.",
      },
    ],
  },
  {
    title: { zh: "十三、聯絡我們", en: "13. Contact Us" },
    body: [
      {
        zh: "若您對本條款有任何疑問，歡迎透過 thevowpage@gmail.com 與我們聯絡。",
        en: "If you have any questions about these Terms, please contact us at thevowpage@gmail.com.",
      },
    ],
  },
];

export const privacyMeta = {
  metaTitle: { zh: "隱私權政策｜The Vow Page 摯頁", en: "Privacy Policy | The Vow Page" },
  eyebrow: { zh: "privacy policy", en: "privacy policy" },
  title: { zh: "隱私權政策", en: "Privacy Policy" },
  lastUpdated: { zh: "最後更新日期：2026 年 8 月 14 日", en: "Last updated: 14 August 2026" },
};

export const privacySections: Section[] = [
  {
    title: { zh: "一、適用範圍", en: "1. Scope" },
    body: [
      {
        zh: "本隱私權政策說明 The Vow Page 摯頁（以下稱「本服務」，由 UX CIRCLES Ltd 提供）如何蒐集、使用、儲存與保護您的個人資料，適用於所有使用本服務的帳號擁有者（新人）以及透過公開喜帖頁面填寫 RSVP 的賓客。",
        en: "This Privacy Policy explains how The Vow Page (the \"Service\", provided by UX CIRCLES Ltd) collects, uses, stores and protects your personal data. It applies to all account holders (couples) using the Service, as well as guests who submit an RSVP through a public invitation page.",
      },
      {
        zh: "使用本服務即表示您已閱讀並同意本政策之內容。",
        en: "By using the Service, you confirm that you have read and agree to this Policy.",
      },
    ],
  },
  {
    title: { zh: "二、我們蒐集哪些資料", en: "2. What Data We Collect" },
    body: [
      {
        zh: "帳號資料：當您以電子郵件／密碼或 Google 帳號註冊時，我們會蒐集您的電子郵件地址，並透過 Supabase Auth 儲存加密後的登入憑證。",
        en: "Account data: when you register with an email address and password, or a Google account, we collect your email address and store your encrypted login credentials via Supabase Auth.",
      },
      {
        zh: "喜帖內容：您於編輯喜帖時輸入的新人姓名、雙方家長資訊、婚禮日期時間、場地資訊、婚宴流程、感謝詞等文字內容，以及您上傳的照片。",
        en: "Invitation content: the text you enter while editing your invitation - such as the couple's names, both families' details, the wedding date and time, venue information, the schedule and thank-you message - along with any photos you upload.",
      },
      {
        zh: "賓客名單與 RSVP 回覆：您自行於後台輸入的賓客姓名與備註，以及賓客於公開喜帖頁面填寫的姓名、是否出席、出席人數、飲食需求與留言。",
        en: "Guest list and RSVP replies: the guest names and notes you enter yourself in your dashboard, and the name, attendance, headcount, dietary requirements and messages guests submit via the public invitation page.",
      },
      {
        zh: "付款資料：付款透過 Stripe 處理，我們僅會收到付款是否成功、金額與交易識別碼等紀錄，不會接觸或儲存您的完整信用卡卡號。",
        en: "Payment data: payments are processed by Stripe. We only receive records such as whether a payment succeeded, the amount, and a transaction identifier - we never access or store your full card number.",
      },
      {
        zh: "技術資料：為維持服務運作與安全，我們可能記錄基本的存取紀錄（如時間戳記、錯誤訊息），用於除錯與防止濫用。",
        en: "Technical data: to keep the Service running and secure, we may log basic access records (such as timestamps and error messages) for debugging and abuse prevention.",
      },
    ],
  },
  {
    title: { zh: "三、我們如何使用您的資料", en: "3. How We Use Your Data" },
    body: [
      {
        zh: "提供並維運本服務，包含儲存並顯示您的喜帖內容、處理付款、寄送必要的服務通知（如付款成功、帳號相關通知）。",
        en: "To provide and operate the Service, including storing and displaying your invitation content, processing payments, and sending necessary service notifications (such as payment confirmations and account-related notices).",
      },
      {
        zh: "根據您輸入的場地地址，透過 OpenStreetMap（Nominatim）地理定位服務轉換為地圖座標與時區，用於喜帖上的地圖顯示與活動時間換算。",
        en: "To convert the venue address you enter into map coordinates and a time zone via OpenStreetMap's Nominatim geolocation service, used to display the map and convert the event time on your invitation.",
      },
      {
        zh: "改善服務品質與排除技術問題。",
        en: "To improve the quality of the Service and troubleshoot technical issues.",
      },
      {
        zh: "我們不會將您的個人資料用於與本服務無關的行銷用途，亦不會出售您的個人資料予第三方。",
        en: "We do not use your personal data for marketing purposes unrelated to the Service, and we do not sell your personal data to third parties.",
      },
    ],
  },
  {
    title: { zh: "四、資料分享與第三方服務", en: "4. Data Sharing and Third-Party Services" },
    body: [
      {
        zh: "為提供本服務，我們使用以下第三方服務商處理部分資料，這些服務商僅依我們的指示處理資料，並各自受其隱私政策規範：",
        en: "To provide the Service, we use the following third-party providers to process certain data. These providers act only on our instructions and are each subject to their own privacy policy:",
      },
      {
        zh: "・Supabase：提供資料庫、帳號驗證與照片儲存服務。",
        en: "・Supabase: provides our database, account authentication and photo storage.",
      },
      {
        zh: "・Stripe：處理付款交易，詳見 Stripe 隱私權政策。",
        en: "・Stripe: processes payment transactions - see Stripe's Privacy Policy for details.",
      },
      {
        zh: "・Google：提供 Google 登入（OAuth）服務。",
        en: "・Google: provides Google Sign-In (OAuth).",
      },
      {
        zh: "・OpenStreetMap（Nominatim）：提供地址轉地圖座標／時區之地理定位服務。",
        en: "・OpenStreetMap (Nominatim): provides the geolocation service that converts addresses into map coordinates and time zones.",
      },
      {
        zh: "除法律要求或為保護本服務與使用者權益之必要情形外，我們不會將您的個人資料提供予其他第三方。",
        en: "Other than where required by law or necessary to protect the Service and our users' rights, we do not disclose your personal data to any other third party.",
      },
    ],
  },
  {
    title: { zh: "五、Cookie 使用說明", en: "5. Cookies" },
    body: [
      {
        zh: "本服務使用必要的 Cookie 以維持您的登入狀態、記住您的語言偏好，以及網站基本功能運作，目前未使用第三方廣告或行銷追蹤 Cookie。若未來新增此類用途，我們將更新本政策並另行說明。",
        en: "The Service uses essential cookies to keep you signed in, remember your language preference, and support basic site functionality. We do not currently use third-party advertising or marketing tracking cookies. If we introduce this in future, we will update this Policy and explain it separately.",
      },
    ],
  },
  {
    title: { zh: "六、資料保存期限", en: "6. Data Retention Period" },
    body: [
      {
        zh: "已發布的喜帖網址自付款完成日起提供一年公開瀏覽期間，到期後將自動下架、不再對外公開，但相關內容與設定（包含賓客名單與 RSVP 回覆資料）仍保留於您的帳號中，直到您主動刪除喜帖或帳號為止，供您日後查閱或重新發布。",
        en: "A published invitation's web address remains publicly viewable for one year from the date of payment, after which it is automatically taken offline and no longer publicly accessible. The related content and settings (including your guest list and RSVP data) remain saved in your account until you delete the invitation or your account yourself, so you can review or republish it later.",
      },
      {
        zh: "若您的帳號超過二年未登入使用，我們保留隨時清理或刪除該帳號草稿內容、照片與賓客資料之權利，且不另行通知。請您自行妥善備份重要資料；我們對於因資料清理所致之損失不負保管或賠償責任。",
        en: "If your account has not been signed into for more than two years, we reserve the right to clear or delete that account's draft content, photos and guest data at any time, without further notice. Please keep your own backup of anything important; we accept no responsibility for safekeeping, and no liability for any loss, resulting from such data clean-up.",
      },
      {
        zh: "若您刪除喜帖或帳號，相關的喜帖內容、照片與賓客回覆資料將自我們的系統中刪除；因備份機制之故，完整清除可能需要一段合理時間。",
        en: "If you delete an invitation or your account, the related invitation content, photos and guest reply data will be deleted from our systems; due to our backup processes, full removal may take a reasonable amount of time.",
      },
    ],
  },
  {
    title: { zh: "七、資料安全", en: "7. Data Security" },
    body: [
      {
        zh: "我們透過 Supabase 提供的存取權限控制（Row Level Security）等機制，確保僅有帳號擁有者本人能夠存取、修改自己的喜帖內容與賓客資料。我們會採取合理的技術與管理措施保護您的資料，但無法保證絕對的資訊安全。",
        en: "We use mechanisms such as Supabase's Row Level Security access controls to ensure that only the account holder can access or modify their own invitation content and guest data. We take reasonable technical and organisational measures to protect your data, but cannot guarantee absolute security.",
      },
    ],
  },
  {
    title: { zh: "八、您的權利", en: "8. Your Rights" },
    body: [
      {
        zh: "您可以隨時於後台查詢、修改您輸入的喜帖內容與賓客資料，並可自行刪除喜帖或整個帳號。",
        en: "You can view and edit the invitation content and guest data you've entered from your dashboard at any time, and can delete your invitation or your entire account yourself.",
      },
      {
        zh: "若您需要進一步協助查詢、更正或刪除您的個人資料，歡迎透過 thevowpage@gmail.com 與我們聯絡，我們將於合理期間內處理您的請求。",
        en: "If you need further help accessing, correcting or deleting your personal data, please contact us at thevowpage@gmail.com and we will handle your request within a reasonable time.",
      },
    ],
  },
  {
    title: { zh: "九、賓客資料的特別說明", en: "9. A Note on Guest Data" },
    body: [
      {
        zh: "透過公開喜帖頁面填寫 RSVP 的賓客，其資料是應帳號擁有者（新人）的要求而蒐集，帳號擁有者為該筆資料實際的蒐集與管理者（即資料保護法規中的「資料控制者」，Data Controller），我們僅作為「資料處理者」（Data Processor），提供技術層面之儲存與呈現。",
        en: "Data submitted by guests via RSVP on a public invitation page is collected at the request of the account holder (the couple), who is the actual collector and controller of that data (the \"Data Controller\" under data protection law). We act only as a \"Data Processor\", providing storage and display at a technical level.",
      },
      {
        zh: "若您是填寫 RSVP 的賓客，並希望查詢、更正或刪除您所填寫的資料，請直接聯絡邀請您的新人；若無法聯絡，您也可以透過 thevowpage@gmail.com 與我們聯絡，我們將協助處理。",
        en: "If you are a guest who submitted an RSVP and would like to access, correct or delete the data you provided, please contact the couple who invited you directly. If you're unable to reach them, you may also contact us at thevowpage@gmail.com and we will help.",
      },
    ],
  },
  {
    title: { zh: "十、未成年人保護", en: "10. Protection of Minors" },
    body: [
      {
        zh: "本服務並非設計給兒童使用，帳號註冊須年滿法定成年年齡。RSVP 表單中的「小孩人數」欄位僅蒐集出席人數，不會另外蒐集兒童的姓名或其他可識別個人身分之資料。",
        en: "The Service is not designed for use by children, and account registration requires you to have reached the legal age of majority. The \"number of children\" field in the RSVP form only collects a headcount, and does not separately collect children's names or other personally identifiable information.",
      },
    ],
  },
  {
    title: { zh: "十一、政策修改", en: "11. Changes to This Policy" },
    body: [
      {
        zh: "我們可能不時修改本政策，修改後將更新本頁面之公告日期。若有重大變更，我們會以合理方式另行通知。您於修改後繼續使用本服務，即視為同意修改後之政策。",
        en: "We may update this Policy from time to time; the \"last updated\" date on this page will be revised accordingly. Where changes are material, we will notify you separately by reasonable means. Your continued use of the Service after any changes take effect constitutes your acceptance of the updated Policy.",
      },
    ],
  },
  {
    title: { zh: "十二、聯絡我們", en: "12. Contact Us" },
    body: [
      {
        zh: "若您對本政策或您的個人資料有任何疑問，歡迎透過 thevowpage@gmail.com 與我們聯絡。",
        en: "If you have any questions about this Policy or your personal data, please contact us at thevowpage@gmail.com.",
      },
    ],
  },
];
