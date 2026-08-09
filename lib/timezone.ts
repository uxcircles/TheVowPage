// Pure Intl-based wall-clock <-> UTC conversion for an arbitrary IANA
// timezone. Safe to import from both client and server code (no Node-only
// APIs), unlike the geocoding/tz-lookup helpers.

function getParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") % 24, // Intl can format midnight as "24"
    minute: get("minute"),
    second: get("second"),
  };
}

/** Converts a "YYYY-MM-DDTHH:mm" wall-clock string - meant as local time in
 * `timeZone` - into the correct UTC instant (ISO string), accounting for
 * that zone's actual UTC offset (including DST) on that specific date. */
export function wallTimeToUtcIso(dateTimeLocal: string, timeZone: string): string | null {
  const trimmed = dateTimeLocal.trim();
  if (!trimmed) return null;
  const [datePart, timePart] = trimmed.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = (timePart ?? "00:00").split(":").map(Number);
  if (!y || !m || !d) return null;

  // First guess: treat the wall-clock numbers as if they were already UTC,
  // then see what that instant actually reads as in the target zone, and
  // shift by the difference. One pass is enough because zone offsets change
  // in whole minutes, not relative to themselves.
  const guessUtc = Date.UTC(y, m - 1, d, hh || 0, mm || 0);
  const asZoned = getParts(new Date(guessUtc), timeZone);
  const zonedAsUtc = Date.UTC(asZoned.year, asZoned.month - 1, asZoned.day, asZoned.hour, asZoned.minute, asZoned.second);
  const diff = guessUtc - zonedAsUtc;
  return new Date(guessUtc + diff).toISOString();
}

/** Formats a stored UTC instant back into a "YYYY-MM-DDTHH:mm" wall-clock
 * string for a datetime-local input, in the given IANA timezone. */
export function toDatetimeLocalValue(iso: string | null, timeZone: string): string {
  if (!iso) return "";
  const p = getParts(new Date(iso), timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}
