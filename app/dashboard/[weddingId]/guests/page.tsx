import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnedWedding } from "@/lib/weddings";
import { GuestList } from "@/components/dashboard/GuestList";

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const wedding = await getOwnedWedding(weddingId);
  if (!wedding) notFound();

  const supabase = await createClient();
  const { data: guests } = await supabase
    .from("guests")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: true });

  return (
    <div>
      <h2 className="mb-1 text-lg font-medium">賓客名單</h2>
      <p className="mb-6 text-sm text-[var(--brand-ink-soft)]">
        這是你自己整理邀請對象用的名單，不會顯示在公開喜帖頁上。
      </p>
      <GuestList weddingId={weddingId} guests={guests ?? []} />
    </div>
  );
}
