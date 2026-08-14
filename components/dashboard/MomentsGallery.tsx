"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWeddingPhoto, moveMomentPhoto, reorderMomentPhotos } from "@/lib/actions/weddings";
import { uploadPhotoWithProgress } from "@/lib/uploadPhotoWithProgress";
import { validatePhotoType, validatePhotoSize, MAX_MOMENT_PHOTOS } from "@/lib/photoLimits";
import { compressImage } from "@/lib/compressImage";
import { useToast } from "@/components/ui/Toast";
import { MomentsPhotoGrid } from "@/components/ui/MomentsPhotoGrid";

type BatchPhase = "compressing" | "uploading" | "processing";

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
  const [batch, setBatch] = useState<{ done: number; total: number; percent: number; phase: BatchPhase } | null>(
    null
  );
  // Optimistic removal, same reasoning as PhotoSlot - deleteWeddingPhoto's
  // round trip (storage remove + DB delete + refresh) is slow enough that
  // waiting for it before hiding the photo reads as sluggish. Once the
  // server confirms, the id drops out of the `photos` prop too, so a
  // lingering entry here is a harmless no-op for the filter below rather
  // than something that needs active pruning.
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const visiblePhotos = photos.filter((p) => !removedIds.has(p.id));

  const inputRef = useRef<HTMLInputElement>(null);
  const pending = uploading || otherPending;

  function handleRemove(id: string) {
    setRemovedIds((prev) => new Set(prev).add(id));
    startOtherTransition(async () => {
      try {
        await deleteWeddingPhoto(weddingId, id);
      } catch {
        setRemovedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        showToast("移除失敗，請稍後再試。", "error");
      }
    });
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    const remainingSlots = MAX_MOMENT_PHOTOS - visiblePhotos.length;
    const overLimitCount = Math.max(0, selected.length - remainingSlots);
    const withinLimit = selected.slice(0, Math.max(0, remainingSlots));

    const typeValidFiles: File[] = [];
    let typeInvalidCount = 0;
    for (const file of withinLimit) {
      if (validatePhotoType(file)) typeInvalidCount++;
      else typeValidFiles.push(file);
    }

    if (overLimitCount > 0) {
      showToast(`婚紗相簿最多只能上傳 ${MAX_MOMENT_PHOTOS} 張，已略過 ${overLimitCount} 張。`, "error");
    }
    if (typeInvalidCount > 0) {
      showToast(`${typeInvalidCount} 張照片格式不符，已略過。`, "error");
    }
    if (typeValidFiles.length === 0) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    startUploadTransition(async () => {
      const total = typeValidFiles.length;
      let failures = 0;
      for (let i = 0; i < total; i++) {
        setBatch({ done: i, total, percent: Math.round((i / total) * 100), phase: "compressing" });
        const compressed = await compressImage(typeValidFiles[i]);
        const sizeError = validatePhotoSize(compressed);
        if (sizeError) {
          failures++;
          setBatch({ done: i + 1, total, percent: Math.round(((i + 1) / total) * 100), phase: "compressing" });
          continue;
        }

        const result = await uploadPhotoWithProgress(weddingId, "moment", compressed, (filePercent) => {
          setBatch({
            done: i,
            total,
            percent: Math.round(((i + filePercent / 100) / total) * 100),
            // filePercent hits 100 once the browser finishes sending bytes,
            // but the server still has to push to Supabase Storage and
            // write the DB row - that gap can take a few extra seconds per
            // file, not just at the very end of the batch.
            phase: filePercent >= 100 ? "processing" : "uploading",
          });
        });
        if (result.error) failures++;
        setBatch({ done: i + 1, total, percent: Math.round(((i + 1) / total) * 100), phase: "uploading" });
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
        items={visiblePhotos}
        disabled={pending}
        onMove={(id, direction) => startOtherTransition(() => moveMomentPhoto(weddingId, id, direction))}
        onReorder={(orderedIds) => startOtherTransition(() => reorderMomentPhotos(weddingId, orderedIds))}
        onRemove={handleRemove}
      />
      {batch && (
        <div className="mt-3 mb-4 flex flex-col gap-1">
          <p className="text-xs text-[var(--brand-ink-soft)]">
            {batch.phase === "compressing" ? "壓縮中" : batch.phase === "processing" ? "處理中" : "上傳中"}{" "}
            {batch.done}/{batch.total}
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--brand-line)]/40">
            {batch.phase !== "uploading" ? (
              <div className="upload-indeterminate h-full rounded-full" />
            ) : (
              <div
                className="h-full rounded-full bg-[var(--brand-gold)] transition-[width] duration-150 ease-out"
                style={{ width: `${batch.percent}%` }}
              />
            )}
          </div>
        </div>
      )}
      <label
        className={`inline-block cursor-pointer rounded border border-[var(--brand-line)] px-4 py-2 text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)] ${
          visiblePhotos.length > 0 && !batch ? "mt-4" : ""
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
