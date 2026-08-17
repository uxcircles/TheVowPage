import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/shared";

export const SITE_URL = "https://www.thevowpage.com";
export const SITE_NAME = "The Vow Page 摯頁";

const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/og.jpg`,
  width: 1200,
  height: 630,
};

/** Builds a consistent title/description/OG/Twitter Metadata object for a
 * page. `path` must be the final locale-prefixed URL (e.g. "/en/terms",
 * not "/terms") so the canonical/og:url is correct - callers on the
 * marketing pages already have this since they render one fixed locale
 * per route; this file has no dynamic-URL awareness of its own.
 *
 * There's no single shared root layout to hang a site-wide `metadataBase`
 * off of (home/terms/privacy and the rest of the app are three
 * independent root layouts - see the /en migration plan) - every URL
 * here is written out in full instead of relying on that resolution. */
export function buildMetadata({
  title,
  description,
  path,
  locale,
  image,
  noIndex,
}: {
  title: string;
  description: string;
  /** Omit for a layout-level fallback that covers many different URLs
   * (e.g. (app)'s root layout, shared by /login, /create, /dashboard/**) -
   * canonical/og:url only make sense pinned to one specific page. */
  path?: string;
  locale: Locale;
  /** Width/height are a hint for platforms that render before fetching
   * the image - omit them for a couple's own uploaded photo (arbitrary,
   * unknown aspect ratio) and only the default branded image sets them. */
  image?: { url: string; width?: number; height?: number };
  noIndex?: boolean;
}): Metadata {
  const url = path ? `${SITE_URL}${path}` : undefined;
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  return {
    title,
    description,
    ...(url ? { alternates: { canonical: url } } : {}),
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      ...(url ? { url } : {}),
      siteName: SITE_NAME,
      locale: locale === "en" ? "en_GB" : "zh_Hant",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}
