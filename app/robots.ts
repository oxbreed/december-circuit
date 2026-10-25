import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "./site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admin is the Next directory console. WordPress paths are unused
        // (this site is not WordPress); listed so scanners see them as closed.
        disallow: [
          "/api/",
          "/admin",
          "/auth/",
          "/wp-admin",
          "/wp-login.php",
          "/xmlrpc.php",
          "/index.php",
          "/wp-includes/",
          "/wp-content/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
