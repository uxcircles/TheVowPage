"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type Dispatch,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { setWeddingStatus } from "@/lib/actions/weddings";
import { createCheckoutSession } from "@/lib/actions/billing";
import { ClassicTemplate } from "@/components/templates/classic/ClassicTemplate";
import type { ClassicTemplateData } from "@/components/templates/classic/types";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type SaveBarState = {
  formId: string;
  pending: boolean;
  error?: string;
  success?: boolean;
} | null;

type PreviewSnapshotFn = (() => ClassicTemplateData) | null;

const EditChromeContext = createContext<{
  saveBar: SaveBarState;
  setSaveBar: (s: SaveBarState) => void;
  setPreviewSnapshot: Dispatch<SetStateAction<PreviewSnapshotFn>>;
  setDirty: (d: boolean) => void;
} | null>(null);

/** Lets a form deep in the tree (e.g. WeddingEditForm) publish its
 * save/pending/error state up into the shared bottom action bar, so the
 * "儲存" button can live in the same bar as 預覽/發布 instead of the form
 * rendering its own separate fixed bar. Registers on mount, clears on
 * unmount (so switching tabs away from the form doesn't leave a stale
 * 儲存 button behind). */
export function useEditSaveBar(
  state: Omit<NonNullable<SaveBarState>, "formId"> & { formId: string },
) {
  // Depend on setSaveBar itself (a stable useState setter, never changes
  // identity), not the wrapping context object - that object's identity
  // changes whenever saveBar updates, which would otherwise re-fire this
  // effect on every registration and create a render loop.
  const setSaveBar = useContext(EditChromeContext)?.setSaveBar;
  const { formId, pending, error, success } = state;
  useEffect(() => {
    setSaveBar?.({ formId, pending, error, success });
    return () => setSaveBar?.(null);
  }, [setSaveBar, formId, pending, error, success]);
}

/** Lets the edit form register a function that snapshots its current
 * (possibly unsaved) field values into ClassicTemplateData, so "預覽喜帖"
 * can show a live draft preview - matching /create's behavior - instead of
 * only ever showing the last-saved public page. Only registered while the
 * 內容編輯 tab is mounted; other tabs have nothing to preview, so the
 * button (and the whole bottom bar, once that's all it held) just doesn't
 * render there. */
export function useEditPreview(getSnapshot: () => ClassicTemplateData) {
  const setPreviewSnapshot = useContext(EditChromeContext)?.setPreviewSnapshot;
  // Registration only needs to happen once (see useEditSaveBar above for why
  // depending on setSaveBar/setPreviewSnapshot itself avoids re-registering
  // every render) - but getSnapshot is a fresh closure every render, closing
  // over the form's latest field values. Keeping it in a ref and having the
  // registered wrapper read through the ref means the effect can register
  // just once while still always calling the *current* snapshot logic.
  const getSnapshotRef = useRef(getSnapshot);
  useEffect(() => {
    getSnapshotRef.current = getSnapshot;
  });

  useEffect(() => {
    const stableSnapshot = () => getSnapshotRef.current();
    setPreviewSnapshot?.(() => stableSnapshot);
    return () => setPreviewSnapshot?.(null);
  }, [setPreviewSnapshot]);
}

/** Raw access to the shared dirty flag, so the chrome can warn before a tab
 * switch, the "← 返回" link, or a browser close/refresh/back throws away
 * unsaved changes. A plain setter rather than a single "report my dirty
 * state" hook because the fields that need to mark it live in more than
 * one component: most of the form's own inputs (WeddingEditForm, via a
 * single delegated input/change listener) but also the theme/seal/moments
 * pickers, which render as sibling EditorCards *outside* the actual
 * &lt;form&gt; DOM subtree (they only associate via the `form=` attribute
 * for submission), so a listener on the form itself never sees their
 * changes - each caller flips this on directly instead. */
export function useSetDirty() {
  return useContext(EditChromeContext)?.setDirty ?? (() => {});
}

