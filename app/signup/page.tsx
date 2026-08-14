"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { useActionErrorToast } from "@/components/ui/Toast";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { headingFont } from "@/lib/fonts";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, undefined);
  useActionErrorToast(pending, state?.error);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className={`${headingFont.className} text-center text-2xl text-[var(--brand-gold)]`}>The Vow Page 摯頁</h1>
        <p className="mt-2 text-center text-sm text-[var(--brand-ink-soft)]">建立你的帳號，開始製作喜帖</p>

        <div className="mt-8">
          <GoogleAuthButton label="使用 Google 繼續" />
        </div>
        <div className="my-6 flex items-center gap-3 text-xs text-[var(--brand-ink-soft)]">
          <span className="h-px flex-1 bg-[var(--brand-line)]" />
          或
          <span className="h-px flex-1 bg-[var(--brand-line)]" />
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]">
            你的稱呼
            <input
              type="text"
              name="displayName"
              required
              className="rounded border border-[var(--brand-line)] bg-white px-3 py-2 text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]">
            Email
            <input
              type="email"
              name="email"
              required
              className="rounded border border-[var(--brand-line)] bg-white px-3 py-2 text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]">
            密碼
            <PasswordInput name="password" required minLength={6} />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded bg-[var(--brand-gold)] px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "建立中..." : "註冊"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--brand-ink-soft)]">
          已經有帳號了？{" "}
          <Link href="/login" className="text-[var(--brand-gold)] underline">
            登入
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-[var(--brand-ink-soft)]">
          註冊即表示您同意我們的{" "}
          <Link href="/terms" className="underline hover:text-[var(--brand-gold)]">
            服務條款
          </Link>{" "}
          與{" "}
          <Link href="/privacy" className="underline hover:text-[var(--brand-gold)]">
            隱私權政策
          </Link>
          。
        </p>
      </div>
    </main>
  );
}
