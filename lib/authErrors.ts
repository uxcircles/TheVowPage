import type { Locale } from "@/lib/i18n/shared";

// Supabase Auth returns its error messages in English (e.g. "Invalid login
// credentials"); this maps the ones users can actually hit to zh/en display
// text, with a generic fallback for anything unmapped so raw English never
// reaches Chinese-reading users.
const KNOWN_MESSAGES: Record<string, { zh: string; en: string }> = {
  "Invalid login credentials": { zh: "帳號或密碼錯誤，請再試一次。", en: "Incorrect email or password. Please try again." },
  "User already registered": {
    zh: "這個 Email 已經註冊過了，請直接登入。",
    en: "This email is already registered - please log in instead.",
  },
  "Email not confirmed": {
    zh: "請先到信箱完成驗證信確認，再回來登入一次即可繼續。",
    en: "Please check your email to confirm your address, then come back and log in to continue.",
  },
  "Password should be at least 6 characters": {
    zh: "密碼至少需要 6 個字元。",
    en: "Password must be at least 6 characters.",
  },
  "Unable to validate email address: invalid format": {
    zh: "Email 格式不正確，請確認後再試一次。",
    en: "That email address doesn't look right - please check it and try again.",
  },
  "Signup requires a valid password": { zh: "請輸入密碼。", en: "Please enter a password." },
};

const FALLBACK = { zh: "發生錯誤，請稍後再試。", en: "Something went wrong. Please try again later." };

export function translateAuthError(message: string, locale: Locale): string {
  return (KNOWN_MESSAGES[message] ?? FALLBACK)[locale];
}
