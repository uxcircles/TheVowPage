"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWeddingPhoto } from "@/lib/actions/weddings";
import { uploadPhotoWithProgress } from "@/lib/uploadPhotoWithProgress";
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
  const [progress, setProgress] = useState<number | null>(null);
  const [deleting, startDeleteTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const pending = progress !== null || deleting;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProgress(0);
    const result = await uploadPhotoWithProgress(weddingId, kind, file, setProgress);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
    if (result.error) {
      showToast(result.error, "error");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[var(--brand-ink-soft)]">{label}</p>
      <div className="aspect-[4/5] overflow-hidden rounded border border-[var(--brand-line)] bg-[var(--cream-deep,#f1e9da)]">
        {photoUrl && <img src={photoUrl} alt={label} className="h-full w-full object-cover" />}
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
          {progress === null ? (photoUrl ? "更換" : "上傳") : progress < 100 ? `上傳中... ${progress}%` : "處理中..."}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={pending} />
        </label>
        {photoId && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startDeleteTransition(async () => {
                try {
                  await deleteWeddingPhoto(weddingId, photoId);
                } catch {
                  showToast("移除失敗，請稍後再試。", "error");
                }
              })
            }
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
