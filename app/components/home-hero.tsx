import Link from "next/link";
import { disclaimer } from "../brand";
import { events } from "../events";
import { landmarks } from "../landmarks";
import { LandmarkFrame } from "./landmark-frame";

function listedDates() {
  const dates: string[] = [];
  for (const event of events) {
    if (!dates.includes(event.when)) dates.push(event.when);
  }
  return dates;
}

export function HomeHero() {
  const dates = listedDates();
  const first = landmarks[0];

  return (
    <section className="overflow-x-clip px-4 pb-6 pt-[4.5rem] sm:px-6 lg:px-8 lg:pt-[8.25rem]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link
            href="/visa"
            className="inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            Visa and entry
          </Link>
          <Link
            href="/detty-december"
            className="inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            Detty December hub
          </Link>
          <Link
            href="/west-africa"
            className="inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            West Africa year-round
          </Link>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)] lg:items-end lg:gap-8">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.32em] text-lagoon">December 2026</p>
            <h1 className="mt-2 font-display text-[2.7rem] leading-[0.9] tracking-tight text-ink sm:text-6xl">
              Detty <span className="italic text-oxide">December</span>
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">
              Sourced parties, festivals, and season dates for Lagos, Accra, Calabar, and West
              Africa — pick a listed date. Booking links leave this site.
            </p>
            <form
              action="/events"
              method="get"
              role="search"
              className="mt-5 flex w-full min-w-0 flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="date" className="sr-only">
                Date
              </label>
              <div className="w-full min-w-0 sm:flex-1">
                <select id="date" name="date" required defaultValue="" className="ledger-input ledger-select text-base">
                  <option value="" disabled>
                    Choose a listed date
                  </option>
                  {dates.map((when) => (
                    <option key={when} value={when}>
                      {when}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full shrink-0 bg-lagoon px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-chart sm:w-auto"
              >
                Search
              </button>
            </form>
            <p className="mt-4 max-w-xl text-[11px] leading-5 text-muted">{disclaimer}</p>
          </div>
          {first ? (
            <LandmarkFrame
              firstSlide={
                <img
                  src={first.src}
                  alt={`${first.name}, ${first.city}${first.credit ? `. ${first.credit}` : ""}`}
                  width={960}
                  height={540}
                  decoding="async"
                  fetchPriority="high"
                  className="h-16 w-full object-cover lg:h-52"
                />
              }
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
