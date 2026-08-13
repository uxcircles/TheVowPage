import { notFound } from "next/navigation";
import { getOwnedWedding } from "@/lib/weddings";
import { WeddingChrome } from "@/components/dashboard/WeddingChrome";

export default async function WeddingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const wedding = await getOwnedWedding(weddingId);

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
      plan={wedding.plan}
      expiresAt={wedding.expires_at}
      tabs={tabs}
    >
      {children}
    </WeddingChrome>
  );
}
