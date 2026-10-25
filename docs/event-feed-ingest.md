# Regional event feed ingest

Automated Tier-1 ingest for DirtyDecember (`oxbreed/december-circuit`). Extends `app/events.ts` / `GET /api/events` — no CMS.

## Hard rules

- Never invent events, prices, fares, dates, or booking URLs.
- Fetch only the allowlist in `app/event-feeds.ts` (organiser / official / named reports already used on the directory).
- Entertainment RSS in `app/news-feeds.ts` feeds the news ticker only — it does **not** publish events.
- Incomplete or ambiguous items go to `data/event-ingest/held.json` (unpublished / for review).
- Outbound booking links only. Ticket pages confirm that a collection opens; prices are never stored.
- UGC stays pended. Google Places hotels stay optional and untouched.

## Cadence

Align with directory prefs: **recheck every 3 days**.

```bash
npm run ingest:events
```

Writes:

| File | Role |
| --- | --- |
| `data/event-ingest/published.json` | Complete rows merged into the public list |
| `data/event-ingest/held.json` | Held for review |
| `data/event-ingest/last-run.json` | Full run report |

`app/events.ts` merges **seed** + **published.json**. A failed fetch never deletes a seed row. Home, `/events`, city pages, and `GET /api/events` all read that merged list. Explore links to the same Events directory. Status: `GET /api/events/ingest`.

## Sources wired

| Id | URL | Auto vs held |
| --- | --- | --- |
| `oriade-residency` | https://www.dmwhq.com/residency | **Auto** when Dec 17–19 + National Theatre + Oriadé are present. Davido only if the page HTML states it. |
| `detty-december-fest` | https://dettydecfest.com/ | **Auto** 18–30 December Lagos window + named nights when present. |
| `detty-december-tickets` | https://tix.dot360.co/org/livespot/detty-december | **Auto** attaches outbound `ticketsUrl` only (no fares). |
| `rhythm-unplugged-stylerave` | Style Rave Rhythm Unplugged 2026 | **Auto** when 21 Dec + Eko + Lil Baby + Kehlani are all stated. |
| `flytime-house-rb-essence` | Essence Brandy / House of R&B | **Auto** only when the article fetches and states House of R&B + Brandy + 20 Dec. HTTP 403 → **held**; seed row kept. Not a source for Fest/Circle. |
| `flytime-fest-home` | https://www.flytimefest.com/ | **Probe / held.** Homepage does not name 2026 nights. Flytime Fest + Circle stay seed-only until DD-2 has a solid organiser page. |
| `carnival-calabar` | https://www.carnival.crossriverstate.gov.ng/ (+ schedule JS chunk) | **Auto** peak rollup 26–30 Dec when Cultural / Junior / Parade / Bikers / Nyoro (and theme when present) are on the official schedule. **All other schedule rows held** for review (light editorial — no auto-flood). |
| `december-in-ghana-myjoy` | MyJoyOnline GTA calendar | **Auto** season dates 1 Dec 2026 – 3 Jan 2027 when stated. |
| `december-in-ghana-official` | https://decemberingh.com/ | **Probe / held** until the official page states 2026 dates. |
| `ghana-tourism-black-star` | https://ghana.travel/black-star-experience | **Probe / held** (often HTTP 403; dates not published from this URL alone). |

Provider APIs (Ticketmaster, Merpi/Syticks, JamBase, GetYourGuide) stay disconnected — see `docs/api-sources.md` in-repo notes / project `api-sources.md`.

## What is auto vs held

**Auto-publish** — required fields present in the source: region, `when`, summary facts only as stated, source URL + label, optional `ticketsUrl` when the collection page opens. Each published row gets `sourceId`.

**Held** — fetch failures; probe-only pages; Flytime Fest / Circle without an organiser page that names that night; individual Carnival Calabar schedule line-items beyond the peak rollup; any extractor miss.

## First-slice run (25 Oct 2026)

- Published from ingest: Oriade, Detty Fest (+ tickets URL), Rhythm Unplugged, Carnival peak rollup, December in Ghana (MyJoyOnline).
- Held: Essence House of R&B refresh (HTTP 403), flytimefest.com probe, decemberingh.com / ghana.travel probes, Flytime Fest + Circle (DD-2), ~56 Carnival schedule rows for review.
- Seed keeps House of R&B, Flytime Fest, and Flytime Circle on the public list until a stronger source replaces them — ingest does not invent replacements.
