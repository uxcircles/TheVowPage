import tzlookup from "tz-lookup";

export type GeocodeResult = { lat: number; lng: number; timezone: string; address: string | null };

const DEFAULT_TIMEZONE = "Asia/Taipei";

/** Single lookup against OpenStreetMap Nominatim (same provider already used
 * for the venue map tiles, no API key needed). Only call this server-side -
 * Nominatim's usage policy wants a real identifying User-Agent, which
 * browsers won't let client code set. */
async function geocodeQuery(query: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(trimmed)}`,
      {
        headers: {
          "User-Agent": "wedding-invite-app (contact: designlcc@gmail.com)",
          "Accept-Language": "zh-TW",
        },
      }
    );
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const first = data[0] as { lat?: string; lon?: string; display_name?: string };
    if (!first.lat || !first.lon) return null;
    const lat = parseFloat(first.lat);
    const lng = parseFloat(first.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng, displayName: first.display_name ?? "" };
  } catch {
    return null;
  }
}

/** Resolves the IANA timezone for a coordinate. Pure offline lookup (no
 * network call), safe to call as often as needed. Falls back to Asia/Taipei
 * (this product's primary market) if the lookup ever throws. */
export function timezoneForCoords(lat: number, lng: number): string {
  try {
    return tzlookup(lat, lng);
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/** Geocodes a wedding venue and resolves its timezone in one step. Named
 * venues (hotels, restaurants) are almost always mapped as their own point
 * of interest in OpenStreetMap and geocode precisely by name, while raw
 * Taiwanese street addresses (with a "XX號" house number) very often return
 * nothing - so try the venue name first and only fall back to the street
 * address if that fails. When found by name, Nominatim's own formatted
 * address is returned too, so the caller can offer to fill in the address
 * field for someone who only typed a venue name. */
export async function geocodeVenue(venueName: string, address: string): Promise<GeocodeResult | null> {
  const found = (await geocodeQuery(venueName)) ?? (await geocodeQuery(address));
  if (!found) return null;
  return {
    lat: found.lat,
    lng: found.lng,
    timezone: timezoneForCoords(found.lat, found.lng),
    address: found.displayName || null,
  };
}
