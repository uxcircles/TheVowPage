import type { Locale } from "@/lib/i18n/shared";

// Segmented control (not a single flip button) so both languages are
// visible at once along with which one's currently showing - the same
// "中/EN" pairing used for the bilingual form fields, but as an actual
// toggle here. Only meant to be rendered while previewing a wedding that
// actually has bilingual content turned on (callers gate on
// bilingualEnabled) - overrides the preview's own LocaleProvider, not the
// admin's real site-locale cookie, so switching it never touches the
// dashboard's own language.
export function PreviewLocaleToggle({
  value,
  onChange,
  className = "",
}: {
  value: Locale;
  onChange: (locale: Locale) => void;
  className?: string;
}) {
  return (
    <div className={`inline-flex overflow-hidden rounded-full bg-white shadow-lg ${className}`}>
      <button
        type="button"
        onClick={() => onChange("zh")}
        aria-pressed={value === "zh"}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          value === "zh" ? "bg-[var(--brand-gold)] text-white" : "text-[var(--brand-ink-soft)] hover:bg-[var(--background)]"
        }`}
      >
        中
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        aria-pressed={value === "en"}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          value === "en" ? "bg-[var(--brand-gold)] text-white" : "text-[var(--brand-ink-soft)] hover:bg-[var(--background)]"
        }`}
      >
        EN
      </button>
    </div>
  );
}
