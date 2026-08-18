"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { authCopy, forgotPasswordCopy } from "@/lib/i18n/dictionaries/auth";
import { headingFont } from "@/lib/fonts";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined);

  if (state?.sentTo) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-sm text-center">
            <h1 className={`${headingFont.className} text-2xl text-[var(--brand-gold)]`}>The Vow Page 摯頁</h1>
            <h2 className="mt-6 text-lg font-medium text-foreground">{forgotPasswordCopy.sentTitle[locale]}</h2>
            <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">
              {forgotPasswordCopy.sentBody[locale](state.sentTo)}
            </p>
            <p className="mt-4 text-xs text-[var(--brand-ink-soft)]">{forgotPasswordCopy.sentHint[locale]}</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className={`${headingFont.className} text-center text-2xl text-[var(--brand-gold)]`}>
            The Vow Page 摯頁
          </h1>
          <h2 className="mt-4 text-center text-lg font-medium text-foreground">{forgotPasswordCopy.title[locale]}</h2>
          <p className="mt-2 text-center text-sm text-[var(--brand-ink-soft)]">{forgotPasswordCopy.subtitle[locale]}</p>

          <form action={formAction} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]">
              {authCopy.email[locale]}
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="rounded border border-[var(--brand-line)] bg-white px-3 py-2 text-foreground"
              />
            </label>

            <button
              type="submit"
              disabled={pending}
              className="mt-2 rounded bg-[var(--brand-gold)] px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? forgotPasswordCopy.submitPending[locale] : forgotPasswordCopy.submit[locale]}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--brand-ink-soft)]">
            <Link href="/login" className="text-[var(--brand-gold)] underline">
              {forgotPasswordCopy.backToLogin[locale]}
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
