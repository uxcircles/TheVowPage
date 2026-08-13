// Fallback while /dashboard's own weddings list query is in flight -
// e.g. clicking "← 返回" from inside a wedding, which previously had no
// visual feedback until the list finished loading.
export default function Loading() {
  return (
    <div className="py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">我的喜帖</h1>
        <div className="h-9 w-28 animate-pulse rounded bg-[var(--brand-line)]/30" />
      </div>
      <div className="mt-8 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[72px] animate-pulse rounded border border-[var(--brand-line)] bg-[var(--brand-line)]/20"
          />
        ))}
      </div>
    </div>
  );
}
