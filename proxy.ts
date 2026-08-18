import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { LOCALE_COOKIE, localeFromAcceptLanguage } from "@/lib/i18n/shared";

// The home/terms/privacy pages are statically pre-rendered per locale (see
// app/(marketing-zh) and app/(marketing-en)) rather than reading the locale
// cookie - zh stays at the bare path, en lives under /en. Keep in sync with
// lib/i18n/marketingPaths.ts's MarketingPath.
const BARE_MARKETING_PATHS = new Set(["/", "/terms", "/privacy"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Existing cookie wins; a first-ever visit (no cookie yet) falls back to
  // detecting from the browser's Accept-Language header. Using this
  // resolved `locale` (rather than the raw cookie) for the redirect check
  // below means a first-time English-browser visitor gets sent to /en on
  // *this* request - not just remembered for the next one, which was the
  // bug: the old code only set the cookie from Accept-Language *after*
  // already deciding (based on the not-yet-set cookie) not to redirect.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const isFirstVisit = !cookieLocale;
  const locale = cookieLocale ?? localeFromAcceptLanguage(request.headers.get("accept-language"));

  // A visitor whose locale is "en" (saved or just detected) hitting a bare
  // marketing URL (e.g. a bookmarked "/" or a link from search results)
  // still expects the English site - send them to the /en equivalent so
  // they don't land on the Chinese static page.
  if (BARE_MARKETING_PATHS.has(pathname) && locale === "en") {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
    const redirectResponse = NextResponse.redirect(url);
    if (isFirstVisit) {
      redirectResponse.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 31536000, sameSite: "lax" });
    }
    return redirectResponse;
  }

  const response = await updateSession(request);

  // First visit (no saved preference yet): remember the detected default
  // so it doesn't need to be redetected on every request.
  if (isFirstVisit) {
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 31536000, sameSite: "lax" });
  }

  // Visiting the English marketing pages directly (rather than switching
  // via LanguageSwitcher, which navigates instead of setting the cookie)
  // should still leave the visitor in English once they click through to a
  // cookie-based page like /create or /login - force the cookie to "en"
  // here rather than only setting it when absent, unlike the branch above.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    response.cookies.set(LOCALE_COOKIE, "en", { path: "/", maxAge: 31536000, sameSite: "lax" });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
