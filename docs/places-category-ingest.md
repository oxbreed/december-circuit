# Places category auto-ingest (Explore)

Operator summary for Ox Management. Canonical detail (tags, auto vs held, Google optional) lives in the project store as `places-category-ingest.md`.

## Live Explore kinds

`hotels`, `restaurants`, `short_stays`, `shops`, `car_rental`, `car_shops`, `clubs`, `landmarks` — Lagos / Accra / Calabar.

- **Primary:** OSM Overpass tag filters in `app/poi.ts`.
- **Optional Google** (`GOOGLE_PLACES_API_KEY`): lodging, restaurant, extended_stay_hotel, shopping types, car_rental, car_dealer/car_repair, clubs (`night_club` / `bar`) — with attribution. Not landmarks. Not an Airbnb scrape.
- **Clubs:** Overpass `amenity=nightclub|bar|pub|biergarten` + `leisure=dance`; `/categories/clubs` (+ Bars → same Explore kind).
- **Optional Foursquare** (`FOURSQUARE_API_KEY`): kinds with mapped category IDs.
- **Directory:** `/categories/*` hubs from `app/explore-categories.ts` (Shopping / Car shops / Landmarks crawlable without inventing `places.ts` rows).

Explore stays map / third-party data. Curated pins stay sourced-only. Event ingest unchanged. UGC pended.
