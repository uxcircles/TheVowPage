"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWeddingPhoto } from "@/lib/actions/weddings";
import { uploadPhotoWithProgress } from "@/lib/uploadPhotoWithProgress";
import { validatePhotoType, validatePhotoSize } from "@/lib/photoLimits";
import { compressImage } from "@/lib/compressImage";
import { useToast } from "@/components/ui/Toast";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { photoSlotCopy, chromeCopy } from "@/lib/i18n/dictionaries/dashboard";

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
  const locale = useLocale();
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
  // Optimistic replace: the compressed file the user just picked, shown
  // immediately instead of waiting for upload + router.refresh()'s server
  // round trip - without this, the progress bar clears the instant the
  // upload finishes but the <img> (driven by the photoUrl prop, not local
  // state) keeps showing the old photo for a few more seconds until the
  // refreshed page data arrives, which reads as broken/unresponsive.
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayUrl = localPreviewUrl ?? photoUrl;
  const hasPhoto = Boolean(displayUrl) && !removed;
  const currentPhotoId = removed ? null : photoId;
  const pending = compressing || progress !== null || deleting;

  // Once the server-confirmed photoUrl prop catches up (after
  // router.refresh() resolves), hand off from the optimistic local preview
  // to it and release the object URL - seamless since it's the same image.
  useEffect(() => {
    if (!localPreviewUrl) return;
    if (photoUrl && photoUrl !== localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUrl]);

  // Revoke on unmount too, in case the user navigates away before the
  // refresh above ever lands.
  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // Show the picked photo right away rather than waiting on the upload -
    // it's the same file being sent, so there's no risk of the preview
    // looking different from what actually lands.
    const objectUrl = URL.createObjectURL(compressed);
    setLocalPreviewUrl(objectUrl);

    setProgress(0);
    const result = await uploadPhotoWithProgress(weddingId, kind, compressed, setProgress);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
    if (result.error) {
      URL.revokeObjectURL(objectUrl);
      setLocalPreviewUrl(null);
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
        showToast(photoSlotCopy.removeFailed[locale], "error");
      }
    });
  }

  const buttonLabel = compressing
    ? photoSlotCopy.compressing[locale]
    : progress === null
      ? hasPhoto
        ? photoSlotCopy.change[locale]
        : photoSlotCopy.upload[locale]
      : progress < 100
        ? photoSlotCopy.uploadingPercent[locale](progress)
        : chromeCopy.processing[locale];

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[var(--brand-ink-soft)]">{label}</p>
      <div className="aspect-[4/5] overflow-hidden rounded border border-[var(--brand-line)] bg-[var(--cream-deep,#f1e9da)]">
        {hasPhoto && <img src={displayUrl!} alt={label} className="h-full w-full object-cover" />}
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
            aria-label={photoSlotCopy.removeAria[locale]}
            className="rounded border border-[var(--brand-line)] px-3 py-1.5 text-[var(--brand-ink-soft)] hover:border-red-400 hover:text-red-500"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
