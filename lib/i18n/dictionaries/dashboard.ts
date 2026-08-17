// Dashboard/editor UI copy. Deliberately does NOT cover default *content*
// values a couple's invitation ships with (thank-you message fallback,
// schedule placeholder examples, example parent names, or the 新郎/新娘
// relationship-label defaults) - those are the couple's own content
// defaults, out of scope for this pass (see the i18n plan). Only the
// surrounding editor chrome (section titles, field labels, buttons,
// hints) is translated here.

export const editForm = {
  sections: {
    basicInfo: { zh: "基本資訊", en: "Basic Info" },
    family: { zh: "雙方家庭資訊", en: "Family Details" },
    venue: { zh: "場地", en: "Venue" },
    dateTime: { zh: "婚禮日期時間", en: "Wedding Date & Time" },
    schedule: { zh: "婚宴流程", en: "Schedule" },
    dressCode: { zh: "服裝建議", en: "Dress Code" },
    rsvp: { zh: "RSVP 回覆出席", en: "RSVP" },
    thanks: { zh: "感謝詞", en: "Thank-You Message" },
  },
  show: { zh: "顯示", en: "Show" },
  groomLabelField: { zh: "稱謂（例如：新郎、新人一）", en: "Label (e.g. Groom, Partner 1)" },
  brideLabelField: { zh: "稱謂（例如：新娘、新人二）", en: "Label (e.g. Bride, Partner 2)" },
  // Appended directly after the couple's own label text, e.g.
  // "{groomLabel}姓名" / "{groomLabel} Name" - kept as plain suffixes
  // (rather than a function) so this stays a simple lookup like every
  // other entry; the leading space in the English suffix is intentional.
  nameSuffix: { zh: "姓名", en: " Name" },
  // Straight apostrophe (not the curly ’) deliberately - the site's CJK
  // body font (Noto Sans TC) renders U+2019 at CJK-punctuation width
  // (~14px, vs ~4px for a plain U+0027), which reads as a stray gap
  // wherever this suffix follows a name. See parentsRelationAria below too.
  parentsSuffix: { zh: "雙親", en: "'s Parents" },
  // Default/placeholder for the relation-word field next to the parents'
  // names. Unlike other content defaults (新郎/新娘) this one's word order
  // is locale-dependent - "之子" reads fine suffixed after the parents'
  // names, but "Son of" only reads correctly prefixed - so both the
  // value/placeholder text AND the two fields' on-screen order (see the
  // `locale === "en"` swap around these fields in WeddingEditForm/
  // DraftEditor) follow site locale.
  sonOfDefault: { zh: "之子", en: "Son of" },
  daughterOfDefault: { zh: "之女", en: "Daughter of" },
  groomParentsPlaceholder: { zh: "林建平・王淑芬", en: "James Wilson & Susan Wilson" },
  brideParentsPlaceholder: { zh: "黃文昌・李美玲", en: "Michael Johnson & Emily Johnson" },
  dressCodePlaceholder: {
    zh: "建議服裝：香檳金、酒紅色系，避免純白色系",
    en: "Suggested attire: champagne gold and burgundy tones - please avoid all-white",
  },
  parentsRelationAria: { zh: "與雙親的關係稱謂", en: "'s relationship to parents" },
  venueName: { zh: "場地名稱", en: "Venue name" },
  venueHall: { zh: "廳別 / 樓層", en: "Hall / floor" },
  venueAddress: { zh: "地址", en: "Address" },
  switchToManualCoords: { zh: "地圖位置不正確？改成手動輸入座標", en: "Map location wrong? Enter coordinates manually" },
  switchToAutoLocate: { zh: "改回自動定位", en: "Switch back to automatic location" },
  latitude: { zh: "緯度", en: "Latitude" },
  longitude: { zh: "經度", en: "Longitude" },
  locating: { zh: "定位中...", en: "Locating..." },
  confirmMapLocation: { zh: "📍 確認地圖位置", en: "📍 Confirm map location" },
  locatedTimezonePrefix: { zh: "已定位，判斷時區為：", en: "Located - detected time zone: " },
  locateFailed: {
    zh: "找不到這個地點，請確認場地名稱或地址，或改用手動輸入座標。",
    en: "Couldn't find that location - please check the venue name or address, or enter coordinates manually.",
  },
  dateTimeLabel: { zh: "日期與時間", en: "Date & time" },
  timezonePrefix: { zh: "時區：", en: "Time zone: " },
  timezoneTooltip: {
    zh: "系統會依場地位置自動判斷時區，儲存後會依最新的場地位置重新確認。",
    en: "The time zone is detected automatically from the venue location, and re-checked against it each time you save.",
  },
  deleteAria: { zh: "刪除", en: "Delete" },
  addScheduleItem: { zh: "+ 新增流程項目", en: "+ Add schedule item" },
  rsvpEnabledHint: {
    zh: "賓客可以直接在喜帖頁面回覆是否出席，回覆會顯示在「RSVP 回覆」頁面",
    en: "Guests can RSVP directly on the invitation page - replies show up on the \"RSVP\" page",
  },
};

