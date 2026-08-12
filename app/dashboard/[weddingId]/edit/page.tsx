import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnedWedding } from "@/lib/weddings";
import { WeddingEditForm, FORM_ID } from "@/components/dashboard/WeddingEditForm";
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
  const wedding = await getOwnedWedding(weddingId);
  if (!wedding) notFound();

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
        <h2 className="mb-4 text-lg font-medium">網址代稱</h2>
        {/* Rendered outside <WeddingEditForm>'s own <form> so it can sit in
            its own card at the top of the page (separate from the rest of
            the content fields further down) while still submitting through
            the same 儲存 action via the form attribute. */}
        <EditorCard>
          <label className="flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]">
            這決定喜帖的公開網址（thevowpage.com/w/...）
            <input
              name="slug"
              defaultValue={wedding.slug}
              required
              form={FORM_ID}
              className="rounded border border-[var(--brand-line)] bg-white px-3 py-2 text-foreground"
            />
          </label>
        </EditorCard>
      </section>

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
            <div className="mt-6">
              <MomentsStyleField defaultValue={wedding.moments_style} />
            </div>
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
