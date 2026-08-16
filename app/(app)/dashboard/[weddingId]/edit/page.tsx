import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnedWedding } from "@/lib/weddings";
import { WeddingEditForm } from "@/components/dashboard/WeddingEditForm";
import { SlugField } from "@/components/dashboard/SlugField";
import { WeddingStylePicker } from "@/components/dashboard/WeddingStylePicker";
import { MomentsStyleField } from "@/components/dashboard/MomentsStyleField";
import { PhotoSlot } from "@/components/dashboard/PhotoSlot";
import { MomentsGallery } from "@/components/dashboard/MomentsGallery";
import { EditorCard } from "@/components/ui/EditorCard";
import { getLocale } from "@/lib/i18n/locale";
import { editPageCopy, draftEditorCopy } from "@/lib/i18n/dictionaries/dashboard";

export default async function EditWeddingPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const wedding = await getOwnedWedding(weddingId);
  if (!wedding) notFound();
  const locale = await getLocale();

  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("wedding_photos")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("sort_order", { ascending: true });

  const publicUrl = (path: string) =>
    supabase.storage.from("wedding-photos").getPublicUrl(path).data.publicUrl;

  const heroPhoto = photos?.find((p) => p.kind === "hero");
  const familyPhoto = photos?.find((p) => p.kind === "family");
  const footerPhoto = photos?.find((p) => p.kind === "footer");
  const moments = (photos ?? []).filter((p) => p.kind === "moment");

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-4 text-lg font-medium">{editPageCopy.slugSection[locale]}</h2>
        {/* Rendered outside <WeddingEditForm>'s own <form> so it can sit in
            its own card at the top of the page (separate from the rest of
            the content fields further down) while still submitting through
            the same 儲存 action via the form attribute. */}
        <EditorCard>
          <SlugField slug={wedding.slug} />
        </EditorCard>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">{draftEditorCopy.templateSection[locale]}</h2>
        <EditorCard>
          <WeddingStylePicker defaultTheme={wedding.theme} defaultSeal={wedding.seal} />
        </EditorCard>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">{draftEditorCopy.photosSection[locale]}</h2>
        <div className="flex flex-col gap-6">
          <EditorCard title={draftEditorCopy.heroFamilyFooterTitle[locale]}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <PhotoSlot
                weddingId={weddingId}
                kind="hero"
                label={draftEditorCopy.heroPhotoLabel[locale]}
                photoId={heroPhoto?.id ?? null}
                photoUrl={heroPhoto ? publicUrl(heroPhoto.storage_path) : null}
              />
              <PhotoSlot
                weddingId={weddingId}
                kind="family"
                label={draftEditorCopy.familyPhotoLabel[locale]}
                photoId={familyPhoto?.id ?? null}
                photoUrl={familyPhoto ? publicUrl(familyPhoto.storage_path) : null}
              />
              <PhotoSlot
                weddingId={weddingId}
                kind="footer"
                label={draftEditorCopy.footerPhotoLabel[locale]}
                photoId={footerPhoto?.id ?? null}
                photoUrl={footerPhoto ? publicUrl(footerPhoto.storage_path) : null}
              />
            </div>
          </EditorCard>
          <EditorCard title={draftEditorCopy.momentsTitle[locale]}>
            <MomentsGallery
              weddingId={weddingId}
              photos={moments.map((p) => ({ id: p.id, url: publicUrl(p.storage_path) }))}
            />
            <div className="mt-6">
              <MomentsStyleField defaultValue={wedding.moments_style} />
            </div>
          </EditorCard>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">{draftEditorCopy.contentSection[locale]}</h2>
        <WeddingEditForm
          weddingId={weddingId}
          wedding={wedding}
          heroPhotoUrl={heroPhoto ? publicUrl(heroPhoto.storage_path) : null}
          familyPhotoUrl={familyPhoto ? publicUrl(familyPhoto.storage_path) : null}
          footerPhotoUrl={footerPhoto ? publicUrl(footerPhoto.storage_path) : null}
          momentPhotoUrls={moments.map((p) => publicUrl(p.storage_path))}
        />
      </section>
    </div>
  );
}
