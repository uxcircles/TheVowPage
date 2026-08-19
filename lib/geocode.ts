import tzlookup from "tz-lookup";

export type GeocodeResult = { lat: number; lng: number; timezone: string; address: string | null };

const DEFAULT_TIMEZONE = "Asia/Taipei";

// This product's two stated markets ([[vowpage_business_entity_and_markets]]).
// Nominatim's free-text search has no idea which "台北..." or "London..." a
// short venue name means and will happily return its best global guess -
// for an unusual/misspelled name that can be a same-ish-sounding place on
// the other side of the world with a tiny importance score, placed on the
// map with just as much apparent confidence as a real match. Biasing to
// these two countries first cuts that failure mode down for the vast
// majority of real users without blocking anyone actually planning a
// wedding elsewhere - see the unrestricted retry below.
const PRIMARY_MARKET_COUNTRY_CODES = "tw,gb";

/** Single lookup against OpenStreetMap Nominatim (same provider already used
 * for the venue map tiles, no API key needed). Only call this server-side -
 * Nominatim's usage policy wants a real identifying User-Agent, which
 * browsers won't let client code set. */
async function geocodeQuery(
  query: string,
  countryCodes: string | undefined,
  acceptLanguage: string
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  try {
    const params = new URLSearchParams({ format: "json", limit: "1", q: trimmed });
    if (countryCodes) params.set("countrycodes", countryCodes);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        "User-Agent": "wedding-invite-app (contact: designlcc@gmail.com)",
        "Accept-Language": acceptLanguage,
      },
    });
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
 * nothing - so try the venue name(s) first and only fall back to the
 * street address if none of those match. Accepts multiple candidate names
 * (e.g. a wedding's ZH-HANT and EN venue name, once bilingual content is
 * in play) since a name that fails to match in one language can still
 * geocode cleanly in the other - tried in order, first match wins, with
 * exact duplicates skipped. When found by name, Nominatim's own formatted
 * address is returned too, so the caller can offer to fill in the address
 * field for someone who only typed a venue name.
 *
 * Deliberately restricted to PRIMARY_MARKET_COUNTRY_CODES with no
 * unrestricted global fallback: Nominatim's `importance` score reflects
 * general prominence, not match confidence, so a real, correctly-matched
 * small-town Taiwanese venue can score just as low as a completely wrong
 * match on the other side of the world (confirmed empirically) - there's
 * no reliable signal to tell "obscure but right" apart from "confidently
 * wrong country". A misspelled/unusual name failing to match within these
 * two markets returning null (which the caller already handles - the
 * venue form falls back to letting the user enter coordinates manually)
 * is far better than silently placing the pin on a random hotel in the
 * wrong country.
 *
 * `locale` sets the Accept-Language Nominatim replies in - this used to
 * be hardcoded to "zh-TW", which meant an English-locale admin searching
 * for a UK venue got back an address with Chinese place names mixed in
 * wherever OSM had no English translation for a component (a Scottish
 * council area rendered as literal Chinese text, for instance). Passing
 * the admin's own locale through fixes that for both directions. */
export async function geocodeVenue(venueNames: string[], address: string, locale: "zh" | "en"): Promise<GeocodeResult | null> {
  const acceptLanguage = locale === "en" ? "en" : "zh-TW";
  const candidates = [...new Set(venueNames.map((n) => n.trim()).filter(Boolean))];

  let found: { lat: number; lng: number; displayName: string } | null = null;
  for (const name of candidates) {
    found = await geocodeQuery(name, PRIMARY_MARKET_COUNTRY_CODES, acceptLanguage);
    if (found) break;
  }
  found ??= await geocodeQuery(address, PRIMARY_MARKET_COUNTRY_CODES, acceptLanguage);
  if (!found) return null;
  return {
    lat: found.lat,
    lng: found.lng,
    timezone: timezoneForCoords(found.lat, found.lng),
    address: found.displayName || null,
  };
}
