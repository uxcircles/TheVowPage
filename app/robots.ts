import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /w/[slug] pages carry a couple's own private event details (date,
      // exact venue) - each page already sets a per-page noIndex too (see
      // generateMetadata in app/(app)/w/[slug]/page.tsx), but disallowing
      // the crawl here as well means it's never fetched in the first
      // place. /dashboard is behind auth anyway; disallowing it here just
      // keeps crawlers from wasting time on 401s.
      disallow: ["/w/", "/dashboard"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
