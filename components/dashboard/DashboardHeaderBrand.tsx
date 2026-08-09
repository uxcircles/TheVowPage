"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Brand logo everywhere in the dashboard, except one level deep into a
 * specific wedding's pages, where showing the brand name again right above
 * WeddingChrome's own header would be redundant with it - here it becomes
 * a plain back link to the wedding list instead. */
export function DashboardHeaderBrand() {
  const pathname = usePathname();
  const insideWedding = /^\/dashboard\/[^/]+/.test(pathname);

  if (insideWedding) {
    return (
      <Link href="/dashboard" className="text-lg font-medium text-[var(--brand-gold)]">
        ← 返回
      </Link>
    );
  }

  return (
    <Link href="/dashboard" className="text-lg font-medium text-[var(--brand-gold)]">
      The Vow Page 諾頁
    </Link>
  );
}
