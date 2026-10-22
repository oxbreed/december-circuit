import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { disclaimer } from "../../brand";
import { citiesOnFile, cityBySlug, cityDescription } from "../../cities";
import { EventCard } from "../../components/event-card";
import { pageMetadata } from "../../site";

export function generateStaticParams() {
  return citiesOnFile().map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = cityBySlug(slug);
  if (!city) return { title: "City" };
  return pageMetadata({
    title: city.city,
    description: cityDescription(city),
    path: `/cities/${city.slug}`,
  });
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = cityBySlug(slug);
  if (!city) notFound();
  const description = cityDescription(city);

  return (
    <main
      id="top"
      className="mx-auto w-full max-w-6xl px-5 pt-28 pb-28 md:px-8 md:pt-36 lg:pb-16"
    >
      <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">
        {city.country}
      </p>
      <h1 className="mt-3 font-display text-5xl leading-none tracking-tight md:text-7xl">
        {city.city}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">{description}</p>

      {city.events.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-3xl tracking-tight">Confirmed events</h2>
          <div className="mt-5 grid gap-4">
            {city.events.map((event) => (
              <EventCard key={`${event.region}-${event.when}`} event={event} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-3xl tracking-tight">Organiser pages</h2>
        <ul className="mt-5 divide-y divide-ink/10 border border-ink/15 bg-chart">
          {city.places.map((place) => (
            <li
              key={`${place.category}-${place.name}`}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:px-5"
            >
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">
                  {place.category}
                </p>
                <p className="mt-1 font-display text-2xl leading-none break-words">
                  {place.name}
                </p>
              </div>
              <a
                href={place.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                Organiser page — leaves this site
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm leading-7 text-muted">
        <Link href="/places" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          All organiser pages
        </Link>
        {" · "}
        <Link href="/events" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Confirmed events
        </Link>
      </p>
      <p className="mt-6 max-w-xl text-sm leading-7 text-muted">{disclaimer}</p>
    </main>
  );
}
