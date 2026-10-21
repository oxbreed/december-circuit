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

Pages: `/`, `/events`, `/places`, `/flights`, `/map`, `/about`. The home page shows the confirmed events, city entry points, a map band, and one outbound search per airport. The full place list stays on `/places`.

The pages load these routes. A place name opens the organiser page stored on that record. A flight row opens its search and is labelled as a search. It is not a fare or a seat.

## Build

```bash
npm run build
```
