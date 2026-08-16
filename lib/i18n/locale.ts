import { cookies } from "next/headers";
import { LOCALE_COOKIE, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/shared";

export type { Locale };

/** Server Component only - next/headers' cookies() can't be bundled for
 * the edge proxy or Client Components. Use lib/i18n/shared.ts there. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : DEFAULT_LOCALE;
}
