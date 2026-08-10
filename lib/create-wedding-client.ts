import { createClient } from "@/lib/supabase/client";
import { wallTimeToUtcIso } from "@/lib/timezone";
import type { ScheduleItem } from "@/components/templates/classic/types";

const DEFAULT_TIMEZONE = "Asia/Taipei";

export type DraftContent = {
  theme: string;
  sealDesign: string;
  momentsStyle: string;
  groomName: string;
  brideName: string;
  groomLabel: string;
  brideLabel: string;
  groomParents: string;
  brideParents: string;
  eventDate: string; // datetime-local value, wall clock in the venue's timezone
  venueName: string;
  venueHall: string;
  venueAddress: string;
  manualCoords: boolean;
  venueLat: string;
  venueLng: string;
  schedule: ScheduleItem[];
  dressCode: string;
  thanksMessage: string;
  showFamily: boolean;
  showSchedule: boolean;
  showDressCode: boolean;
  showRsvp: boolean;
};

export type GeocodeApiResult = { lat: number; lng: number; timezone: string; address: string | null };

/** Calls the /api/geocode route, which does the actual Nominatim + timezone
 * lookup server-side. Pass either venueName/address (forward geocode) or
 * lat/lng (just resolves the timezone for an already-known point). */
export async function fetchGeocode(
  params: { venueName: string; address: string } | { lat: number; lng: number }
): Promise<GeocodeApiResult | null> {
  try {
    const query =
      "lat" in params
        ? new URLSearchParams({ lat: String(params.lat), lng: String(params.lng) })
        : new URLSearchParams({ venueName: params.venueName, address: params.address });
    const res = await fetch(`/api/geocode?${query.toString()}`);
    if (!res.ok) return null;
    const { result } = (await res.json()) as { result: GeocodeApiResult | null };
    return result;
  } catch {
    return null;
  }
}

export type DraftPhotos = {
  hero: File | null;
  family: File | null;
  footer: File | null;
  moments: File[];
};

function randomSlugSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

/** Creates a real wedding row + uploads any picked photos, right after the
 * visitor authenticates for the first time. Runs entirely client-side using
 * the freshly-authenticated browser session (RLS authorizes it via
 * owner_id = auth.uid()). */
export async function saveDraftAsWedding(
  draft: DraftContent,
  photos: DraftPhotos,
  userId: string
): Promise<string> {
  const supabase = createClient();

  let venueLat: number | null = null;
  let venueLng: number | null = null;
  let timezone = DEFAULT_TIMEZONE;
  if (draft.manualCoords) {
    venueLat = draft.venueLat ? Number(draft.venueLat) : null;
    venueLng = draft.venueLng ? Number(draft.venueLng) : null;
    if (venueLat !== null && venueLng !== null) {
      const resolved = await fetchGeocode({ lat: venueLat, lng: venueLng });
      timezone = resolved?.timezone ?? DEFAULT_TIMEZONE;
    }
  } else {
    const geocoded = await fetchGeocode({ venueName: draft.venueName, address: draft.venueAddress });
    venueLat = geocoded?.lat ?? null;
    venueLng = geocoded?.lng ?? null;
    timezone = geocoded?.timezone ?? DEFAULT_TIMEZONE;
  }

  const { data: wedding, error: insertError } = await supabase
    .from("weddings")
    .insert({
      owner_id: userId,
      slug: `wedding-${randomSlugSuffix()}`,
      groom_name: draft.groomName,
      bride_name: draft.brideName,
      groom_label: draft.groomLabel.trim() || "新郎",
      bride_label: draft.brideLabel.trim() || "新娘",
      groom_parents: draft.groomParents,
      bride_parents: draft.brideParents,
      event_date: wallTimeToUtcIso(draft.eventDate, timezone),
      timezone,
      theme: draft.theme,
      seal: draft.sealDesign,
      moments_style: draft.momentsStyle,
      venue_name: draft.venueName,
      venue_hall: draft.venueHall,
      venue_address: draft.venueAddress,
      venue_lat: venueLat,
      venue_lng: venueLng,
      schedule: draft.schedule.filter((item) => item.time || item.event),
      dress_code: draft.dressCode,
      thanks_message: draft.thanksMessage,
      show_family: draft.showFamily,
      show_schedule: draft.showSchedule,
      show_dress_code: draft.showDressCode,
      show_rsvp: draft.showRsvp,
    })
    .select("id")
    .single();

  if (insertError || !wedding) {
    throw new Error(insertError?.message ?? "建立喜帖失敗");
  }

  const weddingId = wedding.id as string;

  async function uploadOne(kind: string, file: File, sortOrder: number) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${weddingId}/${kind}-${Date.now()}-${sortOrder}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("wedding-photos")
      .upload(path, file, { contentType: file.type });
    if (uploadError) throw new Error(uploadError.message);
    const { error: rowError } = await supabase
      .from("wedding_photos")
      .insert({ wedding_id: weddingId, kind, storage_path: path, sort_order: sortOrder });
    if (rowError) throw new Error(rowError.message);
  }

  if (photos.hero) await uploadOne("hero", photos.hero, 0);
  if (photos.family) await uploadOne("family", photos.family, 0);
  if (photos.footer) await uploadOne("footer", photos.footer, 0);
  for (let i = 0; i < photos.moments.length; i++) {
    await uploadOne("moment", photos.moments[i], i);
  }

  return weddingId;
}
