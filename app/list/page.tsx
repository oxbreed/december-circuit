import { EventSubmission } from "../components/event-submission";
import { PartnerOffer } from "../components/partner-offer";
import { ProductAd } from "../components/product-ad";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "List an event or place an ad",
  description:
    "Email an event or a product to be checked, or ask about a labeled placement. This site does not take payment.",
  path: "/list",
});

export default function ListPage() {
  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-12 pt-16 sm:px-6 md:px-8 md:pt-32 lg:pb-16">
      <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">On this site</p>
      <h1 className="mt-2 max-w-3xl font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
        List an event or place an ad
      </h1>

      <section id="submit-event" className="mt-4 scroll-mt-36">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">
          Submit an event or a show
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          The event stays off the public list until it is checked. The button
          opens an email to hello@dirtydecember.info.
        </p>
        <EventSubmission />
      </section>

      <section id="place-ad" className="mt-4 scroll-mt-36 border-t border-ink/10 pt-4">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">
          Ad placement for a business
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          The placement is labeled, and this site does not take payment.
        </p>
        <a
          href="mailto:partners@dirtydecember.info?subject=Ad%20placement"
          className="mt-3 inline-flex max-w-full bg-ink px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-chart"
        >
          Email about a placement
        </a>
      </section>

      <section id="product-ad" className="mt-4 scroll-mt-36 border-t border-ink/10 pt-4">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">
          Product ad
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          The placement is labeled, and this site does not take payment. The
          product stays off the site until it is checked. The button opens an
          email to partners@dirtydecember.info.
        </p>
        <ProductAd />
      </section>

      <section id="transport-partnership" className="mt-4 scroll-mt-36 border-t border-ink/10 pt-4">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">
          Transportation partnership
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          The placement is labeled, and this site does not take payment. The
          offer stays off the site until it is checked. The button opens an
          email to partners@dirtydecember.info.
        </p>
        <PartnerOffer subject="Transportation partnership" button="Email about transportation" />
      </section>

      <section id="booking-partnership" className="mt-4 scroll-mt-36 border-t border-ink/10 pt-4">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">
          Booking partnership
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          The placement is labeled, and this site does not take payment. The
          offer stays off the site until it is checked. The button opens an
          email to partners@dirtydecember.info.
        </p>
        <PartnerOffer subject="Booking partnership" button="Email about booking" />
      </section>
    </main>
  );
}
