import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    .select("id, groom_name, bride_name")
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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-[var(--brand-ink-soft)] underline">
            ← 我的喜帖
          </Link>
          <h1 className="mt-1 text-xl font-medium">
            {wedding.groom_name || "新郎"} ＆ {wedding.bride_name || "新娘"}
          </h1>
        </div>
      </div>
      <nav className="mb-8 flex gap-2 border-b border-[var(--brand-line)]">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-4 py-2 text-sm text-[var(--brand-ink-soft)] hover:text-[var(--brand-gold)]"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
