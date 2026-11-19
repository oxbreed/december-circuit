import Link from "next/link";
import { disclaimer } from "../../brand";
import { JsonLd } from "../../components/json-ld";
import { ExperiencePartners, StayPartners } from "../../components/partner-modules";
import { PlaceOutboundLoadMore } from "../../components/place-load-more";
import { OutboundLink, SeasonGuideShell } from "../../components/season-guide-chrome";
import { breadcrumbJsonLd } from "../../jsonld";
import { airbnbCitySearches, airbnbSearchNote } from "../../outbound-airbnb";
import { categorySlug } from "../../place-catalog";
import { lagosEventsOnFile, lagosStayPlaces } from "../../season-guides";
import { pageMetadata } from "../../site";

const path = "/guides/where-to-stay-lagos-december";
const lagos = { city: "Lagos", country: "Nigeria" } as const;
const linkClass = "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

export const metadata = pageMetadata({
  title: "Where to stay in Lagos in December",
  description:
    "Where to stay in Lagos for Detty December 2026: hotels and short-stays already listed on dirtydecember.info, labelled hotel searches on Trip.com, Agoda and Booking.com, and Airbnb’s Lagos search. No invented prices or availability.",
  path,
  type: "article",
});

export default function WhereToStayLagosDecemberPage() {
  const stays = lagosStayPlaces();
  const hotels = stays.filter((place) => place.category === "Hotels").length;
  const shortStays = stays.filter((place) => place.category === "Short-stay").length;
  const lagosEvents = lagosEventsOnFile();
  const airbnbLagos = airbnbCitySearches.find((item) => item.city === "Lagos");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: "Where to stay in Lagos in December", path },
        ])}
      />
      <SeasonGuideShell
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides" },
          { name: "Where to stay in Lagos" },
        ]}
        kicker="Lagos · stays · December 2026"
        title={
          <>
            Where to stay in Lagos <span className="italic text-oxide">in December</span>
          </>
        }
        lede={
          <>
            Hotels and short-stays already listed on this directory, then labelled searches on
            hotel booking sites. Prices, availability, and booking are on those sites, not here.{" "}
            {disclaimer}
          </>
        }
        currentPath={path}
      >
        <section className="mt-12">
          <h2 className="font-display text-3xl tracking-tight">Stays on file in Lagos</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            {stays.length === 0
              ? "No Lagos hotels or short-stays are listed yet."
              : `${hotels} hotel${hotels === 1 ? "" : "s"} and ${shortStays} short-stay${shortStays === 1 ? "" : "s"} listed for Lagos. Each name opens that stay’s own page.`}{" "}
            <Link href={`/categories/${categorySlug("Hotels")}`} className={linkClass}>
              Hotels
            </Link>
            {" · "}
            <Link href={`/categories/${categorySlug("Short-stay")}`} className={linkClass}>
              Short-stay
            </Link>
          </p>
          {stays.length > 0 ? <PlaceOutboundLoadMore places={stays} noun="stay pages" /> : null}
        </section>

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">Search hotels for your dates</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            December is the busy season for Lagos events on this directory, so check dates early on
            the booking site you prefer.
          </p>
          <StayPartners cities={[lagos]} placement="stay-lagos-guide" heading="Lagos hotel search" className="mt-6" />
        </section>

        {airbnbLagos ? (
          <section className="mt-14 border-t border-ink/10 pt-10">
            <h2 className="font-display text-3xl tracking-tight">Homes and apartments</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{airbnbSearchNote}</p>
            <p className="mt-4">
              <OutboundLink href={airbnbLagos.url}>Airbnb — Lagos, Nigeria</OutboundLink>
            </p>
          </section>
        ) : null}

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">Plan around the dates</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            {lagosEvents.length > 0
              ? `${lagosEvents.length} Lagos event${lagosEvents.length === 1 ? "" : "s"} on file. Pick your nights first, then book the stay.`
              : "Pick your nights first, then book the stay."}
          </p>
          <p className="mt-4 text-sm leading-7">
            <Link href="/events?city=Lagos" className={linkClass}>
              Lagos events
            </Link>
            {" · "}
            <Link href="/guides/lagos-december-2026" className={linkClass}>
              Lagos December 2026 guide
            </Link>
            {" · "}
            <Link href="/flights" className={linkClass}>
              Flights to Lagos
            </Link>
            {" · "}
            <Link href="/guide#around" className={linkClass}>
              Getting around
            </Link>
          </p>
          <ExperiencePartners cities={[lagos]} placement="stay-lagos-guide-tours" heading="Things to do in Lagos" />
        </section>
      </SeasonGuideShell>
    </>
  );
}
