# Site analytics

DirtyDecember monitors visits and performance with **Vercel Web Analytics**, **Vercel Speed Insights**, and first-party Supabase tables that power the **on-page `/admin` dashboard** (visits, countries, Core Web Vitals).

## What is enabled in code

| Piece | Role |
| --- | --- |
| `@vercel/analytics` in `app/layout.tsx` | Page views / visitors on the Vercel project (cookieless product). |
| `@vercel/speed-insights` in `app/layout.tsx` | Core Web Vitals / performance on Vercel. |
| `POST /api/analytics/pageview` | Best-effort first-party insert: path, referrer, short UA, **country only** from `x-vercel-ip-country` / `cf-ipcountry`. No IP stored. Quiet no-op if Supabase service role or table is missing. |
| `POST /api/analytics/web-vital` | Best-effort LCP / INP / CLS samples from the `web-vitals` library. Quiet no-op if table/key missing. |
| Client beacons in `SiteAnalytics` | Page views + Web Vitals on App Router navigations. Skips `/admin`, `/api/*`, `/auth/*`. |
| `/admin` → **Analytics** | MonsterInsights-style Overview Report card: date range (7 / 30 days), Sessions / Pageviews tabs, blue area-line chart with markers + grid, top pages / countries / sources. Web Vitals p75 tiles below. Empty states covered. “Open in Vercel” secondary. |
| Optional `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Loads gtag only when set. **Off by default.** |

## What Ox sees on `/admin` (signed in)

1. **Overview Report** card — Last 7 / 30 days selector; **Sessions** and **Pageviews** tabs with totals; large blue area-line chart (fill + circular markers + axes).
2. **Lists** under the chart — Top pages, countries, sources for the selected range.
3. **Web Vitals** — LCP / INP / CLS p75 for 7 days.
4. Secondary: Open in Vercel.

Sessions are approximated from distinct country + user-agent per day (no cookie). Pageviews are raw first-party rows.

## Migrations (apply on hosted Supabase)

```bash
# From a machine linked to the DirtyDecember Supabase project:
supabase db push
# Or paste these in the SQL editor:
#   supabase/migrations/20261025120000_page_views.sql
#   supabase/migrations/20261025123000_web_vitals.sql
```

Requires existing `SUPABASE_SERVICE_ROLE_KEY` (same as submissions / WP probes).

## Where Ox Management reads Vercel (optional / fuller product)

1. Open [Vercel Dashboard](https://vercel.com/dashboard).
2. Select the project that deploys **dirtydecember.info** (oxbreed/december-circuit).
3. **Analytics** — visits, top pages, referrers, devices, Country panel.
4. **Speed Insights** — hosted Web Vitals product.

Enable **Web Analytics** and **Speed Insights** on the Vercel project if they are not already on.

## Env vars

| Name | Required | Notes |
| --- | --- | --- |
| (none new for Vercel packages) | — | Analytics + Speed Insights work once enabled on the Vercel project. |
| `SUPABASE_SERVICE_ROLE_KEY` | For first-party rows + `/admin` dashboard | Already used for admin. Server only. |
| `SITE_PAGEVIEWS_ENABLED` | No | Default on when unset. Set `false` to skip first-party pageview **and** web-vital inserts. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Optional GA. Leave empty. |

See `.env.example`.

## Privacy (NDPR-oriented)

- Vercel Web Analytics: anonymised visit metrics; no advertising cookie for that product (per Vercel docs).
- First-party page views: path, optional referrer, short UA, ISO country code from the edge. **No visitor IP.**
- First-party Web Vitals: path, metric name, numeric value, rating, optional country. **No visitor IP.**
- Retention: first-party rows swept after ~90 days on ingest; Vercel products follow Vercel retention.
- `/privacy` discloses visit monitoring, country derivation, and optional GA.
- Do not enable GA unless deliberately chosen; default remains off.

## What this does not do

- Does not iframe the Vercel dashboard.
- Does not invent events or merge UGC product UI.
- Does not change WP probe monitoring.
- Does not hard-require Google Analytics, Plausible, or Umami.
- Does not expose analytics tables to anon/authenticated (RLS on; service_role grants only).

## Build note

Same `cacheComponents` rules as WP probes: keep `/admin` `searchParams` await inside the session `Suspense` child. Do not add `export const runtime = "nodejs"` or `dynamic = "force-dynamic"` on analytics routes.
