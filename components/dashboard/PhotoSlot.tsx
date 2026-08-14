"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWeddingPhoto } from "@/lib/actions/weddings";
import { uploadPhotoWithProgress } from "@/lib/uploadPhotoWithProgress";
import { validatePhotoType, validatePhotoSize } from "@/lib/photoLimits";
import { compressImage } from "@/lib/compressImage";
import { useToast } from "@/components/ui/Toast";
import { TrashIcon } from "@/components/ui/TrashIcon";

export function PhotoSlot({
  weddingId,
  kind,
  label,
  photoId,
  photoUrl,
}: {
  weddingId: string;
  kind: string;
  label: string;
  photoId: string | null;
  photoUrl: string | null;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [deleting, startDeleteTransition] = useTransition();
  // Optimistic removal: hide the photo the instant delete is clicked rather
  // than waiting for the round trip (storage remove + DB delete + refresh)
  // to complete - restored on failure. photoId/photoUrl are server-derived
  // props, so this local override is what actually makes the click feel
  // instant.
  const [removed, setRemoved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPhoto = Boolean(photoUrl) && !removed;
  const currentPhotoId = removed ? null : photoId;
  const pending = compressing || progress !== null || deleting;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const typeError = validatePhotoType(file);
    if (typeError) {
      showToast(typeError, "error");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setCompressing(true);
    const compressed = await compressImage(file);
    setCompressing(false);

    const sizeError = validatePhotoSize(compressed);
    if (sizeError) {
      showToast(sizeError, "error");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setProgress(0);
    const result = await uploadPhotoWithProgress(weddingId, kind, compressed, setProgress);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
    if (result.error) {
      showToast(result.error, "error");
      return;
    }
    setRemoved(false);
    router.refresh();
  }

  function handleDelete() {
    if (!currentPhotoId) return;
    const idToDelete = currentPhotoId;
    setRemoved(true);
    startDeleteTransition(async () => {
      try {
        await deleteWeddingPhoto(weddingId, idToDelete);
      } catch {
        setRemoved(false);
        showToast("移除失敗，請稍後再試。", "error");
      }
    });
  }

  const buttonLabel = compressing
    ? "壓縮中..."
    : progress === null
      ? hasPhoto
        ? "更換"
        : "上傳"
      : progress < 100
        ? `上傳中... ${progress}%`
        : "處理中...";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[var(--brand-ink-soft)]">{label}</p>
      <div className="aspect-[4/5] overflow-hidden rounded border border-[var(--brand-line)] bg-[var(--cream-deep,#f1e9da)]">
        {hasPhoto && <img src={photoUrl!} alt={label} className="h-full w-full object-cover" />}
      </div>
      {progress !== null && (
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--brand-line)]/40">
          {progress < 100 ? (
            <div
              className="h-full rounded-full bg-[var(--brand-gold)] transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          ) : (
            <div className="upload-indeterminate h-full rounded-full" />
          )}
        </div>
      )}
      <div className="flex gap-2">
        <label className="flex-1 cursor-pointer rounded border border-[var(--brand-line)] px-3 py-1.5 text-center text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)]">
          {buttonLabel}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={pending} />
        </label>
        {currentPhotoId && (
          <button
            type="button"
            disabled={pending}
            onClick={handleDelete}
            aria-label="移除"
            className="rounded border border-[var(--brand-line)] px-3 py-1.5 text-[var(--brand-ink-soft)] hover:border-red-400 hover:text-red-500"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
