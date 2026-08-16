"use client";

import { useRef, useTransition } from "react";
import { addGuest, deleteGuest } from "@/lib/actions/guests";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { useToast } from "@/components/ui/Toast";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { guestListCopy, editForm } from "@/lib/i18n/dictionaries/dashboard";
import type { Tables } from "@/lib/supabase/database.types";

export function GuestList({
  weddingId,
  guests,
}: {
  weddingId: string;
  guests: Tables<"guests">[];
}) {
  const locale = useLocale();
  const showToast = useToast();
  // Separate transitions (not one shared `pending`) so the add button's
  // label reflects an add in flight specifically, not a delete elsewhere
  // in the list - both still gate every button below via `pending` so
  // nothing else can be clicked mid-mutation.
  const [addPending, startAddTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const pending = addPending || deletePending;
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    startAddTransition(async () => {
      try {
        await addGuest(weddingId, formData);
        formRef.current?.reset();
      } catch {
        showToast(guestListCopy.addFailed[locale], "error");
      }
    });
  }

  function handleDelete(guestId: string) {
    startDeleteTransition(async () => {
      try {
        await deleteGuest(weddingId, guestId);
      } catch {
        showToast(guestListCopy.deleteFailed[locale], "error");
      }
    });
  }

  return (
    <div>
      <form ref={formRef} action={handleAdd} className="mb-6 flex flex-wrap gap-2">
        <input
          name="name"
          placeholder={guestListCopy.namePlaceholder[locale]}
          required
          className="rounded border border-[var(--brand-line)] bg-white px-3 py-2"
        />
        <input
          name="note"
          placeholder={guestListCopy.notePlaceholder[locale]}
          className="flex-1 rounded border border-[var(--brand-line)] bg-white px-3 py-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-[var(--brand-gold)] px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {addPending ? guestListCopy.addPending[locale] : guestListCopy.add[locale]}
        </button>
      </form>

      {guests.length === 0 ? (
        <p className="text-sm text-[var(--brand-ink-soft)]">{guestListCopy.empty[locale]}</p>
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
                onClick={() => handleDelete(guest.id)}
                aria-label={editForm.deleteAria[locale]}
                className="text-[var(--brand-ink-soft)] hover:text-red-500"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
