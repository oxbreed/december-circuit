import { places } from "./places";

export default function Home() {
  const countries = [...new Set(places.map((place) => place.country))];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">December Circuit</h1>
      <p className="mt-4 max-w-xl text-lg leading-8">
        Confirmed events for December 2026. Dates below come from the organiser
        or a named news report, checked on 21 October 2026.
      </p>

      <h2 className="mt-10 text-2xl font-semibold">Lagos</h2>
      <ul className="mt-4 space-y-4 text-lg leading-8">
        <li>
          <span className="font-medium">17-19 December.</span> Davido, Oriade
          residency, three nights at the National Theatre, Iganmu.
        </li>
        <li>
          <span className="font-medium">18-30 December.</span> Detty December
          Fest. Wizkid on 18 December, DJ Tunez and Friends on 24 December,
          Tungba Christmas on 25 December. Other nights are still marked coming
          soon.{" "}
          <a href="https://dettydecfest.com/" className="underline">
            Organiser&apos;s page
          </a>
          .
        </li>
        <li>
          <span className="font-medium">20 December.</span> Flytime House of
          R&amp;B, Brandy, Eko Convention Centre.
        </li>
        <li>
          <span className="font-medium">21 December.</span> Coca-Cola Rhythm
          Unplugged, Lil Baby and Kehlani, Eko Convention Centre.
        </li>
        <li>
          <span className="font-medium">22-24 December.</span> Flytime Fest,
          Eko Convention Centre. Headliners for 2026 are still unannounced.
        </li>
        <li>
          <span className="font-medium">25 December.</span> Flytime Circle, Eko
          Convention Centre. The lineup is still unannounced.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold">Calabar</h2>
      <ul className="mt-4 space-y-4 text-lg leading-8">
        <li>
          <span className="font-medium">26-30 December.</span> Carnival
          Calabar. Theme: Rethinking Our Collective Destiny. Cultural Carnival
          on the 26th, Junior Carnival on the 27th, Parade of the Bands on the
          28th, Bikers Carnival on the 29th, street party on the 30th.{" "}
          <a
            href="https://www.carnival.crossriverstate.gov.ng/"
            className="underline"
          >
            Official page
          </a>
          .
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold">Ghana</h2>
      <ul className="mt-4 space-y-4 text-lg leading-8">
        <li>
          <span className="font-medium">1 December 2026 to 3 January 2027.</span>{" "}
          December in Ghana, under the Ghana Tourism Authority and the Black
          Star Experience. These season dates are official. Headliners are still
          unannounced.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold">Places</h2>
      <p className="mt-4 max-w-xl text-lg leading-8">
        132 places with an organiser page. Each name opens that page.
      </p>
      {countries.map((country) => {
        const inCountry = places.filter((place) => place.country === country);
        const cities = [...new Set(inCountry.map((place) => place.city))];
        return (
          <section key={country} className="mt-8">
            <h3 className="text-xl font-semibold">{country}</h3>
            {cities.map((city) => (
              <div key={city} className="mt-4">
                <h4 className="font-medium">{city}</h4>
                <ul className="mt-2 space-y-2 text-lg leading-8">
                  {inCountry
                    .filter((place) => place.city === city)
                    .map((place) => (
                      <li key={`${place.city}-${place.name}`}>
                        <a href={place.url} className="underline">
                          {place.name}
                        </a>
                        <span> · {place.category}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </section>
        );
      })}

      <p className="mt-10 max-w-xl text-lg leading-8">
        Booking stays on each organiser&apos;s own site. Maps and flight search
        links come next.
      </p>
    </main>
  );
}
