"use client";

import { useRef, useTransition } from "react";
import { uploadWeddingPhoto, deleteWeddingPhoto, moveMomentPhoto, reorderMomentPhotos } from "@/lib/actions/weddings";
import { MomentsPhotoGrid } from "@/components/ui/MomentsPhotoGrid";

export function MomentsGallery({
  weddingId,
  photos,
}: {
  weddingId: string;
  photos: { id: string; url: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    startTransition(async () => {
      for (const file of files) {
        const formData = new FormData();
        formData.set("file", file);
        await uploadWeddingPhoto(weddingId, "moment", formData);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div>
      <MomentsPhotoGrid
        items={photos}
        disabled={pending}
        onMove={(id, direction) => startTransition(() => moveMomentPhoto(weddingId, id, direction))}
        onReorder={(orderedIds) => startTransition(() => reorderMomentPhotos(weddingId, orderedIds))}
        onRemove={(id) => startTransition(() => deleteWeddingPhoto(weddingId, id))}
      />
      <label
        className={`inline-block cursor-pointer rounded border border-[var(--brand-line)] px-4 py-2 text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)] ${
          photos.length > 0 ? "mt-4" : ""
        }`}
      >
        {pending ? "上傳中..." : "+ 新增照片（可多選）"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesChange}
          disabled={pending}
        />
      </label>
    </div>
  );
}
