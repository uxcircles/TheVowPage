"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { geocodeVenue, timezoneForCoords } from "@/lib/geocode";
import { wallTimeToUtcIso } from "@/lib/timezone";
import type { ScheduleItem } from "@/components/templates/classic/types";

const DEFAULT_TIMEZONE = "Asia/Taipei";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

function randomSlugSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

export async function createWedding() {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("weddings")
    .insert({
      owner_id: user.id,
      slug: `wedding-${randomSlugSuffix()}`,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "建立喜帖失敗");
  }

  redirect(`/dashboard/${data.id}/edit`);
}

export type UpdateWeddingState = { error?: string; success?: boolean } | undefined;

export async function updateWeddingContent(
  weddingId: string,
  _prevState: UpdateWeddingState,
  formData: FormData
): Promise<UpdateWeddingState> {
  const { supabase } = await requireUser();

  const slug = String(formData.get("slug") ?? "").trim();
  const eventDateRaw = String(formData.get("eventDate") ?? "").trim();

  const times = formData.getAll("scheduleTime") as string[];
  const events = formData.getAll("scheduleEvent") as string[];
  const schedule: ScheduleItem[] = times
    .map((time, i) => ({ time: time.trim(), event: (events[i] ?? "").trim() }))
    .filter((item) => item.time || item.event);

  const venueName = String(formData.get("venueName") ?? "").trim();
  const venueAddress = String(formData.get("venueAddress") ?? "").trim();
  const manualCoords = formData.get("manualCoords") === "on";

  // By default the map position (and the timezone the event date/time is
  // interpreted in) is derived from the venue name/address via geocoding,
  // so most people never have to think about coordinates or timezones.
  // "manualCoords" is the escape hatch for when geocoding gets it wrong.
  let venueLat: number | null = null;
  let venueLng: number | null = null;
  let timezone = DEFAULT_TIMEZONE;
  if (manualCoords) {
    venueLat = formData.get("venueLat") ? Number(formData.get("venueLat")) : null;
    venueLng = formData.get("venueLng") ? Number(formData.get("venueLng")) : null;
    if (venueLat !== null && venueLng !== null) {
      timezone = timezoneForCoords(venueLat, venueLng);
    }
  } else if (venueName || venueAddress) {
    const geocoded = await geocodeVenue(venueName, venueAddress);
    venueLat = geocoded?.lat ?? null;
    venueLng = geocoded?.lng ?? null;
    timezone = geocoded?.timezone ?? DEFAULT_TIMEZONE;
  }

  const { error } = await supabase
    .from("weddings")
    .update({
      slug,
      groom_name: String(formData.get("groomName") ?? "").trim(),
      bride_name: String(formData.get("brideName") ?? "").trim(),
      groom_label: String(formData.get("groomLabel") ?? "").trim() || "新郎",
      bride_label: String(formData.get("brideLabel") ?? "").trim() || "新娘",
      groom_parents: String(formData.get("groomParents") ?? "").trim(),
      groom_parents_relation: String(formData.get("groomParentsRelation") ?? "").trim(),
      bride_parents: String(formData.get("brideParents") ?? "").trim(),
      bride_parents_relation: String(formData.get("brideParentsRelation") ?? "").trim(),
      // The datetime-local input has no timezone of its own; treat it as
      // wall-clock time in the venue's own (geocoded) timezone, not the
      // server process's timezone.
      event_date: wallTimeToUtcIso(eventDateRaw, timezone),
      timezone,
      venue_name: venueName,
      venue_hall: String(formData.get("venueHall") ?? "").trim(),
      venue_address: venueAddress,
      venue_lat: venueLat,
      venue_lng: venueLng,
      schedule,
      theme: String(formData.get("theme") ?? "gold").trim(),
      seal: String(formData.get("seal") ?? "calla").trim(),
      moments_style: String(formData.get("momentsStyle") ?? "stack").trim(),
      show_family: formData.get("showFamily") === "on",
      show_schedule: formData.get("showSchedule") === "on",
      dress_code: String(formData.get("dressCode") ?? "").trim(),
      show_dress_code: formData.get("showDressCode") === "on",
      show_rsvp: formData.get("showRsvp") === "on",
      thanks_message: String(formData.get("thanksMessage") ?? "").trim(),
    })
    .eq("id", weddingId);

  if (error) {
    return {
      error: error.message.includes("duplicate") ? "這個網址代稱已經被使用了" : "儲存失敗，請稍後再試。",
    };
  }

  revalidatePath(`/dashboard/${weddingId}/edit`);
  return { success: true };
}

export async function setWeddingStatus(weddingId: string, status: "draft" | "published") {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("weddings").update({ status }).eq("id", weddingId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/${weddingId}/edit`);
}

export async function deleteWedding(weddingId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("weddings").delete().eq("id", weddingId);
  if (error) throw new Error(error.message);
  // ?deleted=1 lets the dashboard list show a toast after the redirect -
  // the client never sees a normal resolved promise here (redirect() works
  // by throwing), so there's no other point to fire one from.
  redirect("/dashboard?deleted=1");
}

export async function deleteWeddingPhoto(weddingId: string, photoId: string) {
  const { supabase } = await requireUser();
  const { data: photo } = await supabase
    .from("wedding_photos")
    .select("storage_path")
    .eq("id", photoId)
    .maybeSingle();

  if (photo) {
    await supabase.storage.from("wedding-photos").remove([photo.storage_path]);
  }
  const { error } = await supabase.from("wedding_photos").delete().eq("id", photoId);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/${weddingId}/edit`);
}

export async function moveMomentPhoto(weddingId: string, photoId: string, direction: "up" | "down") {
  const { supabase } = await requireUser();
  const { data: photos } = await supabase
    .from("wedding_photos")
    .select("id, sort_order")
    .eq("wedding_id", weddingId)
    .eq("kind", "moment")
    .order("sort_order", { ascending: true });

  if (!photos) return;
  const index = photos.findIndex((p) => p.id === photoId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= photos.length) return;

  const a = photos[index];
  const b = photos[swapIndex];

  await supabase.from("wedding_photos").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from("wedding_photos").update({ sort_order: a.sort_order }).eq("id", b.id);

  revalidatePath(`/dashboard/${weddingId}/edit`);
}

// Used by desktop drag-and-drop, which can drop a photo anywhere in the
// grid in one gesture (not just swap with a neighbour like moveMomentPhoto
// above) - orderedPhotoIds is the full Moments list in its new order.
export async function reorderMomentPhotos(weddingId: string, orderedPhotoIds: string[]) {
  const { supabase } = await requireUser();
  await Promise.all(
    orderedPhotoIds.map((id, index) =>
      supabase
        .from("wedding_photos")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("wedding_id", weddingId)
    )
  );
  revalidatePath(`/dashboard/${weddingId}/edit`);
}
