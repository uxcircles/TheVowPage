import { cache } from "react";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import type { ClassicTemplateData, ContentEn, ScheduleItem } from "@/components/templates/classic/types";
import type { Tables } from "@/lib/supabase/database.types";

// The [weddingId] layout and each of its edit/guests/rsvps pages all
// independently re-fetched this same row just to re-verify ownership -
// cache() collapses those into one query per request. Callers that only
// need the ownership check (guests/rsvps pages) get the full row for free
// instead of running their own narrower select.
export const getOwnedWedding = cache(async (weddingId: string): Promise<Tables<"weddings"> | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("id", weddingId)
    .eq("owner_id", user.id)
    .maybeSingle();
  return wedding;
});

export type PublicWeddingResult =
  | { status: "ok"; data: ClassicTemplateData; isDemo: boolean }
  | { status: "not_found" }
  | { status: "expired" };

// RLS lets the owner select their own row here regardless of status (so
// dashboard code elsewhere can look up a draft by id), but this function is
// specifically the *public* page's data source - explicitly requiring
// status === "published" (rather than relying on RLS alone) means an
// unpublished wedding's /w/[slug] link 404s for everyone, including the
// owner viewing their own draft. Owners preview drafts via the dashboard's
// own "預覽喜帖" button instead, which shows live unsaved edits too.
//
// cache()'d because /w/[slug]'s generateMetadata (for the OG/Twitter tags)
// and the page component itself both need this same row - without it,
// every visit to a published invitation would hit Supabase twice.
export const getPublicWeddingData = cache(async (slug: string): Promise<PublicWeddingResult> => {
  const supabase = await createClient();
  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !wedding || wedding.status !== "published") return { status: "not_found" };
  if (wedding.expires_at && new Date(wedding.expires_at) < new Date()) return { status: "expired" };

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

  const data: ClassicTemplateData = {
    weddingId: wedding.id,
    theme: wedding.theme,
    sealDesign: wedding.seal,
    momentsStyle: wedding.moments_style,
    groomName: wedding.groom_name,
    brideName: wedding.bride_name,
    groomLabel: wedding.groom_label,
    brideLabel: wedding.bride_label,
    groomParents: wedding.groom_parents,
    groomParentsRelation: wedding.groom_parents_relation,
    brideParents: wedding.bride_parents,
    brideParentsRelation: wedding.bride_parents_relation,
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
    bilingualEnabled: wedding.bilingual_enabled,
    contentEn: (wedding.content_en as ContentEn | null) ?? {},
  };
  return { status: "ok", data, isDemo: wedding.is_demo };
});
