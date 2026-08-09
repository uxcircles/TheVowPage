import { NextResponse } from "next/server";
import { geocodeVenue, timezoneForCoords, type GeocodeResult } from "@/lib/geocode";

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
  const address = searchParams.get("address") ?? "";
  const result = await geocodeVenue(venueName, address);
  return NextResponse.json({ result });
}
