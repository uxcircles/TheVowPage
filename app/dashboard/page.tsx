import Link from "next/link";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { createWedding } from "@/lib/actions/weddings";
import { WeddingRowMenu } from "@/components/dashboard/WeddingRowMenu";
import { CreateWeddingButton } from "@/components/dashboard/CreateWeddingButton";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: weddings } = await supabase
    .from("weddings")
    .select("id, slug, groom_name, bride_name, groom_label, bride_label, status, updated_at")
    .eq("owner_id", user!.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">我的喜帖</h1>
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
          <p className="text-[var(--brand-ink-soft)]">還沒有喜帖，點擊上方按鈕建立第一個吧。</p>
        </div>
      )}

      <ul className="mt-8 flex flex-col gap-3">
        {weddings?.map((w) => (
          <li
            key={w.id}
            className="flex items-start gap-3 rounded border border-[var(--brand-line)] bg-white px-5 py-4 transition-colors hover:border-[var(--brand-gold)] sm:items-center"
          >
            <Link
              href={`/dashboard/${w.id}/edit`}
              className="flex flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <span className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="font-medium">
                  {w.groom_name || w.groom_label} ＆ {w.bride_name || w.bride_label}
                </span>
                <span className="break-all text-sm text-[var(--brand-ink-soft)]">/w/{w.slug}</span>
              </span>
              <span
                className={`self-start rounded px-2 py-1 text-xs sm:self-auto ${
                  w.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {w.status === "published" ? "已發布" : "草稿"}
              </span>
            </Link>
            {w.status !== "published" && <WeddingRowMenu weddingId={w.id} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
