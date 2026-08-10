import { createClient } from "@/lib/supabase/server";
import type { ClassicTemplateData, ScheduleItem } from "@/components/templates/classic/types";

// Not filtering on status here is intentional: RLS already scopes rows to
// "published" for anon visitors, or the owner's own row regardless of
// status - so the wedding's owner can preview a draft at /w/[slug] before
// publishing, while everyone else only ever sees published weddings.
export async function getPublicWeddingData(slug: string): Promise<ClassicTemplateData | null> {
  const supabase = await createClient();
  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !wedding) return null;

  const { data: photos } = await supabase
    .from("wedding_photos")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("sort_order", { ascending: true });

  const publicUrl = (path: string) =>
    supabase.storage.from("wedding-photos").getPublicUrl(path).data.publicUrl;

  const heroPhoto = photos?.find((p) => p.kind === "hero");
  const familyPhoto = photos?.find((p) => p.kind === "family");
  const footerPhoto = photos?.find((p) => p.kind === "footer");
  const moments = (photos ?? []).filter((p) => p.kind === "moment");

  return {
    weddingId: wedding.id,
    theme: wedding.theme,
    sealDesign: wedding.seal,
    momentsStyle: wedding.moments_style,
    groomName: wedding.groom_name,
    brideName: wedding.bride_name,
    groomLabel: wedding.groom_label,
    brideLabel: wedding.bride_label,
    groomParents: wedding.groom_parents,
    brideParents: wedding.bride_parents,
    eventDate: wedding.event_date,
    timezone: wedding.timezone,
    venueName: wedding.venue_name,
    venueHall: wedding.venue_hall,
    venueAddress: wedding.venue_address,
    venueLat: wedding.venue_lat,
    venueLng: wedding.venue_lng,
    schedule: (wedding.schedule as ScheduleItem[] | null) ?? [],
    dressCode: wedding.dress_code,
    thanksMessage: wedding.thanks_message,
    heroPhotoUrl: heroPhoto ? publicUrl(heroPhoto.storage_path) : null,
    familyPhotoUrl: familyPhoto ? publicUrl(familyPhoto.storage_path) : null,
    footerPhotoUrl: footerPhoto ? publicUrl(footerPhoto.storage_path) : null,
    momentPhotoUrls: moments.map((p) => publicUrl(p.storage_path)),
    showFamily: wedding.show_family,
    showSchedule: wedding.show_schedule,
    showDressCode: wedding.show_dress_code,
    showRsvp: wedding.show_rsvp,
  };
}
