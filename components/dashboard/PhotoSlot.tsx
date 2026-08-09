"use client";

import { useRef, useTransition } from "react";
import { uploadWeddingPhoto, deleteWeddingPhoto } from "@/lib/actions/weddings";

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
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      await uploadWeddingPhoto(weddingId, kind, formData);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[var(--brand-ink-soft)]">{label}</p>
      <div className="aspect-[4/5] overflow-hidden rounded border border-[var(--brand-line)] bg-[var(--cream-deep,#f1e9da)]">
        {photoUrl && <img src={photoUrl} alt={label} className="h-full w-full object-cover" />}
      </div>
      <div className="flex gap-2">
        <label className="flex-1 cursor-pointer rounded border border-[var(--brand-line)] px-3 py-1.5 text-center text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)]">
          {pending ? "上傳中..." : photoUrl ? "更換" : "上傳"}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={pending} />
        </label>
        {photoId && (
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => deleteWeddingPhoto(weddingId, photoId))}
            className="rounded border border-[var(--brand-line)] px-3 py-1.5 text-sm text-[var(--brand-ink-soft)] hover:border-red-400 hover:text-red-500"
          >
            移除
          </button>
        )}
      </div>
    </div>
  );
}
