# December Circuit

A directory of sourced December 2026 events, places with organiser pages, and Google Flights searches. The map shows only places that already have a coordinate. The public header reads dirtydecember.info. It is an independent community directory, not affiliated with Livespot360 or Detty December Fest™.

## Run locally

```bash
npm install
npm run dev
```

## Read APIs

- `GET /api/events`
- `GET /api/places`
- `GET /api/places?category=Hotels`
- `GET /api/places?country=Nigeria&city=Lagos`
- `GET /api/flights`
- `GET /api/pins`
- `GET /api/news`

Pages: `/`, `/guide`, `/events`, `/events/[slug]`, `/cities/[slug]`, `/places`, `/flights`, `/map`, `/about`, `/news`, `/privacy`, `/terms`, `/eula`. The home hero searches by a listed date and opens `/events?date=`. Visa and entry is on `/guide#entry`. Flight rows stay on `/flights`. Washington DC, Chicago, Dallas–Fort Worth, Amsterdam, and Dubai search 16 December 2026 to 30 December 2026, one adult. Those dates are a starting search for the season, not a fare. `sitemap.xml` and `robots.txt` list the public pages.

The pages load these routes. A place name opens the organiser page stored on that record. A flight row opens its search and is labelled as a search. It is not a fare or a seat.

## Build

```bash
npm run build
```
