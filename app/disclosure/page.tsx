import Link from "next/link";
import { disclaimer } from "../brand";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Affiliate & paid placement disclosure",
  description:
    "How dirtydecember.info labels affiliate links and paid placements, how outbound clicks are counted, and what that means for you.",
  path: "/disclosure",
});

const link = "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

export default function DisclosurePage() {
  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <p className="text-[11px] uppercase tracking-[0.28em] text-brass">Disclosure</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        Affiliate links &amp; paid placements
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">{disclaimer}</p>
      <div className="mt-8 space-y-4 text-base leading-7 text-ink">
        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">The short version</h2>
        <p>
          dirtydecember.info is a free directory operated by Oxbreed Management. Some links to
          hotel, flight, and tour booking sites are affiliate links. If you book through one of
          them, we may earn a commission from that site. Some listings may be paid placements.
          Both are labelled where they appear. Neither changes what a sourced record says.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Affiliate links</h2>
        <p>
          Partner links for hotel, flight, and tour searches (for example Trip.com, Agoda,
          Booking.com, and Viator) go through a short first-party address that starts with{" "}
          <code>/go/</code> and then open the partner’s own site. When this site has an affiliate
          account with that partner, the link carries our partner code and is labelled “We may
          earn a commission”. When it does not, the link is a plain search and is labelled as an
          outbound search.
        </p>
        <p>
          You book, pay, and agree to terms on the partner’s site, not here. Prices, availability,
          cancellation rules, and customer service are the partner’s. This directory does not
          check partner prices or inventory.
        </p>
        <p>
          Airbnb links are plain links. This site is not paid for them.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Paid placements</h2>
        <p>
          An organiser or business can pay to be featured. A paid placement is labelled “Featured ·
          Paid placement” wherever it appears, and its link is marked as sponsored for search
          engines. Payment does not change an event’s dates, venue, or other sourced facts, and a
          person checks every placement before it is shown. See{" "}
          <Link href="/get-featured" className={link}>
            Get featured
          </Link>
          .
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Ticket links</h2>
        <p>
          A ticket link opens the organiser’s or ticket platform’s own page. If an organiser agrees
          a commission or a tracked ticket link with us, that link is labelled as a partner or paid
          link.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Counting clicks</h2>
        <p>
          To report clicks to partners and organisers, the site counts clicks on partner, ticket,
          and paid links. Each count stores the partner, the page the link sat on, a two-letter
          country code from the hosting edge, and the time. It does not store your IP address or
          set an advertising cookie from this site. A partner’s own site may set its own cookies
          after you arrive there. See the{" "}
          <Link href="/privacy" className={link}>
            privacy notice
          </Link>{" "}
          and the{" "}
          <Link href="/cookies" className={link}>
            cookie notice
          </Link>
          .
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Questions</h2>
        <p>
          Email{" "}
          <a href="mailto:hello@dirtydecember.info" className={link}>
            hello@dirtydecember.info
          </a>{" "}
          about this notice, or{" "}
          <a href="mailto:partners@dirtydecember.info" className={link}>
            partners@dirtydecember.info
          </a>{" "}
          about partnerships.
        </p>
      </div>
    </main>
  );
}
