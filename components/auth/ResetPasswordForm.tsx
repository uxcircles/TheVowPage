"use client";

import { useActionState } from "react";
import { resetPassword } from "@/lib/actions/auth";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useToast } from "@/components/ui/Toast";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { resetPasswordCopy } from "@/lib/i18n/dictionaries/auth";

export function ResetPasswordForm() {
  const locale = useLocale();
  const showToast = useToast();
  const [state, formAction, pending] = useActionState(resetPassword, undefined);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    if (formData.get("password") !== formData.get("confirmPassword")) {
      e.preventDefault();
      showToast(resetPasswordCopy.mismatch[locale], "error");
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      {state?.error && <p className="text-sm text-[var(--brand-error)]">{state.error}</p>}
      <label className="flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]">
        {resetPasswordCopy.newPassword[locale]}
        <PasswordInput name="password" required minLength={6} autoComplete="new-password" />
      </label>
      <label className="flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]">
        {resetPasswordCopy.confirmPassword[locale]}
        <PasswordInput name="confirmPassword" required minLength={6} autoComplete="new-password" />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded bg-[var(--brand-gold)] px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? resetPasswordCopy.submitPending[locale] : resetPasswordCopy.submit[locale]}
      </button>
    </form>
  );
}
