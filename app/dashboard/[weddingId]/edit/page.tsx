import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WeddingEditForm } from "@/components/dashboard/WeddingEditForm";
import { WeddingStylePicker } from "@/components/dashboard/WeddingStylePicker";
import { MomentsStyleField } from "@/components/dashboard/MomentsStyleField";
import { PhotoSlot } from "@/components/dashboard/PhotoSlot";
import { MomentsGallery } from "@/components/dashboard/MomentsGallery";
import { EditorCard } from "@/components/ui/EditorCard";

export default async function EditWeddingPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("id", weddingId)
    .eq("owner_id", user?.id ?? "")
    .maybeSingle();

  if (!wedding) notFound();

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
        <h2 className="mb-4 text-lg font-medium">喜帖樣板</h2>
        <EditorCard>
          <WeddingStylePicker defaultTheme={wedding.theme} defaultSeal={wedding.seal} />
        </EditorCard>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">照片</h2>
        <div className="flex flex-col gap-6">
          <EditorCard title="主視覺 / 合影 / 頁尾照片">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <PhotoSlot
                weddingId={weddingId}
                kind="hero"
                label="主視覺照（封面）"
                photoId={heroPhoto?.id ?? null}
                photoUrl={heroPhoto ? publicUrl(heroPhoto.storage_path) : null}
              />
              <PhotoSlot
                weddingId={weddingId}
                kind="family"
                label="雙方合影"
                photoId={familyPhoto?.id ?? null}
                photoUrl={familyPhoto ? publicUrl(familyPhoto.storage_path) : null}
              />
              <PhotoSlot
                weddingId={weddingId}
                kind="footer"
                label="頁尾照片"
                photoId={footerPhoto?.id ?? null}
                photoUrl={footerPhoto ? publicUrl(footerPhoto.storage_path) : null}
              />
            </div>
          </EditorCard>
          <EditorCard title="婚紗相簿（Moments）">
            <MomentsGallery
              weddingId={weddingId}
              photos={moments.map((p) => ({ id: p.id, url: publicUrl(p.storage_path) }))}
            />
            <MomentsStyleField defaultValue={wedding.moments_style} />
          </EditorCard>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">喜帖內容</h2>
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
