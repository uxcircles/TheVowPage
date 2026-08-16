import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { LOCALE_COOKIE, localeFromAcceptLanguage } from "@/lib/i18n/shared";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  // First visit (no saved preference yet): pick a default from the
  // browser's Accept-Language header and remember it, so it doesn't
  // need to be redetected on every request.
  if (!request.cookies.has(LOCALE_COOKIE)) {
    const locale = localeFromAcceptLanguage(request.headers.get("accept-language"));
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 31536000, sameSite: "lax" });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
