import Link from "next/link";
import { flightSearches, seasonSearchAirports, seasonSearchNote } from "../flights";
import { FlightBoard } from "./flight-board";

export function HomeFlights() {
  const flights = flightSearches.filter((flight) => seasonSearchAirports.includes(flight.airport));

  return (
    <section id="flights" className="scroll-mt-36 border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Flights</p>
            <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
              Search links
            </h2>
          </div>
          <Link href="/flights" className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide">
            All searches →
          </Link>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          These searches are for Murtala Muhammed, Accra, and Margaret Ekpo. The confirmed events name Lagos and Calabar.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          {seasonSearchNote} Each search opens outside this site. It is not a fare, a seat, or a booking.
        </p>
        <div className="mt-6">
          <FlightBoard flights={flights} />
        </div>
      </div>
    </section>
  );
}
