"use client";

import { Suspense, useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useToast, useActionErrorToast } from "@/components/ui/Toast";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { authCopy, loginCopy } from "@/lib/i18n/dictionaries/auth";
import { footerCopy } from "@/lib/i18n/dictionaries/common";
import { marketingHref } from "@/lib/i18n/marketingPaths";
import { headingFont } from "@/lib/fonts";

// Reads the `?error=oauth` param /auth/callback redirects here with on
// failure. Isolated in its own component so useSearchParams's Suspense
// requirement doesn't force the whole page out of static rendering.
function OAuthErrorNotice() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const showToast = useToast();
  useEffect(() => {
    if (searchParams.get("error") !== "oauth") return;
    showToast(authCopy.googleOAuthFailed[locale], "error");
    // Drop the param so refreshing the page doesn't re-fire the toast.
    window.history.replaceState(null, "", window.location.pathname);
  }, [searchParams, showToast, locale]);
  return null;
}

export default function LoginPage() {
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(signIn, undefined);
  useActionErrorToast(pending, state?.error);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className={`${headingFont.className} text-center text-2xl text-[var(--brand-gold)]`}>The Vow Page 摯頁</h1>
        <p className="mt-2 text-center text-sm text-[var(--brand-ink-soft)]">{loginCopy.subtitle[locale]}</p>
        <Suspense fallback={null}>
          <OAuthErrorNotice />
        </Suspense>

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
            <PasswordInput name="password" required minLength={6} autoComplete="current-password" />
          </label>
          <Link href="/forgot-password" className="-mt-2 self-end text-xs text-[var(--brand-ink-soft)] underline hover:text-[var(--brand-gold)]">
            {loginCopy.forgotPassword[locale]}
          </Link>

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded bg-[var(--brand-gold)] px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? loginCopy.submitPending[locale] : loginCopy.submit[locale]}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--brand-ink-soft)]">
          {loginCopy.noAccount[locale]}{" "}
          <Link href="/signup" className="text-[var(--brand-gold)] underline">
            {loginCopy.signUpLink[locale]}
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-[var(--brand-ink-soft)]">
          {authCopy.agreePrefix[locale]}{" "}
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
