"use client";

import { useRef, useTransition } from "react";
import { addGuest, deleteGuest } from "@/lib/actions/guests";
import type { Tables } from "@/lib/supabase/database.types";

export function GuestList({
  weddingId,
  guests,
}: {
  weddingId: string;
  guests: Tables<"guests">[];
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      await addGuest(weddingId, formData);
      formRef.current?.reset();
    });
  }

  return (
    <div>
      <form ref={formRef} action={handleAdd} className="mb-6 flex flex-wrap gap-2">
        <input
          name="name"
          placeholder="姓名"
          required
          className="rounded border border-[var(--brand-line)] bg-white px-3 py-2"
        />
        <input
          name="note"
          placeholder="備註（選填）"
          className="flex-1 rounded border border-[var(--brand-line)] bg-white px-3 py-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-[var(--brand-gold)] px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          新增
        </button>
      </form>

      {guests.length === 0 ? (
        <p className="text-sm text-[var(--brand-ink-soft)]">還沒有賓客，新增第一位吧。</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {guests.map((guest) => (
            <li
              key={guest.id}
              className="flex items-center justify-between rounded border border-[var(--brand-line)] bg-white px-4 py-2.5"
            >
              <span>
                <span className="font-medium">{guest.name}</span>
                {guest.note && <span className="ml-3 text-sm text-[var(--brand-ink-soft)]">{guest.note}</span>}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => deleteGuest(weddingId, guest.id))}
                className="text-sm text-[var(--brand-ink-soft)] hover:text-red-500"
              >
                刪除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
