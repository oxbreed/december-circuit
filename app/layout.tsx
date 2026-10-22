import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { JsonLd } from "./components/json-ld";
import { SiteChrome } from "./components/site-chrome";
import { siteJsonLd } from "./jsonld";
import {
  defaultDescription,
  publisherName,
  siteName,
  siteUrl,
} from "./site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  authors: [{ name: publisherName }],
  publisher: publisherName,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteName,
    description: defaultDescription,
    url: "/",
    siteName,
    type: "website",
    locale: "en",
    images: [{ url: "/icon.png", alt: siteName }],
  },
  twitter: {
    card: "summary",
    title: siteName,
    description: defaultDescription,
    images: ["/icon.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-ink">
        <JsonLd data={siteJsonLd()} />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
