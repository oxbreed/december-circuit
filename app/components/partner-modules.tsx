import Link from "next/link";
import { partnerEarning } from "../affiliate-config";
import {
  clickEventFor,
  commissionLabel,
  goHref,
  partners,
  stayPartnerSlugs,
  type PartnerSlug,
} from "../affiliate-partners";
import { PartnerLink } from "./tracked-link";

/**
 * Labelled partner modules. A link goes through /go/<partner>. The
 * "We may earn a commission" label shows only when that partner's affiliate
 * IDs are set in this deployment; otherwise the link is a plain outbound
 * search and is labelled as such.
 */

const linkClass =
  "inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide";
const pillClass =
  "inline-flex border border-ink/20 bg-paper px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-ink hover:border-oxide hover:text-oxide";

export type CityRef = { city: string; country: string };

export const seasonCities: readonly CityRef[] = [
  { city: "Lagos", country: "Nigeria" },
  { city: "Accra", country: "Ghana" },
  { city: "Calabar", country: "Nigeria" },
];

function anyEarning(slugs: readonly PartnerSlug[]) {
  return slugs.some((slug) => partnerEarning(slug));
}

export function PartnerDisclosure({ earning, className = "mt-4" }: { earning: boolean; className?: string }) {
  return (
    <p className={`${className} text-[11px] leading-5 uppercase tracking-[0.12em] text-muted`}>
      {earning ? `${commissionLabel} if you book through these links · ` : "Partner search links · leaves this site · "}
      <Link href="/disclosure" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
        How links are labelled
      </Link>
    </p>
  );
}

function PartnerRow({
  slugs,
  city,
  country,
  name,
  placement,
  variant = "pill",
}: {
  slugs: readonly PartnerSlug[];
  city?: string;
  country?: string;
  name?: string;
  placement: string;
  variant?: "pill" | "link";
}) {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-3">
      {slugs.map((slug) => {
        const meta = partners[slug];
        return (
          <li key={slug}>
            <PartnerLink
              href={goHref(slug, { city, country, name, placement })}
              partner={slug}
              placement={placement}
              event={clickEventFor(meta.kind)}
              earning={partnerEarning(slug)}
              className={variant === "pill" ? pillClass : linkClass}
            >
              {meta.label}
            </PartnerLink>
          </li>
        );
      })}
    </ul>
  );
}

/** Hotel search on Trip.com, Agoda, and Booking.com for one or more cities. */
export function StayPartners({
  cities = seasonCities,
  placement,
  heading = "Search hotels on partner sites",
  className = "mt-8",
}: {
  cities?: readonly CityRef[];
  placement: string;
  heading?: string;
  className?: string;
}) {
  const earning = anyEarning(stayPartnerSlugs);
  return (
    <aside aria-label="Hotel search on partner sites" className={`${className} border border-ink/15 bg-chart px-5 py-6 md:px-6`}>
      <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">{earning ? "Partner links" : "Outbound search"}</p>
      <h3 className="mt-2 font-display text-2xl leading-none tracking-tight md:text-3xl">{heading}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
        Each link opens that site’s own hotel search for the city. Prices, availability, and
        booking are on their site, not here.
      </p>
      <div className="mt-2 grid gap-5">
        {cities.map((item) => (
          <div key={`${item.city}-${item.country}`}>
            <p className="mt-3 font-display text-xl leading-none tracking-tight">
              {item.city}, {item.country}
            </p>
            <PartnerRow slugs={stayPartnerSlugs} city={item.city} country={item.country} placement={placement} />
          </div>
        ))}
      </div>
      <PartnerDisclosure earning={earning} />
    </aside>
  );
}

/** Partner searches for one listed stay (hotel or short-stay place page). */
export function ListedStayPartners({
  name,
  city,
  country,
  placement,
}: {
  name: string;
  city: string;
  country: string;
  placement: string;
}) {
  const earning = anyEarning(stayPartnerSlugs);
  return (
    <section aria-label="Check this stay on partner sites" className="mt-10 border border-ink/15 bg-chart px-5 py-6">
      <h2 className="font-display text-2xl tracking-tight">Check dates on partner sites</h2>
      <p className="mt-2 text-sm leading-7 text-muted">
        Searches for “{name}” in {city}. The stay may or may not be listed there; prices and
        availability are on their site, not here.
      </p>
      <PartnerRow slugs={stayPartnerSlugs} name={name} city={city} country={country} placement={placement} />
      <PartnerDisclosure earning={earning} />
    </section>
  );
}

/** Trip.com flight search beside the Google Flights board. */
export function FlightPartners({ placement, className = "mt-8" }: { placement: string; className?: string }) {
  const slugs: PartnerSlug[] = ["tripcom-flights"];
  const earning = anyEarning(slugs);
  return (
    <aside aria-label="Flight search on partner sites" className={`${className} border border-ink/15 bg-chart px-5 py-6 md:px-6`}>
      <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">{earning ? "Partner link" : "Outbound search"}</p>
      <h3 className="mt-2 font-display text-2xl leading-none tracking-tight md:text-3xl">Book on a travel site</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
        The board above compares routes on Google Flights. To book, this link opens Trip.com’s
        flight search — fares and seats are on their site, not here.
      </p>
      <PartnerRow slugs={slugs} placement={placement} />
      <PartnerDisclosure earning={earning} />
    </aside>
  );
}

/** Viator tours and experiences search for one or more cities. */
export function ExperiencePartners({
  cities = seasonCities,
  placement,
  heading = "Tours and experiences",
  className = "mt-8",
}: {
  cities?: readonly CityRef[];
  placement: string;
  heading?: string;
  className?: string;
}) {
  const slugs: PartnerSlug[] = ["viator"];
  const earning = anyEarning(slugs);
  return (
    <aside aria-label="Tours and experiences on partner sites" className={`${className} border border-ink/15 bg-paper px-5 py-6 md:px-6`}>
      <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">{earning ? "Partner links" : "Outbound search"}</p>
      <h3 className="mt-2 font-display text-2xl leading-none tracking-tight md:text-3xl">{heading}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
        Opens Viator’s own search for the city. Tours, prices, and availability are on their
        site; this directory has not checked them.
      </p>
      <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-3">
        {cities.map((item) => (
          <li key={`${item.city}-${item.country}`}>
            <PartnerLink
              href={goHref("viator", { city: item.city, country: item.country, placement })}
              partner="viator"
              placement={placement}
              event="outbound_go"
              earning={partnerEarning("viator")}
              className={pillClass}
            >
              {item.city} on Viator
            </PartnerLink>
          </li>
        ))}
      </ul>
      <PartnerDisclosure earning={earning} />
    </aside>
  );
}
