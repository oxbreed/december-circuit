import Link from "next/link";
import { disclaimer } from "../brand";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Privacy",
  description:
    "What dirtydecember.info collects, what it does not collect, and how to ask for access or deletion.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <p className="text-[11px] uppercase tracking-[0.28em] text-brass">Privacy</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        Privacy notice
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">{disclaimer}</p>
      <div className="mt-8 space-y-4 text-base leading-7 text-ink">
        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Who operates the site
        </h2>
        <p>
          Oxbreed Management operates dirtydecember.info. The footer credit is
          “Powered by Oxbreed Management.” and that credit links only to{" "}
          <a
            href="https://www.oxbreedmanagement.com"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            https://www.oxbreedmanagement.com
          </a>
          . Questions about this notice go to{" "}
          <a
            href="mailto:hello@dirtydecember.info"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            hello@dirtydecember.info
          </a>
          .
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          What you can do
        </h2>
        <p>
          You can read the sourced records, read the news page, save a trip in
          this browser, ask for a sign-in link, send a listing or a partnership
          note, and write a text review after you sign in. You can also email an
          enquiry. Booking links, ticket links, organiser pages, and flight
          searches open other sites. The map draws coordinates that are already
          listed.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          What is collected
        </h2>
        <p>
          Sign-in collects the email address you type. Supabase sends the
          sign-in link. When you open that link, Supabase sets a sign-in cookie
          in this browser so the site can tell that you are signed in. The admin
          page opens only when that signed-in email matches the admin address
          held on the server.
        </p>
        <p>
          A listing or partnership form, when the directory is connected, stores
          an unpublished submission. The submission holds your email, the fields
          on that form, and a public link that uses http or https. An event form
          also holds the event name, city, dates, and venue. A product form also
          holds the product name and the business name. A business placement also
          holds the business name. A transportation or booking offer also holds
          the business name and what they offer.
        </p>
        <p>
          The event form, the business placement, and the product form can
          include an optional jpeg, png, or webp picture of 4MB or smaller. The
          picture goes to a private storage bucket named submission-images. The
          upload does not put the picture, or the submission, on the public
          site. The status stays unpublished until a person checks it.
        </p>
        <p>
          If the directory is not connected, those buttons open an email instead
          of saving a row. Event mail goes to hello@dirtydecember.info. Placement
          and partnership mail goes to partners@dirtydecember.info.
        </p>
        <p>
          A review is text only, from a signed-in visitor, with no rating. The
          review stores that text and the id of the signed-in account. The
          public page shows the text. The site does not add sample reviews, and
          the reviews block stays hidden until a review is published.
        </p>
        <p>
          My trip is saved in this browser only. It stores the kind and id of an
          event or a place that is already listed. It is not an account, and
          that list is not sent to the server as a trip.
        </p>
        <p>
          An enquiry from the footer, or from a mail button, is an email. The
          addresses are hello@dirtydecember.info and partners@dirtydecember.info.
        </p>
        <p>
          The map asks your browser to load tiles from OpenStreetMap. A
          directions link opens OpenStreetMap. This site’s server reads the
          public entertainment feeds already used for the ticker. The news page
          shows the headlines and the pictures those feeds supply. Opening an
          item leaves this site. When a news item includes a picture address,
          your browser loads that picture from the address in the feed. This
          site does not store that picture.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          What is not collected
        </h2>
        <p>
          There is no advertising cookie. This site does not run an analytics
          script. A review has no rating. A newsletter, a fare, or a payment is
          not offered yet. If one is added, this notice will be updated before
          it starts.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Why</h2>
        <p>
          The email and the sign-in cookie are there so you can sign in and
          write a review, and so the admin page can stay closed to everyone
          else. A submission is stored so a person can check it before anything
          from it is considered for the public records. The picture is stored so
          that check can include the image you chose. A review is stored so the
          text can be shown on the site. My trip stays on the device so you can
          keep a list without an account. The map tiles are requested so the map
          can be drawn. The headlines are read so the ticker and the news page
          can show them. Enquiry mail is read so the operator can reply.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Who receives it
        </h2>
        <p>
          Oxbreed Management receives the submissions, pictures, reviews, and
          enquiry mail. The admin page can be opened only from the admin address
          held on the server. Supabase holds the database, the private pictures,
          and the sign-in. Vercel hosts the site and receives the request that
          loads a page. Enquiry mail is received at hello@dirtydecember.info and
          partners@dirtydecember.info. OpenStreetMap receives the request for a
          map tile or a directions page
          when you use the map. A ticket page, an organiser page, a flight
          search, or a news headline is received by the site you open. A news
          picture is requested from the address supplied in that feed. This
          directory does not send your email to those sites.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          How long it is kept
        </h2>
        <p>
          A submission, a picture, or a review is not deleted on a fixed
          schedule. They stay until you ask for deletion or the operator removes
          them. A review is removed if the signed-in account it belongs to is
          deleted. A picture is not given a public address by the upload. My
          trip stays in this browser until you remove the item or clear the site
          data for this browser. Signing out clears the sign-in cookie. Enquiry
          mail stays until it is deleted.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          How to ask for access or deletion
        </h2>
        <p>
          Email hello@dirtydecember.info from the address you used. Say whether
          you want a copy or deletion of the sign-in, the submission, the
          picture, or the review. The operator will use that address to find the
          matching row. If you are in Nigeria, you can also complain to the
          Nigeria Data Protection Commission. If you live elsewhere, you can
          contact the data protection authority for the place where you live.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Children</h2>
        <p>
          This directory is written for people planning a trip. It is not
          directed at children. It does not knowingly collect a child’s email,
          submission, picture, or review. If a child has sent one, email
          hello@dirtydecember.info and ask for it to be deleted.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Changes to this notice
        </h2>
        <p>
          If this notice changes, the new text will replace this page.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">Contact</h2>
        <p>
          Visitor enquiries, access requests, and deletion requests:{" "}
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
          . Acceptable use, picture rights, and liability are on the{" "}
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
