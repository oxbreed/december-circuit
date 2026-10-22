import type { Metadata } from "next";

export const siteName = "dirtydecember.info";
export const siteUrl = "https://www.dirtydecember.info";
export const publisherName = "Oxbreed Management";
export const defaultDescription =
  "Independent community directory of sourced December 2026 events, organiser pages, and flight searches.";

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
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = documentTitle(title);
  return {
    title: path === "/" ? { absolute: fullTitle } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName,
      type: "website",
      locale: "en",
      images: [{ url: "/icon.png", alt: siteName }],
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
      images: ["/icon.png"],
    },
  };
}
