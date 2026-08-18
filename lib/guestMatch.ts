import type { Tables } from "@/lib/supabase/database.types";

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "");
}

/** Finds the best-guess RSVP match for a guest-list entry, among RSVPs not
 * already claimed (linked to a guest, or tentatively suggested to an
 * earlier one in the same pass) - exact name match first, then a
 * substring match in either direction (handles a guest-list entry that's
 * just a surname/nickname, or an RSVP name with extra text like "陳大文
 * 全家" or a trailing note). Lightweight/imperfect by design: wildly
 * different spellings or one RSVP covering a whole family under an
 * unrelated name won't be caught - the couple confirms manually either
 * way, this is just a shortcut for the obvious cases. */
export function findRsvpMatch(
  guestName: string,
  rsvps: Tables<"rsvps">[],
  claimedRsvpIds: Set<string>,
): Tables<"rsvps"> | null {
  const normalizedGuest = normalize(guestName);
  if (!normalizedGuest) return null;

  const candidates = rsvps.filter((r) => !claimedRsvpIds.has(r.id));

  const exact = candidates.find((r) => normalize(r.name) === normalizedGuest);
  if (exact) return exact;

  return (
    candidates.find((r) => {
      const normalizedRsvp = normalize(r.name);
      return normalizedRsvp.length > 0 && (normalizedRsvp.includes(normalizedGuest) || normalizedGuest.includes(normalizedRsvp));
    }) ?? null
  );
}
