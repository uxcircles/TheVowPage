export const authCopy = {
  or: { zh: "或", en: "or" },
  email: { zh: "Email", en: "Email" },
  password: { zh: "密碼", en: "Password" },
  yourName: { zh: "你的稱呼", en: "Your name" },
  continueWithGoogle: { zh: "使用 Google 繼續", en: "Continue with Google" },
  googleRedirecting: { zh: "跳轉中...", en: "Redirecting..." },
  googleConnectFailed: { zh: "無法連接 Google 登入，請稍後再試。", en: "Couldn't connect to Google sign-in. Please try again later." },
  googleOAuthFailed: { zh: "Google 登入失敗，請再試一次。", en: "Google sign-in failed. Please try again." },
  showPassword: { zh: "顯示密碼", en: "Show password" },
  hidePassword: { zh: "隱藏密碼", en: "Hide password" },
  agreePrefix: { zh: "繼續即表示您同意我們的", en: "By continuing, you agree to our" },
  and: { zh: "與", en: "and" },
};

export const loginCopy = {
  subtitle: { zh: "登入你的帳號", en: "Log in to your account" },
  submit: { zh: "登入", en: "Log in" },
  submitPending: { zh: "登入中...", en: "Logging in..." },
  noAccount: { zh: "還沒有帳號？", en: "Don't have an account?" },
  signUpLink: { zh: "立即註冊", en: "Sign up" },
  forgotPassword: { zh: "忘記密碼？", en: "Forgot password?" },
};

export const forgotPasswordCopy = {
  title: { zh: "重設密碼", en: "Reset your password" },
  subtitle: {
    zh: "輸入你的帳號 Email，我們會寄一封重設密碼的連結給你。",
    en: "Enter your account email and we'll send you a link to reset your password.",
  },
  submit: { zh: "寄送重設連結", en: "Send reset link" },
  submitPending: { zh: "寄送中...", en: "Sending..." },
  backToLogin: { zh: "返回登入", en: "Back to log in" },
  sentTitle: { zh: "請確認你的信箱", en: "Check your email" },
  sentBody: {
    zh: (email: string) => `我們已經寄出一封重設密碼的連結到 ${email}。`,
    en: (email: string) => `We've sent a password reset link to ${email}.`,
  },
  sentHint: {
    zh: "沒收到信？請檢查垃圾郵件匣，或稍後再試一次。",
    en: "Didn't get it? Check your spam folder, or try again in a moment.",
  },
};

export const resetPasswordCopy = {
  title: { zh: "設定新密碼", en: "Set a new password" },
  newPassword: { zh: "新密碼", en: "New password" },
  confirmPassword: { zh: "確認新密碼", en: "Confirm new password" },
  mismatch: { zh: "兩次輸入的密碼不一致。", en: "Passwords don't match." },
  submit: { zh: "更新密碼", en: "Update password" },
  submitPending: { zh: "更新中...", en: "Updating..." },
  linkInvalidTitle: { zh: "連結已失效", en: "This link has expired" },
  linkInvalidBody: {
    zh: "這個重設密碼連結已過期或已使用過，請重新申請一次。",
    en: "This password reset link has expired or already been used - please request a new one.",
  },
  requestNewLink: { zh: "重新申請重設連結", en: "Request a new reset link" },
};

export const signupCopy = {
  subtitle: { zh: "建立你的帳號，開始製作喜帖", en: "Create your account and start building your invitation" },
  submit: { zh: "註冊", en: "Sign up" },
  submitPending: { zh: "建立中...", en: "Creating..." },
  hasAccount: { zh: "已經有帳號了？", en: "Already have an account?" },
  loginLink: { zh: "登入", en: "Log in" },
  agreePrefix: { zh: "註冊即表示您同意我們的", en: "By signing up, you agree to our" },
  // Shown instead of the form once signup succeeds but email confirmation
  // is still required (no session yet) - replaces a silent redirect to
  // /dashboard that just bounced back to /login with no explanation.
  confirmEmailTitle: { zh: "請確認你的信箱", en: "Confirm your email" },
  confirmEmailBody: {
    zh: (email: string) => `我們已經寄出一封驗證信到 ${email}，請點擊信中連結完成註冊。`,
    en: (email: string) => `We've sent a confirmation link to ${email}. Click it to finish creating your account.`,
  },
  confirmEmailHint: {
    zh: "沒收到信？請檢查垃圾郵件匣，或稍後再試一次。",
    en: "Didn't get it? Check your spam folder, or try again in a moment.",
  },
};

export const authModalCopy = {
  titleSignup: { zh: "建立帳號並儲存", en: "Create account & save" },
  titleLogin: { zh: "登入並儲存", en: "Log in & save" },
  saveHintSignup: {
    zh: "編輯的內容會在建立帳號後自動儲存，不會遺失。",
    en: "Your edits will be saved automatically once you create an account - nothing will be lost.",
  },
  saveHintLogin: {
    zh: "編輯的內容會在登入後自動儲存，不會遺失。",
    en: "Your edits will be saved automatically once you log in - nothing will be lost.",
  },
  submitPending: { zh: "處理中...", en: "Processing..." },
  submitSignup: { zh: "建立帳號並儲存喜帖", en: "Create account & save invitation" },
  submitLogin: { zh: "登入並儲存喜帖", en: "Log in & save invitation" },
  switchToLogin: { zh: "已經有帳號了？改為登入", en: "Already have an account? Log in instead" },
  switchToSignup: { zh: "還沒有帳號？改為註冊", en: "Don't have an account? Sign up instead" },
};
