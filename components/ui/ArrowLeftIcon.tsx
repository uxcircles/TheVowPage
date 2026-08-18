// Same 24x24 stroke-icon convention as TrashIcon - used by every "back to
// dashboard" link instead of the "←" character, which rendered
// inconsistently across fonts.
export function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 6l-6 6 6 6" />
    </svg>
  );
}
