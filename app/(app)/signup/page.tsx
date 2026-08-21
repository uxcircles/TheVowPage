"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useActionErrorToast } from "@/components/ui/Toast";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { authCopy, signupCopy } from "@/lib/i18n/dictionaries/auth";
import { footerCopy } from "@/lib/i18n/dictionaries/common";
import { marketingHref } from "@/lib/i18n/marketingPaths";
import { headingFont } from "@/lib/fonts";

export default function SignupPage() {
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(signUp, undefined);
  useActionErrorToast(pending, state?.error);

  if (state?.needsConfirmation) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-sm text-center">
            <h1 className={`${headingFont.className} text-2xl text-[var(--brand-gold)]`}>The Vow Page 摯頁</h1>
            <h2 className="mt-6 text-lg font-medium text-foreground">{signupCopy.confirmEmailTitle[locale]}</h2>
            <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">
              {signupCopy.confirmEmailBodyPrefix[locale]}
              <br />
              <span className="font-medium text-foreground">{state.needsConfirmation}</span>
              <br />
              {signupCopy.confirmEmailBodySuffix[locale]}
            </p>
            <p className="mt-4 text-xs text-[var(--brand-ink-soft)]">{signupCopy.confirmEmailHint[locale]}</p>
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
        <h1 className={`${headingFont.className} text-center text-2xl text-[var(--brand-gold)]`}>The Vow Page 摯頁</h1>
        <p className="mt-2 text-center text-sm text-[var(--brand-ink-soft)]">{signupCopy.subtitle[locale]}</p>

        <div className="mt-8">
          <GoogleAuthButton />
        </div>
        <div className="my-6 flex items-center gap-3 text-xs text-[var(--brand-ink-soft)]">
          <span className="h-px flex-1 bg-[var(--brand-line)]" />
          {authCopy.or[locale]}
          <span className="h-px flex-1 bg-[var(--brand-line)]" />
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]">
            {authCopy.yourName[locale]}
            <input
              type="text"
              name="displayName"
              required
              autoComplete="name"
              className="rounded border border-[var(--brand-line)] bg-white px-3 py-2 text-foreground"
            />
          </label>
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
          <label className="flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]">
            {authCopy.password[locale]}
            <PasswordInput name="password" required minLength={6} autoComplete="new-password" />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded bg-[var(--brand-gold)] px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? signupCopy.submitPending[locale] : signupCopy.submit[locale]}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--brand-ink-soft)]">
          {signupCopy.hasAccount[locale]}{" "}
          <Link href="/login" className="text-[var(--brand-gold)] underline">
            {signupCopy.loginLink[locale]}
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-[var(--brand-ink-soft)]">
          {signupCopy.agreePrefix[locale]}{" "}
          <Link href={marketingHref("/terms", locale)} className="underline hover:text-[var(--brand-gold)]">
            {footerCopy.terms[locale]}
          </Link>{" "}
          {authCopy.and[locale]}{" "}
          <Link href={marketingHref("/privacy", locale)} className="underline hover:text-[var(--brand-gold)]">
            {footerCopy.privacy[locale]}
          </Link>
          {locale === "en" ? "." : "。"}
        </p>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
