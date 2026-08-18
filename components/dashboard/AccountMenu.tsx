"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { LOCALE_LABELS, useLocaleSwitch } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { accountMenuCopy, signOutCopy } from "@/lib/i18n/dictionaries/dashboard";
import { CheckIcon, ChevronDownIcon, GlobeIcon, LockIcon, SignOutIcon } from "@/components/ui/AccountMenuIcons";

export function AccountMenu({
  email,
  displayName,
  avatarUrl,
  hasPassword,
}: {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  /** Whether the account has an email/password identity at all - a
   * Google-only sign-up has never set one, so "change password" doesn't
   * make sense for them yet (see accountMenuCopy.setPassword). */
  hasPassword: boolean;
}) {
  const locale = useLocale();
  const setLocale = useLocaleSwitch();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setLangOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setLangOpen(false);
      }
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
        <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-xl bg-white py-2 text-left shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">{label}</p>
            <p className="truncate text-xs text-[var(--brand-ink-soft)]">{email}</p>
          </div>

          <div className="mx-4 border-t border-[var(--brand-line)]/70" />

          <div className="py-1">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              aria-expanded={langOpen}
              className="flex w-full items-center justify-between px-4 py-2 text-sm text-[var(--brand-ink-soft)] hover:bg-[var(--background)] hover:text-[var(--brand-gold)]"
            >
              <span className="flex items-center gap-2 leading-none">
                <GlobeIcon className="h-4 w-4 shrink-0" />
                <span>{accountMenuCopy.language[locale]}</span>
              </span>
              <span className="flex items-center gap-1 text-xs leading-none">
                <span>{LOCALE_LABELS[locale]}</span>
                <ChevronDownIcon className={`h-3.5 w-3.5 shrink-0 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </span>
            </button>
            {langOpen && (
              <div className="mx-4 mt-1 overflow-hidden rounded-lg bg-[var(--background)]">
                {(["zh", "en"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setLangOpen(false);
                      if (code !== locale) setLocale(code);
                    }}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-sm leading-none text-[var(--brand-ink-soft)] hover:text-[var(--brand-gold)]"
                  >
                    <span>{LOCALE_LABELS[code]}</span>
                    {locale === code && <CheckIcon className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" />}
                  </button>
                ))}
              </div>
            )}

            <Link
              href="/account/password"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm leading-none text-[var(--brand-ink-soft)] hover:bg-[var(--background)] hover:text-[var(--brand-gold)]"
            >
              <LockIcon className="h-4 w-4 shrink-0" />
              <span>{hasPassword ? accountMenuCopy.changePassword[locale] : accountMenuCopy.setPassword[locale]}</span>
            </Link>
          </div>

          <div className="mx-4 border-t border-[var(--brand-line)]/70" />

          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm leading-none text-[var(--brand-ink-soft)] hover:bg-red-50 hover:text-red-500"
            >
              <SignOutIcon className="h-4 w-4 shrink-0" />
              <span>{signOutCopy.signOut[locale]}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
