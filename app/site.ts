import type { Metadata } from "next";

export const siteName = "dirtydecember.info";
export const siteUrl = "https://www.dirtydecember.info";
export const publisherName = "Oxbreed Management";
export const publisherUrl = "https://www.oxbreedmanagement.com";

/** Shared Open Graph / Twitter image — real Lagos night photograph in /public. */
export const defaultShareImage = {
  url: "/hero-lagos-night.jpg",
  alt: "Lagos at night — dirtydecember.info",
  width: 1600,
  height: 900,
} as const;

export const defaultDescription =
  "Independent Detty December and West Africa tourism directory: sourced events, places, maps, and outbound booking links for Lagos, Accra, Calabar, and neighbouring cities. No payment on this site.";

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
}): Metadata {
  const fullTitle = documentTitle(title);
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
    title: path === "/" ? { absolute: fullTitle } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName,
      type,
      locale: "en",
      images: [share],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [share.url],
    },
  };
}
