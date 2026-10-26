import type { NextConfig } from "next";
import { slugHistory } from "./app/slug-history";

const eventSlugRedirects = slugHistory().map(({ from, to }) => ({
  source: `/events/${from}`,
  destination: `/events/${to}`,
  permanent: true,
}));

const nextConfig: NextConfig = {
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return eventSlugRedirects;
  },
};

export default nextConfig;
