import { NextResponse } from "next/server";
import { geocodeVenue, timezoneForCoords, type GeocodeResult } from "@/lib/geocode";
import { getLocale } from "@/lib/i18n/locale";

// This route deliberately has no auth check - fetchGeocode() is called
// from the /create trial editor too, which by design works for visitors
// who haven't signed up yet. That leaves it as an open proxy to
// Nominatim: without *some* gate, a scraper hitting this directly could
// drive up request volume against our identifying User-Agent fast enough
// to get it rate-limited or banned by OSM, breaking geocoding for real
// users, on top of wasting server/function time. Two lightweight,
// dependency-free mitigations rather than a hard auth requirement:
// Sec-Fetch-Site (below, set by the browser itself on every fetch() this
// endpoint is actually called with - much harder to spoof by accident
// than Origin/Referer) rejects the common case of a browser script on
// another origin or in an iframe hitting this directly, and a small
// in-memory per-IP rate limit catches straightforward flooding. Neither
// stops a determined attacker scripting raw HTTP requests with forged
// headers - that would need real infrastructure (Vercel KV/Upstash, a
// WAF rule) - but this raises the bar a lot for near-zero cost and no
// new dependency.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(key, timestamps);
  // Unbounded growth guard - a real rate-limit store would expire keys on
  // its own; this map only does on the next request from the same IP, so
  // periodically drop anything that's aged out across the whole map too.
  if (requestLog.size > 5000) {
    for (const [k, v] of requestLog) {
      if (v.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) requestLog.delete(k);
    }
  }
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

const MAX_QUERY_LENGTH = 200;

export async function GET(request: Request) {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite && secFetchSite !== "same-origin") {
    return NextResponse.json({ result: null }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ result: null }, { status: 429 });
  }

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

  const venueName = (searchParams.get("venueName") ?? "").slice(0, MAX_QUERY_LENGTH);
  const venueNameEn = (searchParams.get("venueNameEn") ?? "").slice(0, MAX_QUERY_LENGTH);
  const address = (searchParams.get("address") ?? "").slice(0, MAX_QUERY_LENGTH);
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
