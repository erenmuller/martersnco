import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private areas. Nothing here is reachable without a session anyway,
        // but keeping them out of the index avoids useless crawl and stray
        // login pages appearing in search results.
        disallow: [
          "/portal",
          "/admin",
          "/login",
          "/forgot-password",
          "/reset-password",
          "/auth/",
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
