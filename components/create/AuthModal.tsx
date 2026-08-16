"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { translateAuthError } from "@/lib/authErrors";
import { useToast } from "@/components/ui/Toast";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { authCopy, authModalCopy } from "@/lib/i18n/dictionaries/auth";
import { footerCopy } from "@/lib/i18n/dictionaries/common";
import type { User } from "@supabase/supabase-js";

export function AuthModal({
  onClose,
  onAuthenticated,
}: {
  onClose: () => void;
  onAuthenticated: (user: User) => void;
}) {
  const locale = useLocale();
  const showToast = useToast();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) {
        showToast(translateAuthError(error.message, locale), "error");
        setPending(false);
        return;
      }
      if (!data.session) {
        showToast(authModalCopy.confirmEmailFirst[locale], "error");
        setPending(false);
        return;
      }
      if (data.user) onAuthenticated(data.user);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showToast(translateAuthError(error.message, locale), "error");
        setPending(false);
        return;
      }
      if (data.user) onAuthenticated(data.user);
    }
    setPending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-[var(--brand-gold)]">
            {mode === "signup" ? authModalCopy.titleSignup[locale] : authModalCopy.titleLogin[locale]}
          </h2>
          <button type="button" onClick={onClose} className="text-[var(--brand-ink-soft)]">
            ✕
          </button>
        </div>
        <p className="mb-4 text-sm text-[var(--brand-ink-soft)]">
          {mode === "signup" ? authModalCopy.saveHintSignup[locale] : authModalCopy.saveHintLogin[locale]}
        </p>

        {/* Google is a full-page redirect (Google -> /auth/callback ->
            back here), unlike the form below which authenticates in place
            and calls onAuthenticated() directly - so it can't share that
            callback. DraftEditor instead detects the `resume=1` it's
            redirected back with and finishes the save itself. */}
        <GoogleAuthButton next="/create?resume=1" />
        <div className="my-4 flex items-center gap-3 text-xs text-[var(--brand-ink-soft)]">
          <span className="h-px flex-1 bg-[var(--brand-line)]" />
          {authCopy.or[locale]}
          <span className="h-px flex-1 bg-[var(--brand-line)]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <label className="flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]">
              {authCopy.yourName[locale]}
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="rounded border border-[var(--brand-line)] px-3 py-2 text-foreground"
              />
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]">
            {authCopy.email[locale]}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-[var(--brand-line)] px-3 py-2 text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[var(--brand-ink-soft)]">
            {authCopy.password[locale]}
            <PasswordInput required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="mt-1 rounded bg-[var(--brand-gold)] px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending
              ? authModalCopy.submitPending[locale]
              : mode === "signup"
                ? authModalCopy.submitSignup[locale]
                : authModalCopy.submitLogin[locale]}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          className="mt-4 w-full text-center text-sm text-[var(--brand-ink-soft)] underline"
        >
          {mode === "signup" ? authModalCopy.switchToLogin[locale] : authModalCopy.switchToSignup[locale]}
        </button>
        <p className="mt-4 text-center text-xs text-[var(--brand-ink-soft)]">
          {authCopy.agreePrefix[locale]}{" "}
          <Link href="/terms" target="_blank" className="underline hover:text-[var(--brand-gold)]">
            {footerCopy.terms[locale]}
          </Link>{" "}
          {authCopy.and[locale]}{" "}
          <Link href="/privacy" target="_blank" className="underline hover:text-[var(--brand-gold)]">
            {footerCopy.privacy[locale]}
          </Link>
          {locale === "en" ? "." : "。"}
        </p>
      </div>
    </div>
  );
}
