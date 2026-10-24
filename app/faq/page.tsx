import Link from "next/link";
import { disclaimer } from "../brand";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Plain answers for diaspora visitors planning three to fourteen days in Lagos, Accra, and Calabar.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <p className="text-[11px] uppercase tracking-[0.28em] text-brass">FAQ</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        FAQ
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">{disclaimer}</p>
      <div className="mt-8 space-y-4 text-base leading-7 text-ink">
        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          What is dirtydecember.info?
        </h2>
        <p>
          An independent community directory of sourced December 2026 events,
          organiser pages, places, and flight searches. The home page opens on
          confirmed dates, stays by city, flight search links, entertainment
          headlines, and a trip list saved in this browser. Cities outside Lagos
          stay on the list.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Are you affiliated with Detty December Fest or Livespot360?
        </h2>
        <p>
          No. This is an independent community directory. It is not affiliated
          with Livespot360 or Detty December Fest™. A Detty December Fest record
          can still appear when an organiser page or a named report confirms it,
          the same way any other sourced listing does.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          How do events get on the site?
        </h2>
        <p>
          A listing appears only when an organiser page or a named report
          confirms it. Dates come from that organiser page or that report. Every
          listed event shows when it was checked when that field exists. An
          organiser page or a news report can change after the record was
          checked.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Why do some nights say they are not listed yet?
        </h2>
        <p>
          If a night is not confirmed on an organiser page or in a named news
          report, it is left out. When an organiser page still marks other
          nights as coming soon, that is what the listing repeats. A negative
          claim such as “unannounced” needs the organiser’s own page.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Does this site sell tickets or take payment?
        </h2>
        <p>
          No. This site takes no payment and holds no bookings. A ticket link
          appears only when the record already has one, and that link leaves
          this site. A stay link and a flight search are not a purchase here
          either.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          How do flight searches work?
        </h2>
        <p>
          Each row on Flights opens a Google Flights search. It is a search, not
          a fare, a seat, or a booking. No booking is held on this site. Some
          origin cities use a dated December search window noted on that page;
          those dates are a starting search for the season.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Where do I check visas and entry?
        </h2>
        <p>
          Open{" "}
          <Link
            href="/guide#entry"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            Visa and entry
          </Link>{" "}
          in the guide. Lagos and Calabar are in Nigeria. Accra is in Ghana. The
          guide repeats the linked Nigeria Immigration Service and Ghana
          Immigration Service pages and does not take a visa application or a
          payment. Read those official links for the current rules.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          How do hotels and short stays work here?
        </h2>
        <p>
          Hotels and short-stay names on the home page and in the guide open that
          place’s own organiser page. Museums, ports, and other places stay on
          the places list the same way. This site does not take payment.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          How does the map work?
        </h2>
        <p>
          The map shows only places that already have a sourced coordinate. Pins
          draw on OpenStreetMap. Directions open an external map from that
          point.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          What is My trip?
        </h2>
        <p>
          Save an event or a place from this directory. The list under Plan your
          trip stays in this browser only. It is not an account. Each row shows
          the name and the link already stored on that record.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          How do I list an event or a place?
        </h2>
        <p>
          Use{" "}
          <Link
            href="/list"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            List an event
          </Link>
          . An event or a show stays unpublished until a person checks it.
          Visitor listing mail goes to{" "}
          <a
            href="mailto:hello@dirtydecember.info"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            hello@dirtydecember.info
          </a>
          . Labeled placements, product ads, and partnership notes go to{" "}
          <a
            href="mailto:partners@dirtydecember.info"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            partners@dirtydecember.info
          </a>
          . Those placements are labeled, and this site does not take payment.
        </p>

        <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
          Who do I contact?
        </h2>
        <p>
          Visitor enquiries:{" "}
          <a
            href="mailto:hello@dirtydecember.info"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            hello@dirtydecember.info
          </a>
          . Partnership and placement:{" "}
          <a
            href="mailto:partners@dirtydecember.info"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            partners@dirtydecember.info
          </a>
          . Privacy, terms, and the EULA are linked in the footer.
        </p>
      </div>
    </main>
  );
}
