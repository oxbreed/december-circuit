import Link from "next/link";
import { disclaimer } from "../brand";
import { Breadcrumbs } from "../components/breadcrumbs";
import { JsonLd } from "../components/json-ld";
import { citiesOnFile } from "../cities";
import { breadcrumbJsonLd, citiesItemListJsonLd } from "../jsonld";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Cities — West Africa on file",
  description:
    "City pages for Lagos, Accra, Calabar, and every other West African city already listed — organiser pages and confirmed Detty December or season events on file.",
  path: "/cities",
});

export default function CitiesIndexPage() {
  const cities = citiesOnFile();
  const byCountry = new Map<string, typeof cities>();
  for (const city of cities) {
    const list = byCountry.get(city.country) ?? [];
    list.push(city);
    byCountry.set(city.country, list);
  }

  return (
    <main id="top" className="mx-auto w-full max-w-6xl px-5 pb-28 pt-28 md:px-8 md:pt-36 lg:pb-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Cities", path: "/cities" },
        ])}
      />
      <JsonLd data={citiesItemListJsonLd(cities)} />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Cities" },
        ]}
      />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-lagoon">On file</p>
      <h1 className="mt-3 font-display text-5xl leading-none tracking-tight md:text-7xl">
        Cities
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
        Every city already listed for Detty December planning and year-round West Africa
        tourism. Open a city for organiser pages and any confirmed events on file. Booking
        always leaves this site.
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
        <Link href="/events" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Confirmed events
        </Link>
        {" · "}
        <Link href="/places" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Organiser pages
        </Link>
        {" · "}
        <Link href="/map" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Map
        </Link>
        {" · "}
        <Link href="/guide" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Tourist guide
        </Link>
      </p>

      <div className="mt-12 grid gap-12">
        {[...byCountry.entries()].map(([country, rows]) => (
          <section key={country}>
            <h2 className="font-display text-3xl tracking-tight">{country}</h2>
            <ul className="mt-5 divide-y divide-ink/10 border border-ink/15 bg-chart">
              {rows.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/cities/${city.slug}`}
                    className="flex flex-col gap-1 px-4 py-4 hover:bg-paper sm:flex-row sm:items-baseline sm:justify-between sm:px-5"
                  >
                    <span className="font-display text-2xl leading-none tracking-tight">
                      {city.city}
                    </span>
                    <span className="text-sm text-muted">
                      {city.events.length > 0
                        ? `${city.events.length} confirmed ${
                            city.events.length === 1 ? "event" : "events"
                          } · `
                        : null}
                      {city.places.length} organiser{" "}
                      {city.places.length === 1 ? "page" : "pages"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-10 max-w-xl text-sm leading-7 text-muted">{disclaimer}</p>
    </main>
  );
}