export const chromeCopy = {
  backToEditing: { zh: "✕ 返回編輯", en: "✕ Back to editing" },
  back: { zh: "← 返回", en: "← Back" },
  published: { zh: "已發布", en: "Published" },
  draft: { zh: "草稿", en: "Draft" },
  expired: { zh: "已到期", en: "Expired" },
  validUntilPrefix: { zh: "有效期限至 ", en: "Valid until " },
  saved: { zh: "已儲存", en: "Saved" },
  checkoutSuccess: { zh: "付款成功！可以發布喜帖了。", en: "Payment successful! You can now publish your invitation." },
  publishToggleFailed: { zh: "操作失敗，請稍後再試。", en: "Something went wrong. Please try again." },
  refundGuarantee: { zh: "14 天安心退款保證", en: "14-Day Peace of Mind Guarantee" },
  save: { zh: "儲存", en: "Save" },
  saving: { zh: "儲存中...", en: "Saving..." },
  preview: { zh: "預覽", en: "Preview" },
  processing: { zh: "處理中...", en: "Processing..." },
  unpublish: { zh: "取消發布", en: "Unpublish" },
  publish: { zh: "發布喜帖", en: "Publish invitation" },
  payToPublish: { zh: "付費解鎖發布", en: "Pay to publish" },
  unsavedTitle: { zh: "尚未儲存", en: "Unsaved changes" },
  unsavedMessage: { zh: "您有尚未儲存的變更，確定要離開嗎？", en: "You have unsaved changes. Are you sure you want to leave?" },
  leave: { zh: "離開", en: "Leave" },
};

export const editTabs = {
  content: { zh: "內容編輯", en: "Content" },
  guests: { zh: "賓客名單", en: "Guests" },
  rsvps: { zh: "RSVP 回覆", en: "RSVPs" },
};

export const dashboardPageCopy = {
  heading: { zh: "我的喜帖", en: "My Invitations" },
  empty: { zh: "還沒有喜帖，點擊上方按鈕建立第一個吧。", en: "No invitations yet - click the button above to create your first one." },
};

export const guestsPageCopy = {
  hint: {
    zh: "這是你自己整理邀請對象用的名單，不會顯示在公開喜帖頁上。",
    en: "This is your own private list for organising invitees - it won't show on the public invitation page.",
  },
};

export const rsvpsPageCopy = {
  stats: {
    replies: { zh: "回覆數", en: "Replies" },
    attending: { zh: "出席", en: "Attending" },
    notAttending: { zh: "不出席", en: "Not attending" },
    headcount: { zh: "預估出席人數", en: "Estimated headcount" },
  },
};

export const guestListCopy = {
  namePlaceholder: { zh: "姓名", en: "Name" },
  notePlaceholder: { zh: "備註（選填）", en: "Note (optional)" },
  addPending: { zh: "新增中...", en: "Adding..." },
  add: { zh: "新增", en: "Add" },
  addFailed: { zh: "新增賓客失敗，請稍後再試。", en: "Couldn't add guest. Please try again." },
  deleteFailed: { zh: "刪除賓客失敗，請稍後再試。", en: "Couldn't delete guest. Please try again." },
  empty: { zh: "還沒有賓客，新增第一位吧。", en: "No guests yet - add your first one." },
};

