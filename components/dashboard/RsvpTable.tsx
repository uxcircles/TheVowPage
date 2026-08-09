"use client";

import { useTransition } from "react";
import { deleteRsvp } from "@/lib/actions/rsvps";
import type { Tables } from "@/lib/supabase/database.types";

export function RsvpTable({
  weddingId,
  rsvps,
}: {
  weddingId: string;
  rsvps: Tables<"rsvps">[];
}) {
  const [pending, startTransition] = useTransition();

  if (rsvps.length === 0) {
    return <p className="text-sm text-[var(--brand-ink-soft)]">還沒有收到回覆。</p>;
  }

  return (
    <div className="overflow-x-auto rounded border border-[var(--brand-line)] bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--brand-line)] text-[var(--brand-ink-soft)]">
            <th className="px-4 py-3 font-medium">姓名</th>
            <th className="px-4 py-3 font-medium">出席</th>
            <th className="px-4 py-3 font-medium">大人</th>
            <th className="px-4 py-3 font-medium">小孩</th>
            <th className="px-4 py-3 font-medium">留言</th>
            <th className="px-4 py-3 font-medium">時間</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rsvps.map((r) => (
            <tr key={r.id} className="border-b border-[var(--brand-line)] last:border-0">
              <td className="px-4 py-3">{r.name}</td>
              <td className="px-4 py-3">{r.attending ? "出席" : "不出席"}</td>
              <td className="px-4 py-3">{r.attending ? r.adults : "-"}</td>
              <td className="px-4 py-3">{r.attending ? r.children : "-"}</td>
              <td className="px-4 py-3 max-w-[240px] truncate">{r.message}</td>
              <td className="px-4 py-3 text-[var(--brand-ink-soft)]">
                {new Date(r.created_at).toLocaleString("zh-TW")}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(() => deleteRsvp(weddingId, r.id))}
                  className="text-[var(--brand-ink-soft)] hover:text-red-500"
                >
                  刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
