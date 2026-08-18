import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const hasPassword = user.identities?.some((i) => i.provider === "email") ?? false;

  return (
    <div className="min-h-screen">
      <DashboardHeader
        email={user.email ?? ""}
        displayName={(user.user_metadata?.display_name as string | undefined) ?? null}
        avatarUrl={(user.user_metadata?.avatar_url as string | undefined) ?? null}
        hasPassword={hasPassword}
      />
      {/* No vertical padding here - WeddingChrome (used under
          /dashboard/[weddingId]) manages its own top/bottom spacing, so
          adding py-10 here stacked with it to leave a big gap above its
          sticky header. The plain wedding-list page below owns its own
          vertical padding instead. */}
      <main className="mx-auto max-w-4xl px-6">{children}</main>
    </div>
  );
}
