import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnedWedding } from "@/lib/weddings";
import { GuestList } from "@/components/dashboard/GuestList";
import { getLocale } from "@/lib/i18n/locale";
import { editTabs, guestsPageCopy } from "@/lib/i18n/dictionaries/dashboard";

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

  const locale = await getLocale();

  return (
    <div>
      <h2 className="mb-1 text-lg font-medium">{editTabs.guests[locale]}</h2>
      <p className="mb-6 text-sm text-[var(--brand-ink-soft)]">
        {guestsPageCopy.hint[locale]}
      </p>
      <GuestList weddingId={weddingId} guests={guests ?? []} />
    </div>
  );
}
