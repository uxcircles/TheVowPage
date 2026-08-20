"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function addGuest(weddingId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (!name) return;

  const { error } = await supabase.from("guests").insert({ wedding_id: weddingId, name, note });
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/${weddingId}/guests`);
}

export async function deleteGuest(weddingId: string, guestId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("guests").delete().eq("id", guestId);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/${weddingId}/guests`);
}

export async function linkGuestToRsvp(weddingId: string, guestId: string, rsvpId: string) {
  const { supabase } = await requireUser();

  // guests.rsvp_id's foreign key only requires *a* valid rsvps.id - it
  // doesn't require that row to belong to this same wedding. RLS alone
  // doesn't catch that either: guests_all_own only checks that the guest
  // being updated is yours, not what rsvp_id it's being pointed at.
  // Without this check, an authenticated owner of *some* wedding could
  // link their own guest to an arbitrary other wedding's rsvp id (if they
  // ever obtained one) and read that stranger's RSVP - name, dietary
  // notes, message to the couple - through their own guest list. This
  // SELECT is scoped to both the rsvp id and this wedding_id, and RLS
  // (rsvps_select_own) independently backstops it to rsvps this user
  // actually owns.
  const { data: rsvp } = await supabase
    .from("rsvps")
    .select("id")
    .eq("id", rsvpId)
    .eq("wedding_id", weddingId)
    .maybeSingle();
  if (!rsvp) throw new Error("RSVP not found");

  const { error } = await supabase.from("guests").update({ rsvp_id: rsvpId }).eq("id", guestId);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/${weddingId}/guests`);
}

export async function unlinkGuest(weddingId: string, guestId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("guests").update({ rsvp_id: null }).eq("id", guestId);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/${weddingId}/guests`);
}
