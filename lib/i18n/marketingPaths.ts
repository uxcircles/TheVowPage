import type { Locale } from "./shared";

/** The homepage, /terms and /privacy are statically pre-rendered per
 * locale (see app/(marketing-zh) and app/(marketing-en)) rather than
 * reading the locale cookie - Chinese stays at the bare path, English
 * lives under /en. Any link to one of these three pages, from anywhere in
 * the app, needs to resolve to the variant matching the current locale -
 * otherwise an English-locale visitor clicking "Terms" from, say, the
 * login page would land on the Chinese-only /terms. */
export type MarketingPath = "/" | "/terms" | "/privacy";

export function marketingHref(path: MarketingPath, locale: Locale): string {
  if (locale === "zh") return path;
  return path === "/" ? "/en" : `/en${path}`;
}
