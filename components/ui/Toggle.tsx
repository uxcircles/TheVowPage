"use client";

/** Controlled pill switch for local (non-form) React state. */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center justify-between gap-3">
      {label && <span className="text-sm text-[var(--brand-ink-soft)]">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[var(--brand-gold)]" : "bg-[var(--brand-line)]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

/** Uncontrolled pill switch backed by a real checkbox input, so it submits
 * as part of a plain <form> (server actions read it via
 * `formData.get(name) === "on"`). */
export function ToggleField({
  name,
  defaultChecked,
  label,
}: {
  name: string;
  defaultChecked: boolean;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center justify-between gap-3">
      <span className="text-sm text-[var(--brand-ink-soft)]">{label}</span>
      <span className="relative inline-block h-6 w-11 shrink-0">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full bg-[var(--brand-line)] transition-colors peer-checked:bg-[var(--brand-gold)]" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
