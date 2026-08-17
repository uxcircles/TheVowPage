import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnedWedding } from "@/lib/weddings";
import { RsvpTable } from "@/components/dashboard/RsvpTable";
import { getLocale } from "@/lib/i18n/locale";
import { editTabs, rsvpsPageCopy } from "@/lib/i18n/dictionaries/dashboard";
import { dietOptions } from "@/lib/i18n/dictionaries/template";

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

  const locale = await getLocale();
  const list = rsvps ?? [];
  const attending = list.filter((r) => r.attending);
  const notAttending = list.filter((r) => !r.attending);
  const totalHeadcount = attending.reduce((sum, r) => sum + r.adults + r.children, 0);

  const stats = [
    { label: rsvpsPageCopy.stats.replies[locale], value: list.length },
    { label: rsvpsPageCopy.stats.attending[locale], value: attending.length },
    { label: rsvpsPageCopy.stats.notAttending[locale], value: notAttending.length },
    { label: rsvpsPageCopy.stats.headcount[locale], value: totalHeadcount },
  ];

  // Counts by RSVP submission (same semantic as the stats above - e.g. a
  // family of three submitted under one reply with one diet selection
  // counts once here, matching how "Attending" also counts replies, not
  // headcount) rather than by adults+children, since diet is stored per
  // submission, not per attendee. Only categories someone actually picked
  // are shown, so this doesn't turn into a wall of mostly-zero boxes.
  const dietCounts = dietOptions
    .map((option) => ({
      label: option[locale],
      value: attending.filter((r) => r.diet === option.id).length,
    }))
    .filter((d) => d.value > 0);

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium">{editTabs.rsvps[locale]}</h2>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded border border-[var(--brand-line)] bg-white p-4 text-center">
            <p className="text-2xl font-medium text-[var(--brand-gold)]">{s.value}</p>
            <p className="mt-1 text-xs text-[var(--brand-ink-soft)]">{s.label}</p>
          </div>
        ))}
      </div>

      {dietCounts.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-medium text-[var(--brand-ink-soft)]">
            {rsvpsPageCopy.dietStatsTitle[locale]}
          </h3>
          <div className="flex flex-wrap gap-3">
            {dietCounts.map((d) => (
              <div
                key={d.label}
                className="flex items-center gap-2 rounded border border-[var(--brand-line)] bg-white px-3 py-2"
              >
                <span className="text-lg font-medium text-[var(--brand-gold)]">{d.value}</span>
                <span className="text-sm text-[var(--brand-ink-soft)]">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <RsvpTable weddingId={weddingId} rsvps={list} />
    </div>
  );
}
