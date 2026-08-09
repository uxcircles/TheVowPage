"use client";

import { useRef, useTransition } from "react";
import { uploadWeddingPhoto, deleteWeddingPhoto, moveMomentPhoto } from "@/lib/actions/weddings";

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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {photos.map((photo, i) => (
          <div key={photo.id} className="flex flex-col gap-1.5">
            <div className="aspect-[4/5] overflow-hidden rounded border border-[var(--brand-line)]">
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="flex justify-between gap-1 text-xs text-[var(--brand-ink-soft)]">
              <button
                type="button"
                disabled={pending || i === 0}
                onClick={() => startTransition(() => moveMomentPhoto(weddingId, photo.id, "up"))}
                className="rounded border border-[var(--brand-line)] px-1.5 py-0.5 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={pending || i === photos.length - 1}
                onClick={() => startTransition(() => moveMomentPhoto(weddingId, photo.id, "down"))}
                className="rounded border border-[var(--brand-line)] px-1.5 py-0.5 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => deleteWeddingPhoto(weddingId, photo.id))}
                className="rounded border border-[var(--brand-line)] px-1.5 py-0.5 hover:border-red-400 hover:text-red-500"
              >
                移除
              </button>
            </div>
          </div>
        ))}
      </div>
      <label className="mt-4 inline-block cursor-pointer rounded border border-[var(--brand-line)] px-4 py-2 text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)]">
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
