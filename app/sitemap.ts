import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Content revision dates, maintained by hand.
 *
 * These were previously `new Date()`, which told Google that every page
 * changed on every deploy. Google discounts — and eventually ignores — a
 * `lastmod` it finds untrustworthy, so a date is only worth sending if it
 * tracks real edits to the page's copy. Bump the entry when the page's
 * content meaningfully changes; ignore styling and refactors.
 */
const pages = [
  { path: "/", lastModified: "2026-09-19", changeFrequency: "monthly", priority: 1 },
  { path: "/services", lastModified: "2026-09-19", changeFrequency: "monthly", priority: 0.9 },
  { path: "/past-work", lastModified: "2026-09-07", changeFrequency: "monthly", priority: 0.9 },
  { path: "/approach", lastModified: "2026-09-19", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", lastModified: "2026-09-19", changeFrequency: "yearly", priority: 0.7 },
  { path: "/contact", lastModified: "2026-09-19", changeFrequency: "yearly", priority: 0.8 },
] as const satisfies readonly {
  path: string;
  lastModified: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, lastModified, changeFrequency, priority }) => ({
    url: `${site.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
