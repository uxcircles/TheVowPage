// Pure constants/helpers with no server-only imports, so this is safe to
// pull into the edge proxy, Server Components, and Client Components alike
// (unlike lib/i18n/locale.ts's getLocale(), which needs next/headers and
// can only be imported from Server Components).

export type Locale = "zh" | "en";

export const LOCALE_COOKIE = "locale";
export const DEFAULT_LOCALE: Locale = "zh";

/** Picks zh/en from the raw Accept-Language header value. Only needs to
 * make a binary call, not full RFC 4647 language-range matching, so this
 * just checks whether the first preferred tag starts with "en" rather
 * than pulling in a language-matching library for two locales. */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const first = header.split(",")[0]?.trim().toLowerCase();
  return first?.startsWith("en") ? "en" : DEFAULT_LOCALE;
}
