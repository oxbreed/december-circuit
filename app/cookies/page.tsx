import Link from "next/link";
import { disclaimer } from "../brand";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Cookies",
  description:
    "Which cookies and browser storage dirtydecember.info uses, and what partner sites may set after you follow an outbound link.",
  path: "/cookies",
});

const link = "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

const rows = [
  {
    name: "Sign-in cookie (Supabase)",
    when: "Only after you open a sign-in link",
    why: "Keeps you signed in so you can write a review, sync My Trip, or open the admin page.",
  },
  {
    name: "My Trip (browser storage)",
    when: "When you save an event or a place",
    why: "Keeps your trip list on this device. It is not a cookie and is not sent to the server unless you sign in and sync.",
  },
  {
    name: "Vercel Web Analytics and Speed Insights",
    when: "Every page",
    why: "Counts page views, clicks on partner links, and page speed. Vercel states that Web Analytics stores anonymised data and does not use advertising cookies.",
  },
  {
    name: "Google Analytics",
    when: "Only if the operator turns it on (off by default)",
    why: "Page and click statistics with IP anonymisation. If it is turned on, Google sets its own analytics cookies.",
  },
] as const;

export default function CookiesPage() {
  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <p className="text-[11px] uppercase tracking-[0.28em] text-brass">Cookies</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        Cookie notice
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">{disclaimer}</p>
      <div className="mt-8 space-y-4 text-base leading-7 text-ink">
        <p>
          This directory’s own code sets no advertising cookie. Here is what the site uses.
        </p>
        <ul className="mt-6 divide-y divide-ink/10 border border-ink/15 bg-chart">
          {rows.map((row) => (
            <li key={row.name} className="px-4 py-4 sm:px-5">
              <p className="font-display text-xl leading-tight">{row.name}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-lagoon">{row.when}</p>
              <p className="mt-2 text-sm leading-7 text-muted">{row.why}</p>
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
          You can clear cookies and site storage in your browser settings at any time. Clearing
          them signs you out and empties My Trip on this device. More detail is in the{" "}
          <Link href="/privacy" className={link}>
            privacy notice
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
