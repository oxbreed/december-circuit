# HANDOFF: oxbreed/december-circuit

Dirty December (also called Detty December) public site. Public header reads dirtydecember.info. It is an independent community directory of sourced December 2026 events, places, and flight searches. It is not affiliated with Livespot360 or Detty December Fest.

Repo: https://github.com/oxbreed/december-circuit (public, default branch `main`)
Live: https://dirtydecember.info
Vercel project URL: https://december-circuit.vercel.app

This repo already lives on GitHub. There is no Cursor-only copy to move. The Cursor project "Detty December" (agent `bc-aa1b93a3-f582-4f2b-ae0a-68ba0a60dc29`) uses this GitHub repo; its `cursor/*` branches are already on the remote.

## Stack

- Next.js 16.4.6 (App Router), React 19.3, TypeScript, Tailwind CSS 4
- MapLibre (same-origin worker synced on `npm install`)
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`) for auth, admin review, My Trip sync, optional first-party analytics
- Vercel Web Analytics + Speed Insights
- Event ingest via `npm run ingest:events` (allowlisted organiser sources only)

## Hosting and deploy

- Vercel production, custom domain dirtydecember.info
- `main` is the production branch
- Inbox hello@dirtydecember.info is on Zoho Mail (mail.zoho.uk)

## Current state (as of 20 Nov 2026, morning UK time)

`main` is at `02a159a5` (merged 20 Nov 2026, 08:43 UK time).

Merged today (UK time):

- PR #2, merged 08:32: fix empty space below the footer, point the publisher credit at oxbreedstudio.com, remove dead Gozem links (`fix/footer-empty-space`).
- PR #3, merged 08:43: upgrade Next.js and eslint-config-next from 16.4.2 to 16.4.6 after the post-#2 production deploy failed. Vercel was blocking Next 16.4.2 (Nov 2026 vulnerable range 16.0.0–16.4.4). `experimental.agentUpgrade` is `"security"`. Confirm the live production deploy is this commit, not the failed 16.4.2 deploy (`dpl_8iDH8PAyD1XEHskSuorMDs6gsTQe`).

Recent `main` work (17–18 Nov 2026) also includes homepage hub photos, guest trip planning, My Trip in the header, and a Lagos/Accra night carousel.

## Open PRs and important branches

Open:

- PR #1 (open, not draft): [Revenue: affiliate links, stays placements, disclosure and Get featured](https://github.com/oxbreed/december-circuit/pull/1). Head `revenue-affiliates` (`1cfd19b8`), opened 19 Nov 2026, 22:09 UK time. Unmerged. Adds `/go/<partner>` 302 redirects with server-side affiliate IDs and click logging, stays placements, `/disclosure`, `/cookies`, `/get-featured` (no prices), legal wording, and labelled partner modules. Homepage redesign and the other audit fixes (security headers, ARIA, contrast, ticker) are intentionally not in this PR. Because #2 and #3 have since landed on `main`, rebase or update the branch before merge. `mergeable_state` was `unknown` when last read; do not merge blindly.

Useful leftover branches already on GitHub (do not treat as missing Cursor work): `chore/next-security-upgrade`, `fix/footer-empty-space`, and many `cursor/*` branches (admin analytics, events filters, explore/places, footer, maps, SEO, Supabase UGC, West Africa hub, and others). Cleanup is optional.

## Key decisions

- Independent community directory; never imply official Detty December Fest or Livespot360 affiliation.
- Never invent dates, prices, or booking URLs. Ingest writes complete items to `data/event-ingest/published.json` and incomplete items to `held.json`.
- Explore/map data is OpenStreetMap Overpass + Nominatim. Foursquare and Google Places are optional, server-side only. Do not scrape Google Maps or Airbnb.
- Flight rows are labelled searches (not fares or seats). Season search dates for some origin cities are 16–30 Dec 2026, one adult, starting search only.
- `/list` accepts unpublished submissions for human review and does not auto-publish.
- Affiliate work stays isolated in PR #1. Affiliate IDs live in env vars only; `/go/` must not become an open redirect. "We may earn a commission" only when that partner's IDs are set. Airbnb stays a plain non-partner link.
- Applications were drafted (not necessarily approved) for Trip.com, Agoda, Booking.com via CJ, and Viator.

## Known issues

- PR #1 is still unmerged and almost certainly needs a rebase onto post-#3 `main`.
- Confirm Vercel production is actually on Next 16.4.6 / `02a159a5`.
- Cursor cloud agents historically could not access this repo; a user-pasted GitHub token was used to open PR #1 (stored at `/home/box/.secrets/gh_december_circuit`; the user was advised to revoke it). Prefer a fresh, scoped token or GitHub App for Copilot.
- Optional partner and routing keys may be unset; the site is designed to work without them.

## Env vars (names only)

From `.env.example` on `main` (do not commit values):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (aliases: `SUPABASE_URL`, `SUPABASE_ANON_KEY`)
- `TRIP_DATABASE_URL` (optional; otherwise follows the Supabase URL)
- `ADMIN_EMAILS` (comma-separated; `ADMIN_EMAIL` is still read as a single address). If neither is set, `oxbreedmanagement@gmail.com` is the default allowlist.
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `WP_PROBE_INGEST_SECRET` (server only)
- `SITE_PAGEVIEWS_ENABLED` (optional)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional; off unless deliberately enabled)
- `TICKETMASTER_API_KEY`, `JAMBASE_API_KEY`, `MERPI_API_KEY`, `GETYOURGUIDE_API_KEY`
- `FOURSQUARE_API_KEY`, `GOOGLE_PLACES_API_KEY` (alias `GOOGLE_MAPS_API_KEY`)
- `OVERPASS_URL`, `NOMINATIM_URL`
- `OPENROUTESERVICE_API_KEY`, `MAPBOX_ACCESS_TOKEN` / `MAPBOX_DIRECTIONS_ACCESS_TOKEN`
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`

Added on the `revenue-affiliates` branch / PR #1 (all optional):

- `TRIPCOM_ALLIANCE_ID`, `TRIPCOM_SID`
- `AGODA_CID`
- `BOOKING_AID`
- `VIATOR_PID`, `VIATOR_MCID`
- `PAYSTACK_PAYMENT_URL`, `FLUTTERWAVE_PAYMENT_URL`

Redeploy after adding affiliate IDs (they are read at build/runtime as implemented in that branch).

Email sign-in and the /admin console are documented in `docs/auth-admin-setup.md`.

## Next steps

1. Confirm the dirtydecember.info production deploy is `02a159a5` / Next 16.4.6.
2. Rebase PR #1 onto current `main`, review the Vercel preview, then merge only if Ox wants the revenue work live.
3. Continue or check affiliate programme applications (Trip.com, Agoda, Booking.com/CJ, Viator). Keep IDs in env, not in the repo.
4. Optionally tidy stale `cursor/*` branches.

## First prompt for GitHub Copilot coding agent

```
Work in https://github.com/oxbreed/december-circuit (Dirty December site, live at dirtydecember.info). Do not invent event dates, prices, or booking URLs. Do not scrape Google Maps or Airbnb. Do not commit secrets.

Current main is commit 02a159a5, with Next.js 16.4.6 after PRs #2 and #3. Open PR #1 (branch revenue-affiliates) adds affiliate /go/ redirects, stays placements, disclosure, cookies, and Get featured. Homepage redesign and the wider a11y/security audit are out of scope.

Please: rebase revenue-affiliates onto current main, fix any conflicts, keep affiliate IDs server-side from env vars only (TRIPCOM_ALLIANCE_ID, TRIPCOM_SID, AGODA_CID, BOOKING_AID, VIATOR_PID, VIATOR_MCID, PAYSTACK_PAYMENT_URL, FLUTTERWAVE_PAYMENT_URL), keep /go/ from being an open redirect, and leave Airbnb as a non-partner plain link. Open or update the PR and summarise what changed and what still needs a human review before merge.
```
