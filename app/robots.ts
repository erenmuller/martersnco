import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Private areas. Nothing here is reachable without a session anyway, but
// keeping them out of the index avoids useless crawl and stray login pages
// appearing in search results.
const disallow = [
  "/portal",
  "/admin",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/auth/",
];

// AI search and assistant crawlers. `*` already admits them; naming them
// explicitly keeps them admitted if a host or CDN ever adds a default block,
// and states the intent: we want to be cited when someone asks an assistant.
const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: aiCrawlers, allow: "/", disallow },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
