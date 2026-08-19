"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWeddingPhoto, moveMomentPhoto, reorderMomentPhotos } from "@/lib/actions/weddings";
import { uploadPhotoWithProgress } from "@/lib/uploadPhotoWithProgress";
import { validatePhotoType, validatePhotoSize, MAX_MOMENT_PHOTOS } from "@/lib/photoLimits";
import { compressImage } from "@/lib/compressImage";
import { useToast } from "@/components/ui/Toast";
import { MomentsPhotoGrid } from "@/components/ui/MomentsPhotoGrid";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { momentsCopy } from "@/lib/i18n/dictionaries/dashboard";

type BatchPhase = "compressing" | "uploading" | "processing";

function reorderByIds<T extends { id: string }>(list: T[], orderedIds: string[]): T[] {
  const byId = new Map(list.map((item) => [item.id, item]));
  const ordered = orderedIds.map((id) => byId.get(id)).filter((item): item is T => Boolean(item));
  for (const item of list) {
    if (!orderedIds.includes(item.id)) ordered.push(item);
  }
  return ordered;
}

export function MomentsGallery({
  weddingId,
  photos,
}: {
  weddingId: string;
  photos: { id: string; url: string }[];
}) {
  const router = useRouter();
  const locale = useLocale();
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

  // Optimistic add, same reasoning as PhotoSlot's optimistic replace: the
  // grid is driven by the `photos` prop, which only reflects newly
  // uploaded photos once router.refresh()'s server round trip finishes -
  // appending local object-URL previews as each file finishes uploading
  // means the grid grows immediately instead of sitting unchanged for a
  // few seconds after the progress bar disappears. The whole grid is
  // already disabled while `pending` is true (including through the
  // refresh, since it's called inside this same transition), so there's
  // no need to separately guard these from being reordered/removed before
  // they have a real id.
  const [pendingPreviews, setPendingPreviews] = useState<{ id: string; url: string }[]>([]);
  const baseDisplayedPhotos = [...visiblePhotos, ...pendingPreviews];

  // Optimistic reorder: dnd-kit's own drag animation already snaps the
  // dropped photo into its new slot, but the `items` array driving that
  // layout was still server order until reorderMomentPhotos's round trip
  // (and revalidation) caught up - without this, the very next re-render
  // would snap the photo back to its old position, then jump again once
  // the server confirmed. Cleared as soon as the `photos` prop itself
  // changes, trusting the fresh server order at that point (whether the
  // move succeeded, or - on failure - reverted).
  const [orderOverride, setOrderOverride] = useState<string[] | null>(null);
  useEffect(() => {
    setOrderOverride(null);
  }, [photos]);
  const displayedPhotos = orderOverride ? reorderByIds(baseDisplayedPhotos, orderOverride) : baseDisplayedPhotos;

  // Once the server-confirmed photos prop catches up (after
  // router.refresh() resolves), the real rows have taken their place -
  // drop the optimistic previews and release their object URLs. Guarded
  // on `!uploading`: `photos` can also change mid-upload now that adding
  // is allowed to run alongside a delete (see the input's disabled prop
  // below) - a delete's own revalidation would otherwise trip this
  // effect and wipe out previews for files that are still uploading,
  // making them blink out of the grid until the upload's *own* refresh
  // (at the end of handleFilesChange) brings them back.
  useEffect(() => {
    if (uploading || pendingPreviews.length === 0) return;
    pendingPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    setPendingPreviews([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos, uploading]);

  // Revoke on unmount too, in case the user navigates away before the
  // refresh above ever lands.
  useEffect(() => {
    return () => {
      pendingPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  const pending = uploading || otherPending;

  function handleReorder(orderedIds: string[]) {
    setOrderOverride(orderedIds);
    startOtherTransition(() => reorderMomentPhotos(weddingId, orderedIds));
  }

  function handleMove(id: string, direction: "up" | "down") {
    const currentOrder = orderOverride ?? displayedPhotos.map((p) => p.id);
    const index = currentOrder.indexOf(id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= currentOrder.length) return;
    const next = [...currentOrder];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    setOrderOverride(next);
    startOtherTransition(() => moveMomentPhoto(weddingId, id, direction));
  }

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
        showToast(momentsCopy.removeFailed[locale], "error");
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
      showToast(momentsCopy.overLimit[locale](MAX_MOMENT_PHOTOS, overLimitCount), "error");
    }
    if (typeInvalidCount > 0) {
      showToast(momentsCopy.typeInvalid[locale](typeInvalidCount), "error");
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
        if (result.error) {
          failures++;
        } else {
          // Show the photo the moment it's confirmed uploaded, rather than
          // waiting for the whole batch (and the refresh after it) to
          // finish - each successfully uploaded file appears in the grid
          // right away.
          setPendingPreviews((prev) => [...prev, { id: `pending-${weddingId}-${i}-${Date.now()}`, url: URL.createObjectURL(compressed) }]);
        }
        setBatch({ done: i + 1, total, percent: Math.round(((i + 1) / total) * 100), phase: "uploading" });
      }
      setBatch(null);
      if (inputRef.current) inputRef.current.value = "";
      if (failures > 0) showToast(momentsCopy.uploadFailedBatch[locale](failures), "error");
      router.refresh();
    });
  }

  return (
    <div>
      <MomentsPhotoGrid
        items={displayedPhotos}
        disabled={pending}
        onMove={handleMove}
        onReorder={handleReorder}
        onRemove={handleRemove}
      />
      {batch && (
        <div className="mt-3 mb-4 flex flex-col gap-1">
          <p className="text-xs text-[var(--brand-ink-soft)]">
            {batch.phase === "compressing"
              ? momentsCopy.phaseCompressing[locale]
              : batch.phase === "processing"
                ? momentsCopy.phaseProcessing[locale]
                : momentsCopy.phaseUploading[locale]}{" "}
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
        {uploading ? momentsCopy.uploading[locale] : momentsCopy.addPhotos[locale]}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesChange}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
