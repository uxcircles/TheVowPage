/** The single "Published"/"Draft" pill used both on the dashboard's
 * wedding list (a white card) and inside WeddingChrome's per-wedding
 * header (directly on the page's cream --background) - those two
 * previously used different treatments (a filled badge vs. a small dot +
 * plain text) for the same status. The border is deliberate: Tailwind's
 * green-100/gray-100 fills read fine on white but nearly disappear
 * against the warm cream background, so the fill alone isn't enough
 * everywhere this is used - the border keeps a defined edge regardless
 * of what's behind it. */
export function StatusBadge({ published, label }: { published: boolean; label: string }) {
  return (
    <span
      className={`rounded border px-2 py-1 text-xs font-medium ${
        published ? "border-green-200 bg-green-100 text-green-700" : "border-gray-300 bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </span>
  );
}
