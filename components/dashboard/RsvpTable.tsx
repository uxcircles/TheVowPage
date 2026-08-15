"use client";

import { useState, useTransition } from "react";
import { deleteRsvp } from "@/lib/actions/rsvps";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Tables } from "@/lib/supabase/database.types";

export function RsvpTable({
  weddingId,
  rsvps,
}: {
  weddingId: string;
  rsvps: Tables<"rsvps">[];
}) {
  const showToast = useToast();
  const [pending, startTransition] = useTransition();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function handleDelete(rsvpId: string) {
    setConfirmingId(null);
    startTransition(async () => {
      try {
        await deleteRsvp(weddingId, rsvpId);
      } catch {
        showToast("刪除失敗，請稍後再試。", "error");
      }
    });
  }

  if (rsvps.length === 0) {
    return <p className="text-sm text-[var(--brand-ink-soft)]">還沒有收到回覆。</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded border border-[var(--brand-line)] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--brand-line)] text-[var(--brand-ink-soft)]">
              <th className="px-4 py-3 font-medium">姓名</th>
              <th className="px-4 py-3 font-medium">出席</th>
              <th className="px-4 py-3 font-medium">大人</th>
              <th className="px-4 py-3 font-medium">小孩</th>
              <th className="px-4 py-3 font-medium">飲食需求</th>
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
                <td className="px-4 py-3 max-w-[200px]">
                  {r.attending && (r.diet || r.diet_note) ? (
                    <span className="block truncate" title={[r.diet, r.diet_note].filter(Boolean).join(" - ")}>
                      {[r.diet, r.diet_note].filter(Boolean).join(" - ")}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 max-w-[240px] truncate">{r.message}</td>
                <td className="px-4 py-3 text-[var(--brand-ink-soft)]">
                  {new Date(r.created_at).toLocaleString("zh-TW")}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setConfirmingId(r.id)}
                    aria-label="刪除"
                    className="text-[var(--brand-ink-soft)] hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {confirmingId && (
        <ConfirmDialog
          title="刪除回覆"
          message="確定要刪除這筆 RSVP 回覆嗎？刪除後無法復原。"
          confirmLabel="刪除"
          danger
          onConfirm={() => handleDelete(confirmingId)}
          onCancel={() => setConfirmingId(null)}
        />
      )}
    </div>
  );
}
