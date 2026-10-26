import Link from "next/link";
import { places, type Place } from "../places";
import { placeTripId } from "../trip";
import { SaveTripButton } from "./save-trip-button";

const stayCategories = new Set(["Hotels", "Short-stay"]);

function staysByCity() {
  const groups: { country: string; city: string; rows: Place[] }[] = [];
  for (const place of places) {
    if (!stayCategories.has(place.category)) continue;
    let group = groups.find((item) => item.country === place.country && item.city === place.city);
    if (!group) {
      group = { country: place.country, city: place.city, rows: [] };
      groups.push(group);
    }
    group.rows.push(place);
  }
  const lagos = groups.findIndex((group) => group.country === "Nigeria" && group.city === "Lagos");
  if (lagos > 0) {
    const [first] = groups.splice(lagos, 1);
    groups.unshift(first);
  }
  return groups;
}

export function StaysByCity() {
  const groups = staysByCity();

  return (
    <section id="stays" className="scroll-mt-36 border-b border-ink/10 bg-paper-deep">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Stays</p>
            <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
              Stays by city
            </h2>
          </div>
          <Link href="/places" className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide">
            All places →
          </Link>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Hotels and short-stay by city, with Lagos first. Each name opens that hotel or short-stay’s
          own page — booking happens there, not here. Museums, ports, and regional stops stay on the
          places list. This site does not take payment.
        </p>
        {groups.length === 0 ? (
          <p className="mt-6 text-sm leading-7 text-muted">
            No stay places are listed.{" "}
            <a
              href="/list#submit-place"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              List a place
            </a>{" "}
            for review.
          </p>
        ) : (
          <div className="mt-6 grid gap-8">
            {groups.map((group) => (
              <section key={`${group.country}-${group.city}`}>
                <h3 className="font-display text-3xl leading-none tracking-tight">
                  {group.city}, {group.country}
                </h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {group.rows.map((place) => (
                    <article
                      key={`${place.category}-${place.name}`}
                      className="min-w-0 border border-ink/15 bg-chart p-4"
                    >
                      <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">{place.category}</p>
                      <h4 className="mt-2 font-display text-2xl leading-tight tracking-tight">{place.name}</h4>
                      {place.url ? (
                        <a
                          href={place.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                        >
                          Open their page — leaves this site
                        </a>
                      ) : (
                        <p className="mt-4 text-sm leading-6 text-muted">The link is not listed.</p>
                      )}
                      <div className="mt-3">
                        <SaveTripButton kind="place" id={placeTripId(place)} />
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
