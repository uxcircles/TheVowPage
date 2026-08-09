"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deleteRsvp(weddingId: string, rsvpId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("rsvps").delete().eq("id", rsvpId);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/${weddingId}/rsvps`);
}
