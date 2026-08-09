import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-[var(--brand-line)] px-6 py-4">
        <Link href="/dashboard" className="text-lg font-medium text-[var(--brand-gold)]">
          The Vow Page 諾頁
        </Link>
        <form action={signOut}>
          <button type="submit" className="text-sm text-[var(--brand-ink-soft)] underline">
            登出
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
