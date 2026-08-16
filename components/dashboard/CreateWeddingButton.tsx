"use client";

import { useFormStatus } from "react-dom";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { createWeddingCopy } from "@/lib/i18n/dictionaries/dashboard";

// Must be a child of the <form> (not the component that renders the
// <form> itself) - useFormStatus only sees the pending state of an
// ancestor form. createWedding always redirects on success and has no
// error path, so there's nothing to lift up here besides pending/idle.
export function CreateWeddingButton() {
  const locale = useLocale();
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-[var(--brand-gold)] px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? createWeddingCopy.creating[locale] : createWeddingCopy.createNew[locale]}
    </button>
  );
}
