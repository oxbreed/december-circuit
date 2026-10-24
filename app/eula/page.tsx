import Link from "next/link";
import { disclaimer } from "../brand";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "EULA",
  description:
    "End user licence for dirtydecember.info. No payment and no bookings on this site. Governed by Nigerian law.",
  path: "/eula",
});

export default function EulaPage() {
  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <p className="text-[11px] uppercase tracking-[0.28em] text-brass">EULA</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        End user licence
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">{disclaimer}</p>
      <div className="mt-8 space-y-4 text-base leading-7 text-ink">
        <p>
          Oxbreed Management operates dirtydecember.info. The footer credit is
          “Powered by Oxbreed Management.” and that credit links only to{" "}
          <a
            href="https://www.oxbreedmanagement.com"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            https://www.oxbreedmanagement.com
          </a>
          .
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          What this licence covers
        </h2>
        <p>
          You can read the sourced records, read the news page, follow an
          outbound link, save a trip in this browser, sign in, send an
          unpublished listing or partnership note, and write a text review after
          you sign in. This site takes no payment and holds no bookings. A
          ticket link, a stay link, and a flight search are not a purchase on
          this site.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Outbound links
        </h2>
        <p>
          Booking links and flight searches are outbound links. Ticket links and
          organiser pages also leave this site. The other site’s own terms apply
          once you leave. The news page shows headlines and pictures supplied by
          the public feeds already used for the ticker. Opening an item leaves
          this site. A newsletter, a fare, or a payment is not offered on this
          site.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Liability for a directory
        </h2>
        <p>
          The public listings are sourced records. A date, a city, and a venue
          are only what that record says. An organiser page or a news report can
          change after the record was checked. The directory does not promise
          that an event will happen, that a ticket remains on sale, or that a
          room or a seat is available.
        </p>
        <p>
          To the extent the law allows, Oxbreed Management is not liable for a
          loss that comes from relying on a record or from a site you open from
          here. This licence does not exclude liability that the law of the
          Federal Republic of Nigeria does not allow to be excluded.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Law</h2>
        <p>
          This licence is governed by the law of the Federal Republic of Nigeria.
          The directory is for Nigeria and for other places in West Africa. A
          mandatory right that applies where you live still applies.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Changes</h2>
        <p>If this licence changes, the new text will replace this page.</p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Contact</h2>
        <p>
          Visitors:{" "}
          <a
            href="mailto:hello@dirtydecember.info"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            hello@dirtydecember.info
          </a>
          . Partnership and placement enquiries:{" "}
          <a
            href="mailto:partners@dirtydecember.info"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            partners@dirtydecember.info
          </a>
          . What the site collects is on the{" "}
          <Link
            href="/privacy"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            privacy notice
          </Link>
          . Acceptable use is on the{" "}
          <Link
            href="/terms"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            terms
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
