import type { Metadata } from "next";
import { fitDescription, fitTitle, staticSeo } from "./seo";

export const siteName = "dirtydecember.info";
export const siteUrl = "https://www.dirtydecember.info";
export const publisherName = "Oxbreed Management";
export const publisherUrl = "https://oxbreedstudio.com";

/** Shared Open Graph / Twitter image — real Lagos night photograph in /public. */
export const defaultShareImage = {
  url: "/hero-lagos-night.jpg",
  alt: "Lagos at night — dirtydecember.info",
  width: 1600,
  height: 900,
} as const;

export const defaultDescription =
  "Detty December 2026 guide: confirmed events, hotels, places and maps for Lagos, Accra, Abuja, Abidjan and Calabar, with official ticket and booking links.";

export function absoluteUrl(path: string) {
  if (path === "/") return siteUrl;
  return `${siteUrl}${path}`;
}

export function documentTitle(title: string) {
  return `${title} · ${siteName}`;
}

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  image,
  robots,
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  /** When set (e.g. thin city pages), controls indexing without removing the page. */
  robots?: Metadata["robots"];
}): Metadata {
  const override = staticSeo[path];
  const fullTitle = override ? override.title : fitTitle(title);
  const fullDescription = override
    ? override.description
    : fitDescription(description);
  const share = image
    ? {
        url: image.url,
        alt: image.alt,
        width: image.width ?? 1200,
        height: image.height ?? 630,
      }
    : {
        url: defaultShareImage.url,
        alt: defaultShareImage.alt,
        width: defaultShareImage.width,
        height: defaultShareImage.height,
      };
  return {
    title: { absolute: fullTitle },
    description: fullDescription,
    alternates: { canonical: path },
    ...(robots ? { robots } : {}),
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: path,
      siteName,
      type,
      locale: "en_GB",
      images: [share],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: [share.url],
    },
  };
}
