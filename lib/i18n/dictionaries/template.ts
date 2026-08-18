// Public invitation template (Classic) UI chrome - envelope, section
// eyebrows/hints, RSVP form, moments viewer, calendar links, expired-link
// page. Deliberately does NOT cover the couple's own invitation content
// (names, venue, custom messages) - only the surrounding template UI.

export const envelopeCopy = {
  open: { zh: "拆開信封", en: "Open the envelope" },
  hint: { zh: "點擊封蠟，拆開信封", en: "Tap the wax seal to open the envelope" },
};

export const heroCopy = {
  photoAlt: {
    zh: (groom: string, bride: string) => `${groom} 與 ${bride}`,
    en: (groom: string, bride: string) => `${groom} and ${bride}`,
  },
};

export const familyCopy = {
  photoAlt: { zh: "新人合影", en: "Photo of the couple" },
};

export const venueCopy = {
  fallback: { zh: "場地籌備中", en: "Venue details coming soon" },
};

export const scheduleCopy = {
  empty: { zh: "流程籌備中", en: "Schedule coming soon" },
  googleCalendar: { zh: "+ Google 日曆", en: "+ Google Calendar" },
};

export const calendarEventCopy = {
  titleSuffix: { zh: "婚禮晚宴", en: "Wedding Reception" },
  icsFilenameSuffix: { zh: "婚禮", en: "Wedding" },
  locationSeparator: { zh: "，", en: ", " },
};

export const footerTemplateCopy = {
  ringsAlt: { zh: "戒指", en: "Rings" },
};

export const scratchCopy = {
  dateFallback: { zh: "日期籌備中", en: "Date coming soon" },
  caption: { zh: "手指刮開，看看日期", en: "Scratch to reveal the date" },
  lunchSeating: { zh: "午宴入席", en: "Lunch seating" },
  dinnerSeating: { zh: "晚宴入席", en: "Dinner seating" },
};

export const rsvpCopy = {
  intro: { zh: "敬請回覆，期待與您共度這個重要時刻", en: "Please RSVP - we can't wait to share this moment with you" },
  openButton: { zh: "立即回覆 RSVP", en: "RSVP now" },
  close: { zh: "關閉", en: "Close" },
  name: { zh: "姓名", en: "Name" },
  attendingLegend: { zh: "是否出席", en: "Will you attend?" },
  attendingYes: { zh: "準時出席", en: "Attending" },
  attendingNo: { zh: "無法出席", en: "Not attending" },
  adultsCount: { zh: "大人人數", en: "No. of Adults" },
  childrenCount: { zh: "小孩人數", en: "No. of Children" },
  dietLegend: { zh: "飲食需求與過敏", en: "Dietary needs & allergies" },
  dietHint: {
    zh: "請務必勾選您的飲食禁忌或過敏，方便新人為您安排合適的餐點。",
    en: "Please tick anything you can't eat or are allergic to, so the couple can arrange suitable food for you.",
  },
  dietNote: { zh: "飲食需求備註", en: "Dietary notes" },
  dietNotePlaceholder: {
    zh: "其他飲食限制或過敏（選填）",
    en: "Other restrictions or allergies (optional)",
  },
  messageLabel: { zh: "給新人的話", en: "Message for the couple" },
  messagePlaceholder: { zh: "想對他們說的話", en: "What would you like to say to them?" },
  submit: { zh: "送出", en: "Submit" },
  previewNotice: {
    zh: "這是預覽畫面，儲存喜帖後賓客才能真的送出 RSVP。",
    en: "This is a preview - guests will be able to submit an RSVP once the invitation is saved.",
  },
  submitting: { zh: "送出中...", en: "Submitting..." },
  submitFailed: { zh: "送出失敗，請稍後再試。", en: "Something went wrong. Please try again." },
  submitSuccess: { zh: "感謝您的回覆！", en: "Thank you for your reply!" },
};

export const dietOptions = [
  { id: "vegetarian", zh: "素食", en: "Vegetarian" },
  { id: "vegan", zh: "全素", en: "Vegan" },
  { id: "no-beef", zh: "不吃牛肉", en: "No beef" },
  { id: "no-pork", zh: "不吃豬肉", en: "No pork" },
  { id: "seafood-allergy", zh: "海鮮過敏", en: "Seafood allergy" },
  { id: "nut-allergy", zh: "堅果過敏", en: "Nut allergy" },
  { id: "gluten-free", zh: "無麩質", en: "Gluten-free" },
  { id: "other", zh: "其他", en: "Other" },
] as const;

export const momentsViewerCopy = {
  closeAria: { zh: "關閉", en: "Close" },
  zoomAria: { zh: "放大照片", en: "Zoom in on photo" },
  switchAria: { zh: "切換到這張照片", en: "Switch to this photo" },
  prevAria: { zh: "上一張", en: "Previous photo" },
  nextAria: { zh: "下一張", en: "Next photo" },
};

export const expiredNoticeCopy = {
  badge: { zh: "已到期", en: "Expired" },
  title: { zh: "這份喜帖的公開期限已到期", en: "This invitation's public link has expired" },
  body1: { zh: "喜帖網址發布一年後會自動下線。", en: "Invitation links automatically go offline one year after publishing." },
  body2: {
    zh: "如果你是新人本人，登入後台即可續約重新上線。",
    en: "If this is your invitation, log in to renew it and bring it back online.",
  },
  renewCta: { zh: "登入續約", en: "Log in to renew" },
  backHome: { zh: "返回首頁", en: "Back to home" },
};

export const tryDesignCopy = {
  backHomeAria: { zh: "返回首頁", en: "Back to home" },
  cta: { zh: "套用此設計，開始編輯", en: "Use this design, start editing" },
};

export const notFoundCopy = {
  title: { zh: "這份喜帖不存在，或尚未公開", en: "This invitation doesn't exist, or hasn't been published yet" },
  body1: { zh: "可能是連結有誤，或喜帖還在準備中、尚未發布。", en: "The link may be incorrect, or the invitation is still being prepared." },
  body2: {
    zh: "如果你是新人本人，登入後台即可確認發布狀態。",
    en: "If this is your invitation, log in to check its publish status.",
  },
  backHome: { zh: "返回首頁", en: "Back to home" },
  loginToView: { zh: "登入查看我的喜帖", en: "Log in to view my invitation" },
};
