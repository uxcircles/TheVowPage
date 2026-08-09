"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { deleteWedding } from "@/lib/actions/weddings";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function WeddingRowMenu({ weddingId }: { weddingId: string }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function handleConfirmDelete() {
    setConfirming(false);
    startTransition(() => deleteWedding(weddingId));
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label="更多操作"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-[var(--brand-ink-soft)] hover:bg-black/5"
      >
        ⋮
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-1 w-32 overflow-hidden rounded-md border border-[var(--brand-line)] bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              setConfirming(true);
            }}
            className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {pending ? "刪除中..." : "刪除"}
          </button>
        </div>
      )}
      {confirming && (
        <ConfirmDialog
          title="刪除草稿"
          message="確定要刪除這份草稿嗎？刪除後無法復原。"
          confirmLabel="刪除"
          danger
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
