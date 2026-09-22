import type { Metadata } from "next";
import { site } from "@/lib/site";
import { socialImageSize } from "@/lib/social-image";

/**
 * Per-page metadata for the public pages. A child `openGraph` object replaces
 * the root one wholesale, so without this every shared link would carry the
 * home page's title and URL. Overriding also drops the image inherited from
 * the root `opengraph-image` / `twitter-image` files, so it is restated here.
 */
const socialImage = {
  width: socialImageSize.width,
  height: socialImageSize.height,
  alt: `${site.name} — AI consultancy & automation in Dubai`,
  type: "image/png",
};

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = `${title} — ${site.name}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_AE",
      siteName: site.name,
      url: path,
      title: fullTitle,
      description,
      images: [{ url: "/opengraph-image", ...socialImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: "/twitter-image", ...socialImage }],
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