export function WeddingChrome({
  weddingId,
  groomName,
  brideName,
  groomLabel,
  brideLabel,
  status,
  plan,
  expiresAt,
  tabs,
  children,
}: {
  weddingId: string;
  groomName: string;
  brideName: string;
  groomLabel: string;
  brideLabel: string;
  status: string;
  plan: string;
  expiresAt: string | null;
  tabs: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const showToast = useToast();
  const [saveBar, setSaveBar] = useState<SaveBarState>(null);
  const [previewSnapshot, setPreviewSnapshot] =
    useState<PreviewSnapshotFn>(null);
  const [dirty, setDirty] = useState(false);
  const contextValue = useMemo(
    () => ({ saveBar, setSaveBar, setPreviewSnapshot, setDirty }),
    [saveBar],
  );
  const [previewData, setPreviewData] = useState<ClassicTemplateData | null>(
    null,
  );
  const [isPublished, setIsPublished] = useState(status === "published");
  const [publishPending, startPublishTransition] = useTransition();
  const isPaid = plan !== "draft";
  const expiryDate = expiresAt ? new Date(expiresAt) : null;
  const isExpired = Boolean(expiryDate && expiryDate < new Date());
  const expiryLabel = expiryDate
    ? `${expiryDate.getFullYear()}/${String(expiryDate.getMonth() + 1).padStart(2, "0")}/${String(
        expiryDate.getDate()
      ).padStart(2, "0")}`
    : null;
  // Guests and RSVP tabs register neither, so there's nothing for this bar
  // to show - both hooks below register their state as null on unmount,
  // so switching tabs clears these correctly.
  const showBottomBar = Boolean(saveBar || previewSnapshot);

  // Closing the tab, refreshing, or typing a new URL bypasses React/Next
  // entirely - only the browser's own beforeunload prompt can catch that.
  // Its text is browser-controlled (can't be customized in modern
  // browsers), which is a platform limitation, not a bug.
  useEffect(() => {
    if (!dirty) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  // In-app navigation (the "← 返回" link, the tab bar) is client-side
  // routing, which beforeunload never sees - guard it separately so
  // switching tabs with unsaved text doesn't silently discard it. Uses the
  // same ConfirmDialog as deleting a draft wedding, not the native
  // window.confirm() browser dialog: this navigation is fully within our
  // own control (unlike beforeunload's dialog, which the browser owns and
  // won't let a page restyle), so there's no reason to fall back to the
  // plain OS box here when it'd look out of place next to the rest of the
  // dashboard's styling.
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  function guardNavigation(e: React.MouseEvent, href: string) {
    if (!dirty) return;
    e.preventDefault();
    setPendingHref(href);
  }

  // Fires a toast on the pending->not-pending edge (not just whenever
  // success/error is truthy) since saveBar.success/error stays set until
  // the next submit - without edge detection this would show every time
  // any part of the chrome re-renders, not just right after a save.
  const wasPendingRef = useRef(false);
  useEffect(() => {
    const isPending = Boolean(saveBar?.pending);
    const justFinished = wasPendingRef.current && !isPending;
    wasPendingRef.current = isPending;
    if (!justFinished) return;
    if (saveBar?.success) showToast("已儲存", "success");
    else if (saveBar?.error) showToast(saveBar.error, "error");
  }, [saveBar?.pending, saveBar?.success, saveBar?.error, showToast]);

  function togglePublish() {
    // Turning it on for the first time on a still-draft (unpaid) plan sends
    // the couple to Stripe Checkout instead of publishing directly; the
    // webhook flips `plan` once payment succeeds, and this button becomes a
    // normal publish toggle from then on.
    if (!isPublished && !isPaid) {
      startPublishTransition(async () => {
        const result = await createCheckoutSession(weddingId);
        if ("error" in result) {
          showToast(result.error, "error");
        } else {
          window.location.href = result.url;
        }
      });
      return;
    }
    const next = isPublished ? "draft" : "published";
    startPublishTransition(async () => {
      try {
        await setWeddingStatus(weddingId, next);
        setIsPublished(next === "published");
      } catch {
        showToast("操作失敗，請稍後再試。", "error");
      }
    });
  }

  // Only ever called from the preview button below, which is itself only
  // rendered when previewSnapshot is registered (the 內容編輯 tab) - guests
  // and RSVP tabs have nothing to preview, so the button (and once that's
  // the only thing left, the whole bottom bar) just doesn't render there.
  function handlePreviewClick() {
    if (!previewSnapshot) return;
    setPreviewData(previewSnapshot());
    // The preview reuses the real window scroll (not a new scroll
    // container), so without this it opens wherever the editor form
    // happened to be scrolled to instead of the envelope at the top.
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <EditChromeContext.Provider value={contextValue}>
      {previewData &&
        createPortal(
          // Portaled straight to <body>, escaping the dashboard layout's own
          // <header> and its max-w-4xl <main> - without this the preview
          // rendered nested inside them, so the outer "← 返回" header stayed
          // visible above it and the theme background was capped at that
          // narrow content width instead of the full page. Positioned
          // (not fixed) so it still scrolls with the real window, which
          // ClassicTemplate's scroll-driven reveals depend on.
          <div className="absolute left-0 top-0 z-[1000] w-screen">
            <button
              type="button"
              onClick={() => setPreviewData(null)}
              className="fixed right-4 top-4 z-[1001] rounded-full bg-white px-4 py-2 text-sm shadow-lg hover:opacity-90"
            >
              ✕ 返回編輯
            </button>
            <ClassicTemplate data={previewData} />
          </div>,
          document.body,
        )}
      {/* The editor stays mounted (just hidden) during preview, rather than
          being unmounted/swapped like /create's preview - most fields here
          are uncontrolled inputs holding their live-typed value only in the
          DOM, so unmounting would silently wipe out anything typed but not
          yet saved. display:none also removes it from layout entirely, so
          the preview above still gets the real window scroll it needs for
          ClassicTemplate's scroll-driven animations. */}
      <div className={previewData ? "hidden" : ""}>
        <div className="sticky top-0 z-30 -mx-6 border-b border-[var(--brand-line)] bg-[var(--background)]/95 px-6 backdrop-blur">
          <div className="mx-auto max-w-4xl pt-3">
            <Link
              href="/dashboard"
              onClick={(e) => guardNavigation(e, "/dashboard")}
              className="text-sm text-[var(--brand-gold)] hover:underline"
            >
              ← 返回
            </Link>
            <h1 className="mt-1.5 text-2xl font-medium text-foreground">
              {groomName || groomLabel} ＆ {brideName || brideLabel}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isPublished ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <span className={isPublished ? "text-green-700" : "text-[var(--brand-ink-soft)]"}>
                  {isPublished ? "已發布" : "草稿"}
                </span>
              </span>
              {expiryLabel && (
                <>
                  <span className="text-[var(--brand-line)]">·</span>
                  <span className={isExpired ? "text-[var(--brand-error)]" : "text-[var(--brand-ink-soft)]"}>
                    {isExpired ? "已到期" : `有效期限至 ${expiryLabel}`}
                  </span>
                </>
              )}
            </div>
            <nav className="mt-5 flex gap-6">
              {tabs.map((tab) => {
                const active = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={(e) => guardNavigation(e, tab.href)}
                    className={`border-b-2 pb-2 text-sm transition-colors ${
                      active
                        ? "border-[var(--brand-gold)] font-medium text-foreground"
                        : "border-transparent text-[var(--brand-ink-soft)] hover:text-[var(--brand-gold)]"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className={`mx-auto max-w-4xl pt-8 ${showBottomBar ? "pb-28" : "pb-8"}`}>
          {children}
        </div>

        {showBottomBar && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--brand-line)] bg-[var(--background)]/95 backdrop-blur">
            <div className="mx-auto flex max-w-4xl flex-col items-end gap-1 px-6 py-3">
              {!isPaid && !isPublished && (
                <p className="text-xs text-[var(--brand-ink-soft)]">
                  🛡️ 14 天安心退款保證：賓客尚未開始回覆前，可全額退款
                </p>
              )}
              <div className="flex items-center justify-end gap-3">
                {saveBar && (
                  <button
                    type="submit"
                    form={saveBar.formId}
                    disabled={saveBar.pending}
                    className={
                      isPublished
                        ? "rounded bg-[var(--brand-gold)] px-6 py-2.5 text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                        : "rounded border border-[var(--brand-line)] px-6 py-2.5 text-[var(--brand-ink-soft)] transition-colors hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)] disabled:opacity-60"
                    }
                  >
                    {saveBar.pending ? "儲存中..." : "儲存"}
                  </button>
                )}
                {previewSnapshot && (
                  <button
                    type="button"
                    onClick={handlePreviewClick}
                    className="rounded border border-[var(--brand-line)] px-6 py-2.5 text-[var(--brand-ink-soft)] transition-colors hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]"
                  >
                    預覽
                  </button>
                )}
                <button
                  type="button"
                  disabled={publishPending}
                  onClick={togglePublish}
                  className={
                    isPublished
                      ? "rounded border border-[var(--brand-line)] px-6 py-2.5 text-[var(--brand-ink-soft)] transition-colors hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)] disabled:opacity-60"
                      : "rounded bg-[var(--brand-gold)] px-6 py-2.5 text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  }
                >
                  {publishPending
                    ? "處理中..."
                    : isPublished
                      ? "取消發布"
                      : isPaid
                        ? "發布喜帖"
                        : "付費解鎖發布"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {pendingHref && (
        <ConfirmDialog
          title="尚未儲存"
          message="您有尚未儲存的變更，確定要離開嗎？"
          confirmLabel="離開"
          danger
          onConfirm={() => {
            const href = pendingHref;
            setPendingHref(null);
            setDirty(false);
            router.push(href);
          }}
          onCancel={() => setPendingHref(null)}
        />
      )}
    </EditChromeContext.Provider>
  );
}
