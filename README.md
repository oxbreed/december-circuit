# December Circuit

A directory of sourced December 2026 events, places with organiser pages, and Google Flights searches. The map shows only places that already have a coordinate.

## Run locally

```bash
npm install
npm run dev
```

## Read APIs

- `GET /api/events`
- `GET /api/places`
- `GET /api/places?category=Hotels`
- `GET /api/flights`
- `GET /api/pins`

The pages load these routes. A place name opens the organiser page stored on that record. A flight row opens its search and is labelled as a search. It is not a fare or a seat.

## Build

```bash
npm run build
```
