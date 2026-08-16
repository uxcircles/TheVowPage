"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { confirmDialogCopy } from "@/lib/i18n/dictionaries/dashboard";

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const locale = useLocale();
  const resolvedConfirmLabel = confirmLabel ?? confirmDialogCopy.confirm[locale];
  const resolvedCancelLabel = cancelLabel ?? confirmDialogCopy.cancel[locale];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded bg-white p-6 shadow-xl">
        <h2 className="text-lg font-medium text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-[var(--brand-line)] px-4 py-2 text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)]"
          >
            {resolvedCancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 ${
              danger ? "bg-red-500" : "bg-[var(--brand-gold)]"
            }`}
          >
            {resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
