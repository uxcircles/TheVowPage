"use client";

import { useState } from "react";
import { FORM_ID } from "@/components/dashboard/WeddingEditForm";

const DOMAIN_PREFIX = "thevowpage.com/w/";

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 15H5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 5 3h9A1.5 1.5 0 0 1 15.5 4.5V6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l6 6L20 6" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 3h6v6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 12L19 3" />
    </svg>
  );
}

/** The 網址代稱 card's URL row: a domain-prefixed input (still submits
 * through WeddingEditForm's save action via form={FORM_ID}), plus copy/open
 * buttons for the *currently saved* slug - not the input's live-edited
 * value, since an unsaved edit isn't the real public URL yet. */
export function SlugField({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const publicUrl = `https://${DOMAIN_PREFIX}${slug}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied or unavailable - the URL is still
      // visible and manually selectable, so this just silently no-ops.
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="flex min-w-0 items-stretch overflow-hidden rounded border border-[var(--brand-line)] bg-white sm:flex-1">
          <span className="flex items-center whitespace-nowrap bg-[var(--brand-line)]/15 pl-3 pr-1 text-sm text-[var(--brand-ink-soft)]">
            {DOMAIN_PREFIX}
          </span>
          <input
            name="slug"
            defaultValue={slug}
            required
            form={FORM_ID}
            className="min-w-0 flex-1 py-2 pr-3 text-foreground outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded border border-[var(--brand-line)] px-3 py-2 text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)] sm:flex-none"
          >
            {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
            {copied ? "已複製" : "複製"}
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener"
            className="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded border border-[var(--brand-line)] px-3 py-2 text-sm text-[var(--brand-ink-soft)] hover:border-[var(--brand-gold)] sm:flex-none"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            前往
          </a>
        </div>
      </div>
      <p className="text-sm text-[var(--brand-ink-soft)]">
        這將是賓客訪問您喜帖的專屬連結，您可以隨時自訂後方的網址名稱
      </p>
    </div>
  );
}
