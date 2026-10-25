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
| `/admin` → **Site analytics** | On-page dashboard: totals (24h / 7d / 30d), unique paths/countries, daily bars, top pages / countries / referrers, LCP/INP/CLS median + p75 + rating mix. Vercel links are secondary. Empty / loading / error states covered. |
| Optional `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Loads gtag only when set. **Off by default.** |

## What Ox sees on `/admin` (signed in)

1. **Visits and location** — last 24h / 7d / 30d tiles, spark bars for 7 and 30 days, top pages, top countries, top referrers.
2. **Performance** — LCP, INP, CLS cards for 7d and 30d (median, p75, good / needs-improvement / poor mix). Placeholder explanation cards when there are no samples yet.
3. Secondary: “Open full Vercel Analytics” (no iframe — Vercel auth cannot embed).

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
