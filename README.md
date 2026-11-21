# December Circuit

A directory of sourced December 2026 events, places with organiser pages, and Google Flights searches. The map shows only places that already have a coordinate. The public header reads dirtydecember.info. It is an independent community directory, not affiliated with Livespot360 or Detty December Fest™.

## Run locally

```bash
npm install
npm run dev
```

`npm install` syncs MapLibre’s worker into `public/maplibre-gl-worker.mjs` so maps load a same-origin worker (a CDN worker URL fails under Next with “Worker failed to load”). If MapLibre still fails to init or paint, the map frame shows a static OSM preview (from sourced coordinates only) and a **View as list** link to Places, Events, or Explore — never a blank “couldn’t load” shell. Append `?mapFallback=1` locally to force that UI.

## Event ingest (Tier-1)

Every 3 days, refresh confirmed events from the allowlisted organiser / official / named sources in `app/event-feeds.ts`:

```bash
npm run ingest:events
```

Writes `data/event-ingest/published.json` (merged into `app/events.ts` for home, `/events`, and `GET /api/events`) and `held.json` (incomplete or ambiguous items — not published). Never invents dates, prices, or booking URLs. Status: `GET /api/events/ingest`. Operator notes live with the project docs as `event-feed-ingest.md`.

## Read APIs

- `GET /api/events`
- `GET /api/events/ingest`
- `GET /api/places`
- `GET /api/places?category=Hotels`
- `GET /api/places?country=Nigeria&city=Lagos`
- `GET /api/flights`
- `GET /api/pins`
- `GET /api/news`
- `GET /api/geocode?name=&city=` (OpenStreetMap Nominatim lookup for unpublished place submissions; Lagos, Accra, or Calabar)
- `GET /api/poi?city=&kind=&q=` (OpenStreetMap Overpass map search for hotels, restaurants, short_stays, shops, car_rental, car_shops, clubs, landmarks in Lagos, Accra, or Calabar; optional Foursquare when `FOURSQUARE_API_KEY` is set; optional Google Places for lodging / restaurant / shopping / car / nightlife types when `GOOGLE_PLACES_API_KEY` or `GOOGLE_MAPS_API_KEY` is set server-side — never scrapes Google or Airbnb)

Pages: `/`, `/guide`, `/events`, `/events/[slug]`, `/cities/[slug]`, `/places`, `/explore`, `/flights`, `/map`, `/about`, `/news`, `/list`, `/get-featured`, `/faq`, `/privacy`, `/terms`, `/eula`, `/cookies`, `/disclosure`, `/guides/where-to-stay-lagos-december`. The home hero searches by a listed date and opens `/events?date=`. Visa and entry is on `/guide#entry`. Flight rows stay on `/flights`. Washington DC, Chicago, Dallas–Fort Worth, Amsterdam, and Dubai search 16 December 2026 to 30 December 2026, one adult. Those dates are a starting search for the season, not a fare. `sitemap.xml` and `robots.txt` list the public pages. `/explore` is map / third-party venue data, not checked directory listings.

Affiliate and paid links: partner hotel, flight, and tour searches (Trip.com, Agoda, Booking.com, Viator) go through `GET /go/<partner>?city=&country=&name=&from=`, which 302s to the partner and logs the click to `outbound_clicks` (migration `20261119120000_outbound_clicks.sql`, service role only, fails quietly). Affiliate IDs come from env vars (see `.env.example`); Trip.com and Viator also have in-code defaults, and other partners stay a plain search until their IDs are set. Ticket and paid-sponsor links keep their real URL and log clicks via `POST /api/analytics/outbound`. Paid placements live in `app/sponsors.ts`. Operator notes: `docs/affiliate-links.md`.

Site analytics: Vercel Web Analytics + Speed Insights in the root layout; optional first-party path/country page views for `/admin`. Operator notes: `docs/site-analytics.md`.

The pages load these routes. A place name opens that business’s own page stored on that record. `/list` accepts an unpublished place or business for human review and does not publish to the public pins file. A flight row opens its search and is labelled as a search. It is not a fare or a seat.

## Build

```bash
npm run build
```
