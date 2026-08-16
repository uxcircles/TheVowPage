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

  // A visitor whose locale cookie is already "en" hitting a bare marketing
  // URL (e.g. a bookmarked "/" or a link from search results) still expects
  // the English site - send them to the /en equivalent so they don't land
  // on the Chinese static page.
  if (BARE_MARKETING_PATHS.has(pathname) && request.cookies.get(LOCALE_COOKIE)?.value === "en") {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
    return NextResponse.redirect(url);
  }

  const response = await updateSession(request);

  // First visit (no saved preference yet): pick a default from the
  // browser's Accept-Language header and remember it, so it doesn't
  // need to be redetected on every request.
  if (!request.cookies.has(LOCALE_COOKIE)) {
    const locale = localeFromAcceptLanguage(request.headers.get("accept-language"));
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
