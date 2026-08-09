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
