import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    // Route Handlers (app/api/photos/upload) have their own separate body
    // size limit, unrelated to serverActions.bodySizeLimit above - without
    // this, uploads over Next's default cap fail with a bare 500 for that
    // path instead of a useful error.
    proxyClientMaxBodySize: "10mb",
  },
  // Baseline security headers applied site-wide. Deliberately no
  // Content-Security-Policy here - a real CSP needs to enumerate every
  // script/style/image/font source this app actually uses (Stripe
  // Checkout, Supabase Storage, OSM tile servers, Google Fonts, Next's own
  // inline hydration data) and get verified page-by-page, which is a
  // separate, larger piece of work rather than something to bolt on
  // as part of this pass.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking: nothing in this app is meant to be framed by
          // another site (the public /w/[slug] pages included - sharing
          // is by direct link, not embedding).
          { key: "X-Frame-Options", value: "DENY" },
          // Stops a browser from ever re-interpreting a response as a
          // different content type than what the server declared (e.g.
          // treating an uploaded file as HTML because it sniffed script-
          // like bytes) - most relevant to the photo upload route.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Full URL (with slug, potentially venue details in the path)
          // is only sent same-origin; cross-origin requests drop the path
          // entirely, keeping the couple's private link out of referrer
          // headers sent to Stripe, Nominatim, and image hosts.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
