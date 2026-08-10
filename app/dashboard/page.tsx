import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createWedding } from "@/lib/actions/weddings";
import { WeddingRowMenu } from "@/components/dashboard/WeddingRowMenu";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: weddings } = await supabase
    .from("weddings")
    .select("id, slug, groom_name, bride_name, groom_label, bride_label, status, updated_at")
    .eq("owner_id", user!.id)
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">我的喜帖</h1>
        <form action={createWedding}>
          <button
            type="submit"
            className="rounded bg-[var(--brand-gold)] px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
          >
            + 建立新喜帖
          </button>
        </form>
      </div>

      {(!weddings || weddings.length === 0) && (
        <p className="mt-10 text-[var(--brand-ink-soft)]">還沒有喜帖，點擊上方按鈕建立第一個吧。</p>
      )}

      <ul className="mt-8 flex flex-col gap-3">
        {weddings?.map((w) => (
          <li
            key={w.id}
            className="flex items-center gap-3 rounded border border-[var(--brand-line)] bg-white px-5 py-4 transition-colors hover:border-[var(--brand-gold)]"
          >
            <Link href={`/dashboard/${w.id}/edit`} className="flex flex-1 items-center justify-between">
              <span>
                <span className="font-medium">
                  {w.groom_name || w.groom_label} ＆ {w.bride_name || w.bride_label}
                </span>
                <span className="ml-3 text-sm text-[var(--brand-ink-soft)]">/w/{w.slug}</span>
              </span>
              <span
                className={`rounded px-2 py-1 text-xs ${
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
