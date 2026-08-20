import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { createWedding } from "@/lib/actions/weddings";
import { WeddingRowMenu } from "@/components/dashboard/WeddingRowMenu";
import { CreateWeddingButton } from "@/components/dashboard/CreateWeddingButton";
import { DeletedNotice } from "@/components/dashboard/DeletedNotice";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { getLocale } from "@/lib/i18n/locale";
import { dashboardPageCopy, chromeCopy } from "@/lib/i18n/dictionaries/dashboard";
import { localizedText, type ContentEn } from "@/components/templates/classic/types";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  const locale = await getLocale();

  const { data: weddings } = await supabase
    .from("weddings")
    .select("id, slug, groom_name, bride_name, groom_label, bride_label, status, updated_at, bilingual_enabled, content_en")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="py-10">
      <Suspense fallback={null}>
        <DeletedNotice />
      </Suspense>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">{dashboardPageCopy.heading[locale]}</h1>
        <form action={createWedding}>
          <CreateWeddingButton />
        </form>
      </div>

      {(!weddings || weddings.length === 0) && (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-lg border border-dashed border-[var(--brand-line)] px-6 py-16 text-center">
          <svg width="72" height="72" viewBox="0 0 96 96" fill="none" aria-hidden="true">
            <rect x="10" y="26" width="76" height="52" rx="4" stroke="var(--brand-gold)" strokeWidth="2" />
            <path d="M10 30l38 28 38-28" stroke="var(--brand-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M48 20c-3.5-6-14-6-14 2 0 6.5 8.5 10.5 14 15.5 5.5-5 14-9 14-15.5 0-8-10.5-8-14-2z"
              fill="var(--background)"
              stroke="var(--brand-gold)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-[var(--brand-ink-soft)]">{dashboardPageCopy.empty[locale]}</p>
        </div>
      )}

      <ul className="mt-8 flex flex-col gap-3">
        {weddings?.map((w) => {
          // Server component, so this follows the same admin-locale
          // display as WeddingChrome's own header - not the guest locale,
          // since this list is dashboard-only chrome.
          const contentEn = (w.content_en as ContentEn | null) ?? {};
          const groomDisplay = localizedText(w.groom_name, contentEn.groomName, locale, w.bilingual_enabled);
          const brideDisplay = localizedText(w.bride_name, contentEn.brideName, locale, w.bilingual_enabled);
          return (
            <li
              key={w.id}
              className="relative flex items-start gap-3 rounded border border-[var(--brand-line)] bg-white px-5 py-4 transition-colors hover:border-[var(--brand-gold)] sm:items-center"
            >
              <Link
                href={`/dashboard/${w.id}/edit`}
                className="absolute inset-0"
                aria-label={`${groomDisplay || w.groom_label} ＆ ${brideDisplay || w.bride_label}`}
              />
              <div className="flex flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                  <span className="font-medium">
                    {groomDisplay || w.groom_label} ＆ {brideDisplay || w.bride_label}
                  </span>
                  <span className="break-all text-sm text-[var(--brand-ink-soft)]">/w/{w.slug}</span>
                </span>
                <span className="self-start sm:self-auto">
                  <StatusBadge
                    published={w.status === "published"}
                    label={w.status === "published" ? chromeCopy.published[locale] : chromeCopy.draft[locale]}
                  />
                </span>
              </div>
              {w.status !== "published" && (
                <div className="relative z-10">
                  <WeddingRowMenu weddingId={w.id} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
