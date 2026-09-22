/**
 * Page-level SEO helpers.
 *
 * Next.js merges `metadata` shallowly. A page that sets only `title` and
 * `description` still inherits the root layout's *entire* `openGraph`
 * object, so without this helper every page would publish the homepage's
 * og:title, og:description and og:url. Building the four blocks that have
 * to agree — title, description, canonical, Open Graph/Twitter — from one
 * call keeps them in step.
 */

import type { Metadata } from "next";
import { site } from "./site";
import { socialImageSize } from "./social-image";

/**
 * Next.js attaches `app/opengraph-image.tsx` automatically only while a
 * route leaves `openGraph` alone. The moment a page sets that object — as
 * every page here does, to get its own og:title — the file-convention
 * image is dropped and the page ships with no preview card at all. Naming
 * the routes explicitly puts it back.
 */
const socialImage = {
  alt: "Marters & Co. — automation implementation partner",
  ...socialImageSize,
};
const ogImage = { url: "/opengraph-image", type: "image/png", ...socialImage };
const twitterImage = { url: "/twitter-image", type: "image/png", ...socialImage };

type PageSeo = {
  /** Slotted into the root layout's `%s — Marters & Co.` title template. */
  title: string;
  description: string;
  /** Absolute path, e.g. `/services`. */
  path: string;
};

export function pageMetadata({ title, description, path }: PageSeo): Metadata {
  // The title template applies only to `title`; Open Graph has no
  // equivalent, so the full form is spelled out.
  const fullTitle = `${title} — ${site.name}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_AE",
      siteName: site.name,
      title: fullTitle,
      description,
      url: path,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [twitterImage],
    },
  };
}

/**
 * BreadcrumbList schema. Google renders this as the path shown above a
 * result in place of the raw URL. Home is prepended automatically, so a
 * page passes only its own crumb.
 */
export function breadcrumbs(...trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map(
      (crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: `${site.url}${crumb.path}`,
      }),
    ),
  };
}
