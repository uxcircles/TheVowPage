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
  const result = await geocodeVenue([venueName, venueNameEn], address, locale);
  return NextResponse.json({ result });
}
