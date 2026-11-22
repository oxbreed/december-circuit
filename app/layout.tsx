import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { JsonLd } from "./components/json-ld";
import { ConsentBanner } from "./components/consent-banner";
import { DeferredSiteAnalytics } from "./components/deferred-site-analytics";
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

function gaMeasurementId() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return id && id.length > 0 ? id : null;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  preload: false,
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
  viewportFit: "cover",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var m=document.cookie.match(/(?:^|; )dd_analytics_consent=([^;]*)/);if(m)document.documentElement.setAttribute('data-analytics-consent',decodeURIComponent(m[1]));}catch(e){}})();",
          }}
        />
        <meta
          name="impact-site-verification"
          {...({
            value: "a59c0ba8-532b-4068-9ffa-4d30dff4eb45",
          } as Record<string, string>)}
        />
      </head>
      <body className="flex min-h-full flex-col font-sans text-ink">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={siteJsonLd()} />
        <SiteChrome support={<Suspense fallback={null}><SupportChatSlot /></Suspense>}>
          {children}
        </SiteChrome>
        <ConsentBanner />
        <DeferredSiteAnalytics gaMeasurementId={gaMeasurementId()} />
      </body>
    </html>
  );
}
