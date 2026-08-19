"use client";

import { useMemo, useRef, useTransition } from "react";
import { addGuest, deleteGuest, linkGuestToRsvp, unlinkGuest } from "@/lib/actions/guests";
import { findRsvpMatch } from "@/lib/guestMatch";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { useToast } from "@/components/ui/Toast";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { guestListCopy, editForm, rsvpTableCopy } from "@/lib/i18n/dictionaries/dashboard";
import type { Tables } from "@/lib/supabase/database.types";

export function GuestList({
  weddingId,
  guests,
  rsvps,
}: {
  weddingId: string;
  guests: Tables<"guests">[];
  rsvps: Tables<"rsvps">[];
}) {
  const locale = useLocale();
  const showToast = useToast();
  // Separate transitions (not one shared `pending`) so the add button's
  // label reflects an add in flight specifically, not a delete elsewhere
  // in the list - both still gate every button below via `pending` so
  // nothing else can be clicked mid-mutation.
  const [addPending, startAddTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [linkPending, startLinkTransition] = useTransition();
  const pending = addPending || deletePending || linkPending;
  const formRef = useRef<HTMLFormElement>(null);

  const rsvpById = useMemo(() => new Map(rsvps.map((r) => [r.id, r])), [rsvps]);

  // Suggests at most one guest per unlinked RSVP - computed as a single
  // pass over `guests` in order, so two similarly-named unlinked guests
  // don't both get offered the same not-yet-confirmed RSVP.
  const suggestions = useMemo(() => {
    const claimed = new Set(guests.map((g) => g.rsvp_id).filter((id): id is string => id !== null));
    const result = new Map<string, Tables<"rsvps">>();
    for (const guest of guests) {
      if (guest.rsvp_id) continue;
      const match = findRsvpMatch(guest.name, rsvps, claimed);
      if (match) {
        result.set(guest.id, match);
        claimed.add(match.id);
      }
    }
    return result;
  }, [guests, rsvps]);

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

  function handleLink(guestId: string, rsvpId: string) {
    startLinkTransition(async () => {
      try {
        await linkGuestToRsvp(weddingId, guestId, rsvpId);
      } catch {
        showToast(guestListCopy.linkFailed[locale], "error");
      }
    });
  }

  function handleUnlink(guestId: string) {
    startLinkTransition(async () => {
      try {
        await unlinkGuest(weddingId, guestId);
      } catch {
        showToast(guestListCopy.unlinkFailed[locale], "error");
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
          {guests.map((guest) => {
            const linkedRsvp = guest.rsvp_id ? rsvpById.get(guest.rsvp_id) : undefined;
            const suggestedRsvp = suggestions.get(guest.id);
            return (
              <li
                key={guest.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--brand-line)] bg-white px-4 py-2.5"
              >
                <span>
                  <span className="font-medium">{guest.name}</span>
                  {guest.note && <span className="ml-3 text-sm text-[var(--brand-ink-soft)]">{guest.note}</span>}
                </span>
                <span className="flex items-center gap-3">
                  {linkedRsvp ? (
                    <span className="flex items-center gap-2 text-xs">
                      <span
                        className={`rounded px-2 py-1 font-medium ${
                          linkedRsvp.attending ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {linkedRsvp.attending ? rsvpTableCopy.attendingYes[locale] : rsvpTableCopy.attendingNo[locale]}
                      </span>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleUnlink(guest.id)}
                        className="text-[var(--brand-ink-soft)] underline hover:text-[var(--brand-gold)]"
                      >
                        {guestListCopy.unlink[locale]}
                      </button>
                    </span>
                  ) : suggestedRsvp ? (
                    <span className="flex items-center gap-2 text-xs text-[var(--brand-ink-soft)]">
                      {guestListCopy.matchHint[locale](suggestedRsvp.name)}
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleLink(guest.id, suggestedRsvp.id)}
                        className="rounded border border-[var(--brand-gold)] px-2 py-1 font-medium text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/10"
                      >
                        {guestListCopy.confirmMatch[locale]}
                      </button>
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--brand-ink-soft)]">{guestListCopy.notRepliedYet[locale]}</span>
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleDelete(guest.id)}
                    aria-label={editForm.deleteAria[locale]}
                    className="text-[var(--brand-ink-soft)] hover:text-[var(--brand-error)]"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
