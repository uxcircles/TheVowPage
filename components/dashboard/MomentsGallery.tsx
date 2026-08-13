"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWeddingPhoto, moveMomentPhoto, reorderMomentPhotos } from "@/lib/actions/weddings";
import { uploadPhotoWithProgress } from "@/lib/uploadPhotoWithProgress";
import { useToast } from "@/components/ui/Toast";
import { MomentsPhotoGrid } from "@/components/ui/MomentsPhotoGrid";

export function MomentsGallery({
  weddingId,
  photos,
}: {
  weddingId: string;
  photos: { id: string; url: string }[];
}) {
  const router = useRouter();
  const showToast = useToast();
  const [uploading, startUploadTransition] = useTransition();
  const [otherPending, startOtherTransition] = useTransition();
  // Aggregate progress across the whole multi-file batch, not per-file - the
  // picker only has room for one status line, and the user cares about "how
  // much of my selection is done" more than any single file's byte count.
  const [batch, setBatch] = useState<{ done: number; total: number; percent: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pending = uploading || otherPending;

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    startUploadTransition(async () => {
      setBatch({ done: 0, total: files.length, percent: 0 });
      let failures = 0;
      for (let i = 0; i < files.length; i++) {
        const result = await uploadPhotoWithProgress(weddingId, "moment", files[i], (filePercent) => {
          setBatch({ done: i, total: files.length, percent: Math.round(((i + filePercent / 100) / files.length) * 100) });
        });
        if (result.error) failures++;
        setBatch({ done: i + 1, total: files.length, percent: Math.round(((i + 1) / files.length) * 100) });
      }
      setBatch(null);
      if (inputRef.current) inputRef.current.value = "";
      if (failures > 0) showToast(`${failures} 張照片上傳失敗，請稍後再試。`, "error");
      router.refresh();
    });
  }

  return (
    <div>
      <MomentsPhotoGrid
        items={photos}
        disabled={pending}
        onMove={(id, direction) => startOtherTransition(() => moveMomentPhoto(weddingId, id, direction))}
        onReorder={(orderedIds) => startOtherTransition(() => reorderMomentPhotos(weddingId, orderedIds))}
        onRemove={(id) => startOtherTransition(() => deleteWeddingPhoto(weddingId, id))}
      />
      {batch && (
        <div className="mt-3 flex flex-col gap-1">
          <p className="text-xs text-[var(--brand-ink-soft)]">
            上傳中 {batch.done}/{batch.total}
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--brand-line)]/40">
            <div
              className="h-full rounded-full bg-[var(--brand-gold)] transition-[width] duration-150 ease-out"
              style={{ width: `${batch.percent}%` }}
            />
          </div>
        </div>
      )}
      <label
        className={`inline-block cursor-pointer rounded border border-[var(--brand-line)] px-4 py-2 text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)] ${
          photos.length > 0 ? "mt-4" : ""
        }`}
      >
        {uploading ? "上傳中..." : "+ 新增照片（可多選）"}
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
