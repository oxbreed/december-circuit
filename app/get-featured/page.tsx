import Link from "next/link";
import { Suspense } from "react";
import { disclaimer } from "../brand";
import { FeaturedEnquiryLink } from "../components/tracked-link";
import { pageMetadata } from "../site";
import { livePlacements } from "../live-directory";

export const metadata = pageMetadata({
  title: "Get featured — organisers & businesses",
  description:
    "Feature an event, venue, or business on dirtydecember.info for Detty December 2026: labelled featured slots, sponsored stories, and tracked ticket links. Enquire for a quote.",
  path: "/get-featured",
});

const link = "underline decoration-ink/30 underline-offset-4 hover:text-oxide";
const button =
  "inline-flex max-w-full bg-ink px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-chart";
const secondary =
  "inline-flex max-w-full border border-ink/25 px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-ink hover:border-oxide hover:text-oxide";

const enquiryBody = [
  "Hello dirtydecember.info,",
  "",
  "We'd like to be featured.",
  "",
  "Organisation:",
  "Event or business name:",
  "City:",
  "Dates (if an event):",
  "Ticket or booking URL:",
  "What we're interested in (featured slot / sponsored story / tracked ticket link):",
  "",
  "Thanks,",
].join("\n");

const enquiryHref = `mailto:partners@dirtydecember.info?subject=${encodeURIComponent(
  "Get featured on dirtydecember.info",
)}&body=${encodeURIComponent(enquiryBody)}`;

/** Allow only https payment links on the named providers' own domains. */
function paymentLink(value: string | undefined, hosts: readonly string[]) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (!hosts.some((item) => host === item || host.endsWith(`.${item}`))) return null;
    return url.toString();
  } catch {
    return null;
  }
}

const offers = [
  {
    title: "Featured slot",
    body: "Your event or business shown in the featured spot on the events hub, and a Featured badge on your event card and event page. Labelled “Featured · Paid placement”.",
  },
  {
    title: "Sponsored story",
    body: "A short labelled story about your event or venue, written from the facts you supply and checked before it goes live.",
  },
  {
    title: "Tracked ticket link",
    body: "Your ticket button counts clicks from this site so you can see what it sends you. If your ticket platform supports a partner or referral code, we can use it.",
  },
] as const;

function GetFeaturedFallback() {
  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16 pt-16 sm:px-6 md:px-8 md:pt-32">
      <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">For organisers &amp; businesses</p>
      <h1 className="mt-2 max-w-3xl font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
        Get featured
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">Loading placements…</p>
    </main>
  );
}

export default function GetFeaturedPage() {
  return (
    <Suspense fallback={<GetFeaturedFallback />}>
      <GetFeaturedPageBody />
    </Suspense>
  );
}

async function GetFeaturedPageBody() {
  const paystack = paymentLink(process.env.PAYSTACK_PAYMENT_URL, ["paystack.com", "paystack.shop"]);
  const flutterwave = paymentLink(process.env.FLUTTERWAVE_PAYMENT_URL, ["flutterwave.com"]);
  const placements = await livePlacements();

  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16 pt-16 sm:px-6 md:px-8 md:pt-32">
      <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">For organisers &amp; businesses</p>
      <h1 className="mt-2 max-w-3xl font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
        Get featured
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
        dirtydecember.info is a free directory of sourced December events, places, and travel
        searches for visitors to Lagos, Accra, Calabar, and West Africa. Organisers and
        businesses can pay for a labelled placement. Listing a sourced event or place stays free
        at{" "}
        <Link href="/list" className={link}>
          List an event or place
        </Link>
        .
      </p>

      <section className="mt-10">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">What you can book</h2>
        <ul className="mt-6 grid gap-4">
          {offers.map((offer) => (
            <li key={offer.title} className="border border-ink/15 bg-chart px-5 py-5">
              <p className="font-display text-2xl leading-tight tracking-tight">{offer.title}</p>
              <p className="mt-2 text-sm leading-7 text-muted">{offer.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 border-t border-ink/10 pt-8">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">How it works</h2>
        <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-7 text-ink">
          <li>Send an enquiry with your event or business, city, dates, and ticket or booking URL.</li>
          <li>We reply by email with what is available for your dates and a written quote.</li>
          <li>
            If you accept, you pay the agreed amount through a secure payment link (Paystack or
            Flutterwave) or an invoice.
          </li>
          <li>
            A person checks your artwork and facts. The placement goes live labelled “Featured ·
            Paid placement”. Payment never publishes anything automatically.
          </li>
        </ol>
        <p className="mt-4 text-sm leading-7 text-muted">
          There is no public rate card yet; every quote is written for your dates. Paid placements
          never change an event’s sourced dates, venue, or facts. See the{" "}
          <Link href="/disclosure" className={link}>
            disclosure
          </Link>
          .
        </p>
      </section>

      <section id="enquire" className="mt-12 scroll-mt-36 border-t border-ink/10 pt-8">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">Enquire</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          The button opens an email to partners@dirtydecember.info with the details we need. You
          can also use the placement form on the List page.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <FeaturedEnquiryLink href={enquiryHref} placement="get-featured-email" className={button}>
            Email a featured enquiry
          </FeaturedEnquiryLink>
          <FeaturedEnquiryLink href="/list#place-ad" placement="get-featured-list" className={secondary}>
            Use the placement form
          </FeaturedEnquiryLink>
        </div>
      </section>

      {paystack || flutterwave ? (
        <section id="pay" className="mt-12 scroll-mt-36 border-t border-ink/10 pt-8">
          <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">Pay an agreed quote</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Only pay after we have agreed a written quote with you by email. Enter the amount and
            reference from that quote. The link opens the payment provider’s own page.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {paystack ? (
              <a href={paystack} target="_blank" rel="noopener noreferrer" className={secondary}>
                Pay with Paystack — leaves this site
              </a>
            ) : null}
            {flutterwave ? (
              <a href={flutterwave} target="_blank" rel="noopener noreferrer" className={secondary}>
                Pay with Flutterwave — leaves this site
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      <PublishedPlacements placements={placements} />

      <p className="mt-12 max-w-xl text-sm leading-7 text-muted">{disclaimer}</p>
    </main>
  );
}


function PublishedPlacements({
  placements,
}: {
  placements: { slug: string; name: string; url: string; offer: string | null; city: string | null }[];
}) {
  if (placements.length === 0) return null;
  return (
    <section className="mt-12 border-t border-ink/10 pt-8">
      <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">On the directory now</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
        Placements that have been checked and published. Each link opens the business or organiser page.
      </p>
      <ul className="mt-6 grid gap-3">
        {placements.map((row) => (
          <li key={row.slug} className="border border-ink/15 bg-chart px-5 py-4">
            <p className="font-display text-2xl leading-tight tracking-tight">{row.name}</p>
            {row.city || row.offer ? (
              <p className="mt-1 text-sm leading-7 text-muted">{[row.city, row.offer].filter(Boolean).join(". ")}</p>
            ) : null}
            <a
              href={row.url}
              className="mt-2 inline-flex text-sm underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Organiser or business page
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
