import Link from "next/link";
import { disclaimer } from "../brand";
import { pageMetadata } from "../site";
import { JsonLd } from "../components/json-ld";
import { breadcrumbJsonLd } from "../jsonld";

export const metadata = pageMetadata({
  title: "Privacy",
  description:
    "What dirtydecember.info collects, what it does not collect, and how to ask for access or deletion.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }])} />
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
            href="https://oxbreedstudio.com"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            https://oxbreedstudio.com
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
          note, leave private feedback, and rate an event or place after you sign in. You can also email an
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
          also holds the event name, city, dates, and venue. A place or business
          form also holds the name, city, category, optional note, and any
          OpenStreetMap coordinates you chose from Find on the map. A product
          form also holds the product name and the business name. A business
          placement also holds the business name. A transportation or booking
          offer also holds the business name and what they offer.
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
          of saving a row. Event, place, and business mail goes to
          hello@dirtydecember.info. Placement and partnership mail goes to
          partners@dirtydecember.info.
        </p>
        <p>
          When you rate an event or place, we store your star score, the listing
          and your account ID so you can update your rating. Other visitors can
          see the average score and the number of ratings.
        </p>
        <p>
          My trip is saved in this browser only. It stores the kind and id of an
          event or a place that is already listed. It is not an account, and
          that list is not sent to the server as a trip.
        </p>
        <p>
          An enquiry from the footer, or from a mail button, is an email. The
          addresses are hello@dirtydecember.info and partners@dirtydecember.info.
          A support message or site feedback stores your name, email address,
          chosen topic, message, and the path of the page you were on, so the
          team can read it in the admin Support inbox and reply by email. Those
          messages are not published on the public site.
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
        <p>
          Site monitoring uses Vercel Web Analytics and Vercel Speed Insights,
          but only after you accept analytics in the cookie banner. Reject is as
          easy as Accept, and you can change your choice later with Cookie
          settings in the footer. Those tools measure page views, rough location
          by country, devices, and Core Web Vitals. Vercel states that Web Analytics stores
          anonymised data and does not use advertising cookies for that
          product. A separate first-party page-view record may also store the
          path you opened, an optional referrer, a short browser user-agent
          string, and a two-letter country code taken from the hosting edge
          (for example <code>x-vercel-ip-country</code>). The browser may also
          send Core Web Vitals samples (LCP, INP, CLS) with the path and an
          optional country code so the signed-in admin page can show performance
          numbers. Those first-party records do not store your IP address and
          do not set an advertising cookie. Google Analytics runs only if the
          operator has set a measurement id in the server environment and you
          have accepted analytics; it is off by default.
        </p>
        <p>
          Some outbound links are affiliate links or paid placements, and they
          are labelled. A partner link goes through a first-party address that
          starts with <code>/go/</code> before it opens the partner’s site. When
          you click a partner, ticket, or paid link, and only if you have accepted analytics, the site may record which
          partner or listing it was, the page the link sat on, the referring
          site’s host name, a two-letter country code from the hosting edge, and
          the time. Vercel Web Analytics may also count the click as an event.
          This click record does not store your IP address and this site does
          not set a cookie for it. The partner’s own site may set its own
          cookies after you arrive; its own notices apply there. See the{" "}
          <Link
            href="/disclosure"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            disclosure
          </Link>{" "}
          and the{" "}
          <Link
            href="/cookies"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            cookie notice
          </Link>
          .
        </p>
        <p>
          An organiser or business that agrees a paid placement pays through
          the payment provider’s own page (Paystack or Flutterwave) or an
          invoice. Card and bank details go to that provider, not to this site.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          What is not collected
        </h2>
        <p>
          There is no advertising cookie from this directory’s own code. A
          review has no rating. A newsletter is not offered, and no fare,
          ticket, or room is sold on this site. If a newsletter is added, this
          notice will be updated before it starts. First-party visit and click
          rows do not store your IP address.
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
          can show them. Enquiry mail is read so the operator can reply. A message left
          through Ask support is stored so the operator can reply from the
          admin inbox. Visit
          and performance data are collected so Oxbreed Management can see
          whether the site loads well, which pages are used, and roughly which
          countries readers come from. Click counts on partner, ticket, and paid
          links are kept so the operator can report clicks to affiliate partners
          and to organisers who paid for a placement.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Who receives it
        </h2>
        <p>
          Oxbreed Management receives the submissions, pictures, reviews,
          enquiry mail, and messages left through Ask support. The admin page can
          be opened only from the admin address held on the server. Supabase
          holds the database, the private pictures, the sign-in, support
          messages, and any first-party page-view and click rows. Vercel hosts the site,
          receives the request that loads a page, and processes Web Analytics
          and Speed Insights. Enquiry mail is received at hello@dirtydecember.info and
          partners@dirtydecember.info. Replies to Ask support messages are sent
          from those addresses. OpenStreetMap receives the request for a
          map tile or a directions page when you use the map, and Nominatim
          receives the place name and city when you use Find on the map on the
          listing form. A ticket page, an organiser page, a flight search, or a
          news headline is received by the site you open. A news picture is
          requested from the address supplied in that feed. This directory does
          not send your email to those sites. If Google Analytics is enabled,
          Google receives the measurement events for that product.
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
          mail stays until it is deleted. A message left through Ask support
          stays until you ask for deletion or the operator removes it.
          First-party page-view and Web Vitals
          rows are removed after about ninety days. Vercel Analytics and Speed
          Insights follow Vercel’s retention for those products.
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
