import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Only the six static marketing pages - login/signup/create/dashboard
// aren't the kind of page people search for, and /w/[slug] (each couple's
// own invitation) is deliberately excluded from indexing entirely (see
// app/robots.ts and that page's generateMetadata) for their privacy.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/en`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/en/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/en/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
