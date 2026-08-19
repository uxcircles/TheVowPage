import { NextResponse } from "next/server";
import { geocodeVenue, timezoneForCoords, type GeocodeResult } from "@/lib/geocode";
import { getLocale } from "@/lib/i18n/locale";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  // Manual-coordinates path: just resolve the timezone for the given point,
  // no Nominatim call needed.
  if (latParam && lngParam) {
    const lat = Number(latParam);
    const lng = Number(lngParam);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json({ result: null });
    }
    const result: GeocodeResult = { lat, lng, timezone: timezoneForCoords(lat, lng), address: null };
    return NextResponse.json({ result });
  }

  const venueName = searchParams.get("venueName") ?? "";
  const venueNameEn = searchParams.get("venueNameEn") ?? "";
  const address = searchParams.get("address") ?? "";
  const locale = await getLocale();
  // When the zh/en venue name fields disagree, search whichever one the
  // admin's own locale treats as primary first - otherwise a stale zh
  // name left over from before an edit could out-rank the en name that
  // was actually just typed (or vice versa), matching a completely
  // different, unintended venue.
  const candidates = locale === "en" ? [venueNameEn, venueName] : [venueName, venueNameEn];
  const result = await geocodeVenue(candidates, address, locale);
  return NextResponse.json({ result });
}
