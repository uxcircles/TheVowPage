import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { getLocale } from "@/lib/i18n/locale";
import { resetPasswordCopy } from "@/lib/i18n/dictionaries/auth";
import { headingFont } from "@/lib/fonts";

// Only reachable with a live (recovery) session, established by
// app/auth/callback/route.ts exchanging the email link's code just
// before redirecting here (see requestPasswordReset in
// lib/actions/auth.ts). No session means the link was never clicked
// through properly, already used, or expired - the callback route's own
// failure path sends those to /login?error=oauth instead, but this is a
// direct-navigation/session-timing safety net for the same situation.
export default async function ResetPasswordPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className={`${headingFont.className} text-center text-2xl text-[var(--brand-gold)]`}>
            The Vow Page 摯頁
          </h1>

          {user ? (
            <>
              <h2 className="mt-4 text-center text-lg font-medium text-foreground">{resetPasswordCopy.title[locale]}</h2>
              <ResetPasswordForm />
            </>
          ) : (
            <div className="mt-6 text-center">
              <h2 className="text-lg font-medium text-foreground">{resetPasswordCopy.linkInvalidTitle[locale]}</h2>
              <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">{resetPasswordCopy.linkInvalidBody[locale]}</p>
              <Link
                href="/forgot-password"
                className="mt-6 inline-block rounded bg-[var(--brand-gold)] px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
              >
                {resetPasswordCopy.requestNewLink[locale]}
              </Link>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
