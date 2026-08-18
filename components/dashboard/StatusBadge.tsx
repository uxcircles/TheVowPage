/** The single "Published"/"Draft" pill used both on the dashboard's
 * wedding list (a white card) and inside WeddingChrome's per-wedding
 * header (directly on the page's cream --background) - those two
 * previously used different treatments (a filled badge vs. a small dot +
 * plain text) for the same status. The border is deliberate: a flat
 * light fill alone read fine on white but nearly disappeared against
 * the warm cream background, so the border keeps a defined edge
 * regardless of what's behind it. Uses --brand-success (also the
 * success-toast color) rather than Tailwind's stock green, which read
 * as an out-of-place, overly saturated mint next to the rest of the
 * site's muted palette. */
export function StatusBadge({ published, label }: { published: boolean; label: string }) {
  return (
    <span
      className={`rounded border px-2 py-1 text-xs font-medium ${
        published
          ? "border-[var(--brand-success)]/30 bg-[var(--brand-success)]/10 text-[var(--brand-success)]"
          : "border-gray-300 bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </span>
  );
}