export const rsvpTableCopy = {
  headers: {
    name: { zh: "姓名", en: "Name" },
    attending: { zh: "出席", en: "Attending" },
    adults: { zh: "大人", en: "Adults" },
    children: { zh: "小孩", en: "Children" },
    diet: { zh: "飲食需求", en: "Dietary needs" },
    message: { zh: "留言", en: "Message" },
    time: { zh: "時間", en: "Time" },
  },
  attendingYes: { zh: "出席", en: "Attending" },
  attendingNo: { zh: "不出席", en: "Not attending" },
  exportCsv: { zh: "匯出 CSV", en: "Export CSV" },
  empty: { zh: "還沒有收到回覆。", en: "No replies yet." },
  deleteFailed: { zh: "刪除失敗，請稍後再試。", en: "Couldn't delete. Please try again." },
  confirmTitle: { zh: "刪除回覆", en: "Delete reply" },
  confirmMessage: {
    zh: "確定要刪除這筆 RSVP 回覆嗎？刪除後無法復原。",
    en: "Are you sure you want to delete this RSVP reply? This cannot be undone.",
  },
};

export const photoSlotCopy = {
  compressing: { zh: "壓縮中...", en: "Compressing..." },
  change: { zh: "更換", en: "Change" },
  upload: { zh: "上傳", en: "Upload" },
  uploadingPercent: {
    zh: (percent: number) => `上傳中... ${percent}%`,
    en: (percent: number) => `Uploading... ${percent}%`,
  },
  removeFailed: { zh: "移除失敗，請稍後再試。", en: "Couldn't remove. Please try again." },
  removeAria: { zh: "移除", en: "Remove" },
};

export const momentsCopy = {
  removeFailed: { zh: "移除失敗，請稍後再試。", en: "Couldn't remove. Please try again." },
  overLimit: {
    zh: (max: number, skipped: number) => `婚紗相簿最多只能上傳 ${max} 張，已略過 ${skipped} 張。`,
    en: (max: number, skipped: number) => `You can upload up to ${max} photos - ${skipped} were skipped.`,
  },
  typeInvalid: {
    zh: (count: number) => `${count} 張照片格式不符，已略過。`,
    en: (count: number) => `${count} photo${count === 1 ? "" : "s"} had an unsupported format and were skipped.`,
  },
  uploadFailedBatch: {
    zh: (count: number) => `${count} 張照片上傳失敗，請稍後再試。`,
    en: (count: number) => `${count} photo${count === 1 ? "" : "s"} failed to upload. Please try again.`,
  },
  addPhotos: { zh: "+ 新增照片（可多選）", en: "+ Add photos (multiple allowed)" },
  uploading: { zh: "上傳中...", en: "Uploading..." },
  phaseCompressing: { zh: "壓縮中", en: "Compressing" },
  phaseProcessing: { zh: "處理中", en: "Processing" },
  phaseUploading: { zh: "上傳中", en: "Uploading" },
};

export const rowMenuCopy = {
  moreActions: { zh: "更多操作", en: "More actions" },
  deleting: { zh: "刪除中...", en: "Deleting..." },
  delete: { zh: "刪除", en: "Delete" },
  deleteFailed: { zh: "刪除失敗，請稍後再試。", en: "Couldn't delete. Please try again." },
  confirmTitle: { zh: "刪除草稿", en: "Delete draft" },
  confirmMessage: {
    zh: "確定要刪除這份草稿嗎？刪除後無法復原。",
    en: "Are you sure you want to delete this draft? This cannot be undone.",
  },
};

export const createWeddingCopy = {
  creating: { zh: "建立中...", en: "Creating..." },
  createNew: { zh: "+ 建立新喜帖", en: "+ Create new invitation" },
};

export const deletedNoticeCopy = {
  deleted: { zh: "已刪除", en: "Deleted" },
};

export const signOutCopy = {
  signingOut: { zh: "登出中...", en: "Signing out..." },
  signOut: { zh: "登出", en: "Sign out" },
};

export const loadingCopy = {
  loading: { zh: "載入中", en: "Loading" },
};

