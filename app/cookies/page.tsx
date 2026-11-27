import Link from "next/link";
import { disclaimer } from "../brand";
import { pageMetadata } from "../site";
import { JsonLd } from "../components/json-ld";
import { breadcrumbJsonLd } from "../jsonld";

export const metadata = pageMetadata({
  title: "Cookies",
  description:
    "Which cookies and browser storage dirtydecember.info uses, and what partner sites may set after you follow an outbound link.",
  path: "/cookies",
});

const link = "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

const categories = [
  {
    name: "Necessary",
    why: "Storage that keeps the site working as you asked: staying signed in, and holding a trip list you save on this device.",
  },
  {
    name: "Analytics and performance",
    why: "Tools that count page views, measure how quickly pages load, and — only if the operator turns it on — collect page statistics. These are not used to show ads.",
  },
] as const;

const rows = [
  {
    category: "Necessary",
    name: "Sign-in cookie (Supabase)",
    when: "Only after you open a sign-in link",
    lasts: "Until you sign out or clear site data for this browser.",
    why: "Keeps you signed in so you can write a review, sync My Trip, or open the admin page.",
  },
  {
    category: "Necessary",
    name: "My Trip (browser storage)",
    when: "When you save an event or a place",
    lasts: "Until you remove the item or clear site data for this browser.",
    why: "Keeps your trip list on this device. It is not a cookie and is not sent to the server unless you sign in and sync.",
  },
  {
    category: "Analytics and performance",
    name: "Vercel Web Analytics and Speed Insights",
    when: "Only after you accept analytics",
    lasts:
      "Web Analytics does not use a cookie. Vercel identifies a visit with a hash from the request and discards that hash after 24 hours. Speed Insights sends anonymous page-speed readings on each page load; Vercel does not describe a cookie for that product.",
    why: "Counts page views, clicks on partner links, and page speed. Vercel states that Web Analytics stores anonymised data and does not use advertising cookies.",
  },
  {
    category: "Analytics and performance",
    name: "First-party visit and speed records",
    when: "Only after you accept analytics",
    lasts: "No cookie. The records are removed after about ninety days.",
    why: "The site may also store the path you opened, an optional referrer, a short browser user-agent string, a two-letter country code from the hosting edge, and Core Web Vitals samples, so the signed-in admin page can show usage and performance numbers. These records do not store your IP address and do not set an advertising cookie.",
  },
  {
    category: "Analytics and performance",
    name: "Google Analytics",
    when: "Only if the operator turns it on (off by default)",
    lasts:
      "If it is turned on, Google may set its own analytics cookies, including _ga and _ga_ (2 years) and _gid (24 hours).",
    why: "Page and click statistics with IP anonymisation. If it is turned on, Google sets its own analytics cookies.",
  },
] as const;

export default function CookiesPage() {
  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Cookies", path: "/cookies" }])} />
      <p className="text-[11px] uppercase tracking-[0.28em] text-brass">Cookies</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        Cookie notice
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">{disclaimer}</p>
      <div className="mt-8 space-y-4 text-base leading-7 text-ink">
        <p>
          This directory’s own code sets no advertising cookie. We use cookies and similar
          storage to keep the site working, and also for analytics and performance if you
          accept. A small banner asks you to accept or reject analytics on your first visit,
          and you can change that later with Cookie settings in the footer. The categories
          are below. The table then names each tool, what it does, and how long it lasts.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Categories</h2>
        <ul className="mt-6 divide-y divide-ink/10 border border-ink/15 bg-chart">
          {categories.map((category) => (
            <li key={category.name} className="px-4 py-4 sm:px-5">
              <p className="font-display text-xl leading-tight">{category.name}</p>
              <p className="mt-2 text-sm leading-7 text-muted">{category.why}</p>
            </li>
          ))}
        </ul>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Details</h2>
        <ul className="mt-6 divide-y divide-ink/10 border border-ink/15 bg-chart">
          {rows.map((row) => (
            <li key={row.name} className="px-4 py-4 sm:px-5">
              <p className="font-display text-xl leading-tight">{row.name}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-lagoon">
                {row.category} · {row.when}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted">{row.why}</p>
              <p className="mt-2 text-sm leading-7 text-muted">Lasts: {row.lasts}</p>
            </li>
          ))}
        </ul>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Partner sites</h2>
        <p>
          A partner link (it starts with <code>/go/</code>) opens a hotel, flight, or tour site
          such as Trip.com, Agoda, Booking.com, or Viator. Once you are on that site, it may set
          its own cookies, including a cookie that tells it this site referred you. Those cookies
          are covered by that site’s own cookie and privacy notices, not this one. See the{" "}
          <Link href="/disclosure" className={link}>
            affiliate disclosure
          </Link>
          .
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Your choices</h2>
        <p>
          Analytics and performance tools only run after you press Accept on the cookie
          banner. Reject is always as easy as Accept. Your choice is stored on this device
          for twelve months, in first-party storage and a first-party cookie named{" "}
          <code>dd_analytics_consent</code>. You can change it at any time with Cookie
          settings in the footer, which reopens the banner. If you later withdraw consent,
          the tools stop on the next page load. Necessary storage still works either way.
        </p>
        <p>
          You can also clear cookies and site storage in your browser settings at any time.
          Clearing them signs you out, empties My Trip on this device, and will ask for
          your analytics choice again. More detail is in the{" "}
          <Link href="/privacy" className={link}>
            privacy notice
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
