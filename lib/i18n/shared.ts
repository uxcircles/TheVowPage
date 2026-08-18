// Pure constants/helpers with no server-only imports, so this is safe to
// pull into the edge proxy, Server Components, and Client Components alike
// (unlike lib/i18n/locale.ts's getLocale(), which needs next/headers and
// can only be imported from Server Components).

export type Locale = "zh" | "en";

export const LOCALE_COOKIE = "locale";
export const DEFAULT_LOCALE: Locale = "zh";

/** Picks zh/en from the raw Accept-Language header value. Only needs to
 * make a binary call, not full RFC 4647 language-range matching, so this
 * just checks whether the first preferred tag starts with "zh" rather
 * than pulling in a language-matching library for two locales.
 *
 * Defaults to English for anything that isn't Chinese (not just "en")
 * - a French, German, or Japanese browser should land on the English
 * site rather than the Chinese one, since English is the more broadly
 * understood fallback for a visitor who isn't in either home market. A
 * missing header entirely (rare - some bots/tools omit it) still falls
 * back to the site's own default (zh), since that's not really a signal
 * either way. */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const first = header.split(",")[0]?.trim().toLowerCase();
  if (!first) return DEFAULT_LOCALE;
  return first.startsWith("zh") ? "zh" : "en";
}
