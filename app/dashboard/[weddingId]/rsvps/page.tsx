import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnedWedding } from "@/lib/weddings";
import { RsvpTable } from "@/components/dashboard/RsvpTable";

export default async function RsvpsPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const wedding = await getOwnedWedding(weddingId);
  if (!wedding) notFound();

  const supabase = await createClient();
  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: false });

  const list = rsvps ?? [];
  const attending = list.filter((r) => r.attending);
  const notAttending = list.filter((r) => !r.attending);
  const totalHeadcount = attending.reduce((sum, r) => sum + r.adults + r.children, 0);

  const stats = [
    { label: "回覆數", value: list.length },
    { label: "出席", value: attending.length },
    { label: "不出席", value: notAttending.length },
    { label: "預估出席人數", value: totalHeadcount },
  ];

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium">RSVP 回覆</h2>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded border border-[var(--brand-line)] bg-white p-4 text-center">
            <p className="text-2xl font-medium text-[var(--brand-gold)]">{s.value}</p>
            <p className="mt-1 text-xs text-[var(--brand-ink-soft)]">{s.label}</p>
          </div>
        ))}
      </div>

      <RsvpTable weddingId={weddingId} rsvps={list} />
    </div>
  );
}
