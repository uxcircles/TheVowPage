import { notFound } from "next/navigation";
import { getOwnedWedding } from "@/lib/weddings";
import { getCurrentUser } from "@/lib/supabase/server";
import { WeddingChrome } from "@/components/dashboard/WeddingChrome";
import { getLocale } from "@/lib/i18n/locale";
import { editTabs } from "@/lib/i18n/dictionaries/dashboard";

export default async function WeddingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const [wedding, user] = await Promise.all([getOwnedWedding(weddingId), getCurrentUser()]);

  if (!wedding) notFound();

  const locale = await getLocale();
  const tabs = [
    { href: `/dashboard/${weddingId}/edit`, label: editTabs.content[locale] },
    { href: `/dashboard/${weddingId}/guests`, label: editTabs.guests[locale] },
    { href: `/dashboard/${weddingId}/rsvps`, label: editTabs.rsvps[locale] },
  ];
  const hasPassword = user?.identities?.some((i) => i.provider === "email") ?? false;

  return (
    <WeddingChrome
      weddingId={weddingId}
      groomName={wedding.groom_name}
      brideName={wedding.bride_name}
      groomLabel={wedding.groom_label}
      brideLabel={wedding.bride_label}
      status={wedding.status}
      plan={wedding.plan}
      expiresAt={wedding.expires_at}
      tabs={tabs}
      email={user?.email ?? ""}
      displayName={(user?.user_metadata?.display_name as string | undefined) ?? null}
      avatarUrl={(user?.user_metadata?.avatar_url as string | undefined) ?? null}
      hasPassword={hasPassword}
    >
      {children}
    </WeddingChrome>
  );
}
