import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { JsonLd } from "./components/json-ld";
import { LagosClockSlot } from "./components/lagos-clock-slot";
import { SiteChrome } from "./components/site-chrome";
import { SupportChatSlot } from "./components/support-chat-slot";
import { organizationJsonLd, siteJsonLd } from "./jsonld";
import {
  defaultDescription,
  defaultShareImage,
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4eadc",
};

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
    images: [
      {
        url: defaultShareImage.url,
        alt: defaultShareImage.alt,
        width: defaultShareImage.width,
        height: defaultShareImage.height,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
    images: [defaultShareImage.url],
  },
  robots: { index: true, follow: true },
  category: "travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-ink">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={siteJsonLd()} />
        <SiteChrome clock={<LagosClockSlot />}>{children}</SiteChrome>
        <SupportChatSlot />
      </body>
    </html>
  );
}