// /create - the no-signup-required trial editor. Heavily overlaps with
// `editForm`/`chromeCopy`/`momentsCopy` above (same fields, same dashboard
// editor UI reused pre-signup), so this only holds the page-specific chrome
// that isn't already covered by those.
export const draftEditorCopy = {
  alreadyHaveAccount: { zh: "已經有帳號？登入", en: "Already have an account? Log in" },
  tryTitle: { zh: "試做你的喜帖", en: "Try building your invitation" },
  tryHint: {
    zh: "不用先註冊，直接填內容、選照片。準備好要儲存時再建立帳號，內容不會遺失。",
    en: "No need to sign up first - just fill in your details and pick photos. Create an account when you're ready to save; nothing will be lost.",
  },
  templateSection: { zh: "喜帖樣板", en: "Invitation template" },
  colorLabel: { zh: "顏色", en: "Colour" },
  sealLabel: { zh: "封蠟花樣", en: "Wax seal design" },
  photosSection: { zh: "照片", en: "Photos" },
  heroFamilyFooterTitle: { zh: "主視覺 / 合影 / 頁尾照片", en: "Cover / couple / footer photos" },
  heroPhotoLabel: { zh: "主視覺照（封面）", en: "Cover photo" },
  familyPhotoLabel: { zh: "雙方合影", en: "Photo of the couple" },
  footerPhotoLabel: { zh: "頁尾照片", en: "Footer photo" },
  momentsTitle: { zh: "婚紗相簿（Moments）", en: "Photo gallery (Moments)" },
  sizeOrTypeInvalid: {
    zh: (count: number) => `${count} 張照片格式或大小不符，已略過。`,
    en: (count: number) => `${count} photo${count === 1 ? "" : "s"} had an unsupported format or size and were skipped.`,
  },
  momentsStyleLabel: { zh: "婚紗相簿呈現方式", en: "Gallery display style" },
  contentSection: { zh: "喜帖內容", en: "Invitation content" },
  tooltipDefault: {
    zh: "系統會依場地位置自動判斷時區，尚未確認地點前先以台灣時間計算。",
    en: "The time zone is detected automatically from the venue location - until it's confirmed, times are calculated in Taiwan time.",
  },
  tooltipLocated: {
    zh: "系統會依場地位置自動判斷時區，確認地點後會依當地時區重新計算。",
    en: "The time zone is detected automatically from the venue location, and recalculated in local time once it's confirmed.",
  },
  rsvpHint: {
    zh: "賓客可以直接在喜帖頁面回覆是否出席，回覆會顯示在後台的「RSVP 回覆」頁面",
    en: "Guests can RSVP directly on the invitation page - replies show up on the \"RSVP\" page in your dashboard",
  },
  saveInvitation: { zh: "儲存喜帖", en: "Save invitation" },
  previewInvitation: { zh: "預覽喜帖", en: "Preview invitation" },
  saveFailed: { zh: "儲存失敗，請稍後再試", en: "Couldn't save. Please try again" },
};

export const editPageCopy = {
  slugSection: { zh: "網址代稱", en: "Custom URL" },
};

export const confirmDialogCopy = {
  confirm: { zh: "確定", en: "Confirm" },
  cancel: { zh: "取消", en: "Cancel" },
};

export const editorCardCopy = {
  hiddenSectionHint: {
    zh: "這個區塊目前不會顯示在喜帖上。開啟「顯示」即可編輯內容。",
    en: "This section won't show on your invitation right now. Turn on \"Show\" to edit its content.",
  },
};

export const infoTooltipCopy = {
  moreInfo: { zh: "更多說明", en: "More info" },
};

export const momentsPhotoGridCopy = {
  remove: { zh: "移除", en: "Remove" },
  moveUp: { zh: "上移", en: "Move up" },
  moveDown: { zh: "下移", en: "Move down" },
};

export const slugFieldCopy = {
  copied: { zh: "已複製", en: "Copied" },
  copy: { zh: "複製", en: "Copy" },
  visit: { zh: "前往", en: "Visit" },
  hint: {
    zh: "這將是賓客訪問您喜帖的專屬連結，您可以隨時自訂後方的網址名稱",
    en: "This will be your guests' link to your invitation - you can customise the address part anytime",
  },
};
