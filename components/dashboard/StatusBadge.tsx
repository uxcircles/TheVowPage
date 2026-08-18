/** The single "Published"/"Draft" pill used both on the dashboard's
 * wedding list and inside WeddingChrome's per-wedding header - those two
 * previously used different treatments (a filled badge vs. a small dot +
 * plain text) for the same status. */
export function StatusBadge({ published, label }: { published: boolean; label: string }) {
  return (
    <span
      className={`rounded px-2 py-1 text-xs font-medium ${
        published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </span>
  );
}
