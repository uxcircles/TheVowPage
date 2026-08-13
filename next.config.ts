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
};

export default nextConfig;
