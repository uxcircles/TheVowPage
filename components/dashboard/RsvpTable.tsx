"use client";

import { useState, useTransition } from "react";
import { deleteRsvp } from "@/lib/actions/rsvps";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { rsvpTableCopy, editForm } from "@/lib/i18n/dictionaries/dashboard";
import type { Tables } from "@/lib/supabase/database.types";

export function RsvpTable({
  weddingId,
  rsvps,
}: {
  weddingId: string;
  rsvps: Tables<"rsvps">[];
}) {
  const locale = useLocale();
  const showToast = useToast();
  const [pending, startTransition] = useTransition();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function handleDelete(rsvpId: string) {
    setConfirmingId(null);
    startTransition(async () => {
      try {
        await deleteRsvp(weddingId, rsvpId);
      } catch {
        showToast(rsvpTableCopy.deleteFailed[locale], "error");
      }
    });
  }

  if (rsvps.length === 0) {
    return <p className="text-sm text-[var(--brand-ink-soft)]">{rsvpTableCopy.empty[locale]}</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded border border-[var(--brand-line)] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--brand-line)] text-[var(--brand-ink-soft)]">
              <th className="px-4 py-3 font-medium">{rsvpTableCopy.headers.name[locale]}</th>
              <th className="px-4 py-3 font-medium">{rsvpTableCopy.headers.attending[locale]}</th>
              <th className="px-4 py-3 font-medium">{rsvpTableCopy.headers.adults[locale]}</th>
              <th className="px-4 py-3 font-medium">{rsvpTableCopy.headers.children[locale]}</th>
              <th className="px-4 py-3 font-medium">{rsvpTableCopy.headers.diet[locale]}</th>
              <th className="px-4 py-3 font-medium">{rsvpTableCopy.headers.message[locale]}</th>
              <th className="px-4 py-3 font-medium">{rsvpTableCopy.headers.time[locale]}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rsvps.map((r) => (
              <tr key={r.id} className="border-b border-[var(--brand-line)] last:border-0">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.attending ? rsvpTableCopy.attendingYes[locale] : rsvpTableCopy.attendingNo[locale]}</td>
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
                  {new Date(r.created_at).toLocaleString(locale === "en" ? "en-GB" : "zh-TW")}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setConfirmingId(r.id)}
                    aria-label={editForm.deleteAria[locale]}
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
          title={rsvpTableCopy.confirmTitle[locale]}
          message={rsvpTableCopy.confirmMessage[locale]}
          confirmLabel={editForm.deleteAria[locale]}
          danger
          onConfirm={() => handleDelete(confirmingId)}
          onCancel={() => setConfirmingId(null)}
        />
      )}
    </div>
  );
}
