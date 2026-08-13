// Shared loading.tsx fallback for the 內容編輯/賓客名單/RSVP 回覆 tabs -
// each page does its own data fetch (photos, guests, rsvps) on top of the
// already-cached wedding lookup, so switching tabs still has a visible
// round-trip. This renders immediately while that's in flight, instead of
// the tab click looking like it did nothing.
export function EditorLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-label="載入中">
      <div className="skeleton-pulse h-24 rounded-lg border border-[var(--brand-line)] bg-[var(--brand-line)]/45" />
      <div className="skeleton-pulse h-40 rounded-lg border border-[var(--brand-line)] bg-[var(--brand-line)]/45" />
      <div className="skeleton-pulse h-32 rounded-lg border border-[var(--brand-line)] bg-[var(--brand-line)]/45" />
    </div>
  );
}
