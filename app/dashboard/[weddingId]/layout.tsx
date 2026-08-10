import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WeddingChrome } from "@/components/dashboard/WeddingChrome";

export default async function WeddingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, groom_name, bride_name, groom_label, bride_label, status, slug")
    .eq("id", weddingId)
    .eq("owner_id", user?.id ?? "")
    .maybeSingle();

  if (!wedding) notFound();

  const tabs = [
    { href: `/dashboard/${weddingId}/edit`, label: "內容編輯" },
    { href: `/dashboard/${weddingId}/guests`, label: "賓客名單" },
    { href: `/dashboard/${weddingId}/rsvps`, label: "RSVP 回覆" },
  ];

  return (
    <WeddingChrome
      weddingId={weddingId}
      groomName={wedding.groom_name}
      brideName={wedding.bride_name}
      groomLabel={wedding.groom_label}
      brideLabel={wedding.bride_label}
      slug={wedding.slug}
      status={wedding.status}
      tabs={tabs}
    >
      {children}
    </WeddingChrome>
  );
}
