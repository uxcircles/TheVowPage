"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { accountMenuCopy, signOutCopy } from "@/lib/i18n/dictionaries/dashboard";

export function AccountMenu({
  email,
  displayName,
  avatarUrl,
  hasGoogleLinked,
  hasPassword,
}: {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  /** Purely informational (see accountMenuCopy.googleLinked) - no "link
   * Google account" action, since Supabase already auto-links this same
   * account the first time its owner signs in with Google using this
   * same verified email. */
  hasGoogleLinked: boolean;
  /** Whether the account has an email/password identity at all - a
   * Google-only sign-up has never set one, so "change password" doesn't
   * make sense for them yet (see accountMenuCopy.setPassword). */
  hasPassword: boolean;
}) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const label = (displayName || email).trim();
  const initial = label.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={accountMenuCopy.menuAria[locale]}
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[var(--brand-line)] bg-[var(--brand-gold)]/10 text-sm font-medium text-[var(--brand-gold-dark)] transition-colors hover:border-[var(--brand-gold)]"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded border border-[var(--brand-line)] bg-white py-2 text-left shadow-lg">
          <div className="px-4 py-2">
            <p className="truncate text-sm font-medium text-foreground">{label}</p>
            <p className="truncate text-xs text-[var(--brand-ink-soft)]">{email}</p>
          </div>

          <div className="my-1 border-t border-[var(--brand-line)]" />

          <div className="px-4 py-2">
            <LanguageSwitcher locale={locale} />
          </div>

          <div className="my-1 border-t border-[var(--brand-line)]" />

          <Link
            href="/account/password"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-[var(--brand-ink-soft)] hover:bg-[var(--background)] hover:text-[var(--brand-gold)]"
          >
            {hasPassword ? accountMenuCopy.changePassword[locale] : accountMenuCopy.setPassword[locale]}
          </Link>

          {hasGoogleLinked && (
            <p className="px-4 py-2 text-sm text-[var(--brand-ink-soft)]">✓ {accountMenuCopy.googleLinked[locale]}</p>
          )}

          <div className="my-1 border-t border-[var(--brand-line)]" />

          <form action={signOut}>
            <button
              type="submit"
              className="block w-full px-4 py-2 text-left text-sm text-[var(--brand-ink-soft)] hover:bg-[var(--background)] hover:text-red-500"
            >
              {signOutCopy.signOut[locale]}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
