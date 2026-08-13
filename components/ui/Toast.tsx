"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ToastType = "error" | "success";
type ToastState = { id: number; message: string; type: ToastType } | null;

const ToastContext = createContext<((message: string, type: ToastType) => void) | null>(null);

// Mounted once at the root layout (top-of-viewport, above everything
// including sticky headers) so it never has to reason about whatever
// fixed bottom bar a given page may or may not have showing.
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const idRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const id = ++idRef.current;
    setToast({ id, message, type });
    // Errors stay up a bit longer than success - there's more to read and
    // it's worth the user actually registering it went wrong.
    timeoutRef.current = setTimeout(
      () => setToast((t) => (t?.id === id ? null : t)),
      type === "error" ? 4000 : 2200,
    );
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed left-1/2 top-4 z-[2000] -translate-x-1/2 rounded-lg px-4 py-2.5 text-center text-sm text-white shadow-lg ${
            toast.type === "error" ? "bg-[var(--brand-error)]" : "bg-[var(--brand-success)]"
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error("useToast must be used within ToastProvider");
  return showToast;
}

/** For useActionState-driven forms: fires a toast once when the action
 * transitions from pending to settled with an error, rather than on every
 * render where state.error happens to be truthy - state.error is "sticky"
 * (stays set until the next submit), so watching it directly would refire
 * the same toast on unrelated re-renders. */
export function useActionErrorToast(pending: boolean, error: string | undefined) {
  const showToast = useToast();
  const wasPendingRef = useRef(false);
  useEffect(() => {
    const justFinished = wasPendingRef.current && !pending;
    wasPendingRef.current = pending;
    if (justFinished && error) showToast(error, "error");
  }, [pending, error, showToast]);
}
