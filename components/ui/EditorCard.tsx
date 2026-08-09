export function HiddenSectionHint() {
  return (
    <p className="text-sm text-[var(--brand-ink-soft)]">
      這個區塊目前不會顯示在喜帖上。開啟「顯示」即可編輯內容。
    </p>
  );
}

export function EditorCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[var(--brand-line)] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
