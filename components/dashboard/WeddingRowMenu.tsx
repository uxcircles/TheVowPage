"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { deleteWedding } from "@/lib/actions/weddings";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { rowMenuCopy } from "@/lib/i18n/dictionaries/dashboard";

// deleteWedding() redirects to /dashboard on success, which Next.js
// implements by throwing a special error carrying this digest - our own
// catch below must let that one through instead of treating it as a
// genuine failure (see next/dist/client/components/redirect-error.js).
function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function WeddingRowMenu({ weddingId }: { weddingId: string }) {
  const locale = useLocale();
  const showToast = useToast();
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
    startTransition(async () => {
      try {
        await deleteWedding(weddingId);
      } catch (err) {
        if (isRedirectError(err)) throw err;
        showToast(rowMenuCopy.deleteFailed[locale], "error");
      }
    });
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
        aria-label={rowMenuCopy.moreActions[locale]}
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
            className="block w-full px-3 py-2 text-left text-sm text-[var(--brand-error)] hover:bg-[var(--brand-error)]/10 disabled:opacity-50"
          >
            {pending ? rowMenuCopy.deleting[locale] : rowMenuCopy.delete[locale]}
          </button>
        </div>
      )}
      {confirming && (
        <ConfirmDialog
          title={rowMenuCopy.confirmTitle[locale]}
          message={rowMenuCopy.confirmMessage[locale]}
          confirmLabel={rowMenuCopy.delete[locale]}
          danger
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
