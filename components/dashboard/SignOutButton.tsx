"use client";

import { useFormStatus } from "react-dom";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { signOutCopy } from "@/lib/i18n/dictionaries/dashboard";

// Must be a child of the <form>, not the component rendering it -
// useFormStatus only sees an ancestor form's pending state.
export function SignOutButton() {
  const locale = useLocale();
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="text-sm text-[var(--brand-ink-soft)] underline disabled:opacity-60">
      {pending ? signOutCopy.signingOut[locale] : signOutCopy.signOut[locale]}
    </button>
  );
}
