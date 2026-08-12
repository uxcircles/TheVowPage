// Supabase Auth returns its error messages in English (e.g. "Invalid login
// credentials"); this maps the ones users can actually hit to Chinese, with
// a generic fallback for anything unmapped so raw English never reaches the UI.
const KNOWN_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "帳號或密碼錯誤，請再試一次。",
  "User already registered": "這個 Email 已經註冊過了，請直接登入。",
  "Email not confirmed": "請先到信箱完成驗證信確認，再回來登入一次即可繼續。",
  "Password should be at least 6 characters": "密碼至少需要 6 個字元。",
  "Unable to validate email address: invalid format": "Email 格式不正確，請確認後再試一次。",
  "Signup requires a valid password": "請輸入密碼。",
};

export function translateAuthError(message: string): string {
  return KNOWN_MESSAGES[message] ?? "發生錯誤，請稍後再試。";
}
