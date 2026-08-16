"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { authCopy } from "@/lib/i18n/dictionaries/auth";

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.9 4.7A10.4 10.4 0 0 1 12 4.5c6 0 9.5 7.5 9.5 7.5a15 15 0 0 1-2.9 3.9M6.6 6.6C4 8.3 2.5 12 2.5 12s3.5 7.5 9.5 7.5a9 9 0 0 0 4.4-1.2"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 14.1a3 3 0 0 0 4.2-4.2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    </svg>
  );
}

/** Password input with a click-to-toggle show/hide eye button. Fixed
 * styling (not a className prop) so login/signup/AuthModal's password
 * fields all look identical - AuthModal's was missing bg-white before this
 * existed, an inconsistency this incidentally fixes. */
export function PasswordInput({
  name,
  required,
  minLength,
  value,
  onChange,
  autoComplete,
}: {
  name?: string;
  required?: boolean;
  minLength?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** "current-password" for login, "new-password" for signup - without
   * this, iOS Safari's QuickType bar can show a suggestion that doesn't
   * actually fill in when tapped. */
  autoComplete?: string;
}) {
  const locale = useLocale();
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        name={name}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="w-full rounded border border-[var(--brand-line)] bg-white py-2 pl-3 pr-10 text-foreground"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? authCopy.hidePassword[locale] : authCopy.showPassword[locale]}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--brand-ink-soft)] hover:text-[var(--brand-gold)]"
      >
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}
