"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { editorCardCopy } from "@/lib/i18n/dictionaries/dashboard";

export function HiddenSectionHint() {
  const locale = useLocale();
  return (
    <p className="text-sm text-[var(--brand-ink-soft)]">
      {editorCardCopy.hiddenSectionHint[locale]}
    </p>
  );
}

export function EditorCard({
  title,
  action,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[var(--brand-line)] bg-white p-5 shadow-sm">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="text-sm font-medium text-foreground">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
