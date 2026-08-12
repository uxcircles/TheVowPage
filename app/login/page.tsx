"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

// Reads the `?error=oauth` param /auth/callback redirects here with on
// failure. Isolated in its own component so useSearchParams's Suspense
// requirement doesn't force the whole page out of static rendering.
function OAuthErrorNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get("error") !== "oauth") return null;
  return <p className="mt-4 text-center text-sm text-red-600">Google 登入失敗，請再試一次。</p>;
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-medium text-[var(--brand-gold)]">The Vow Page 摯頁</h1>
        <p className="mt-2 text-center text-sm text-[var(--brand-ink-soft)]">登入你的帳號</p>
        <Suspense fallback={null}>
          <OAuthErrorNotice />
        </Suspense>

        <div className="mt-8">
          <GoogleAuthButton label="使用 Google 登入" />
        </div>
        <div className="my-6 flex items-center gap-3 text-xs text-[var(--brand-ink-soft)]">
          <span className="h-px flex-1 bg-[var(--brand-line)]" />
          或
          <span className="h-px flex-1 bg-[var(--brand-line)]" />
        </div>

        <form action={formAction} className="flex flex-col gap-4">
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
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="rounded border border-[var(--brand-line)] bg-white px-3 py-2 text-foreground"
            />
          </label>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded bg-[var(--brand-gold)] px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "登入中..." : "登入"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--brand-ink-soft)]">
          還沒有帳號？{" "}
          <Link href="/signup" className="text-[var(--brand-gold)] underline">
            立即註冊
          </Link>
        </p>
      </div>
    </main>
  );
}
