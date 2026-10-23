import Link from "next/link";
import { disclaimer } from "../brand";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Terms",
  description:
    "Acceptable use of this independent directory, including submissions, reviews, outbound links, and liability.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <p className="text-[11px] uppercase tracking-[0.28em] text-brass">Terms</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        Terms of use
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">{disclaimer}</p>
      <div className="mt-8 space-y-4 text-base leading-7 text-ink">
        <p>
          Oxbreed Management operates dirtydecember.info. The footer credit is
          “Powered by Oxbreed
          Management.” and that credit links only to{" "}
          <a
            href="https://www.oxbreedmanagement.com"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            https://www.oxbreedmanagement.com
          </a>
          .
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          What you can do
        </h2>
        <p>
          You can read the sourced records, read the news page, follow an
          outbound link, save a trip in this browser, sign in, send an
          unpublished listing or partnership note, and write a text review after
          you sign in. What the site
          collects, and how to ask for access or deletion, is on the{" "}
          <Link
            href="/privacy"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            privacy notice
          </Link>
          .
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Acceptable use
        </h2>
        <p>
          Use the site for that directory. Send a listing, a review, or an
          enquiry that you mean. Do not send unlawful material, a picture you
          have no right to send, or another person’s contact details without a
          proper reason. Do not present an unpublished submission as a listing
          that is already on the public site. Do not interfere with the site or
          with another person’s sign-in.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Submissions and picture rights
        </h2>
        <p>
          You confirm that the words you send are yours to send, and that any
          picture is yours or you have permission to send it. You allow Oxbreed
          Management to store the submission and, where the form has one, the
          picture, and to show them to the person who checks the directory.
        </p>
        <p>
          An optional picture may be a jpeg, png, or webp of 4MB or smaller. It
          is stored in the private submission-images bucket. The upload does not
          place the picture on the public site. The submission status stays
          unpublished until a person checks it. Saving the form does not publish
          the listing. A public record is a separate edit of the records on
          file.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Reviews</h2>
        <p>
          A review is text only, from a signed-in visitor, with no rating. No
          reviews are on file. You are responsible for the words you submit. The
          operator may remove a review that breaks these terms, or that the law
          requires to be removed.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Outbound links
        </h2>
        <p>
          Booking links and flight searches are outbound links. Ticket links and
          organiser pages also leave this site. The other site’s own terms apply
          once you leave. The news page shows headlines and pictures supplied by
          the public feeds already used for the ticker. Opening an item leaves
          this site. A newsletter, a fare, or a payment is not offered yet. If
          one is added, these terms will be updated before it is offered.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Labeled placements
        </h2>
        <p>
          Paid placements are labeled. No sponsor is on file. A placement or
          partnership form is a request to be checked. It does not by itself buy
          a place on the page.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">My trip</h2>
        <p>My trip is saved in the browser only. It is not an account.</p>

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
          here. These terms do not exclude liability that the law of the Federal
          Republic of Nigeria does not allow to be excluded.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Law</h2>
        <p>
          These terms are governed by the law of the Federal Republic of Nigeria.
          The directory is for Nigeria and for other places in West Africa. A
          mandatory right that applies where you live still applies.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Changes</h2>
        <p>
          If these terms change, the new text will replace this page.
        </p>

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
          .
        </p>
      </div>
    </main>
  );
}
