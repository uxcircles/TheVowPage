import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getLocale } from "@/lib/i18n/locale";
import { accountMenuCopy, chromeCopy } from "@/lib/i18n/dictionaries/dashboard";
import { headingFont } from "@/lib/fonts";
import { ArrowLeftIcon } from "@/components/ui/ArrowLeftIcon";

export default async function AccountPasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locale = await getLocale();
  const hasPassword = user.identities?.some((i) => i.provider === "email") ?? false;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-[var(--brand-gold)]">
            <ArrowLeftIcon className="h-4 w-4 shrink-0" />
            {chromeCopy.back[locale]}
          </Link>
          <h1 className={`${headingFont.className} mt-4 text-center text-2xl text-[var(--brand-gold)]`}>
            The Vow Page 摯頁
          </h1>
          <h2 className="mt-4 text-center text-lg font-medium text-foreground">
            {hasPassword ? accountMenuCopy.changePassword[locale] : accountMenuCopy.setPassword[locale]}
          </h2>
          <ResetPasswordForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
