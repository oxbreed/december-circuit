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
| `/admin` → **Dashboard / Insights** | First-party insights: 24h / 7d / 30d / 90d range with previous-period deltas, KPI cards, time series of page views and outbound clicks, ranked lists, Core Web Vitals p75, and a recent activity feed. Each widget fails on its own. |
| `/preview/admin-dashboard` | Fixture preview for visual QA of the current dashboard (noindex). |
| `/preview/analytics-overview` | Fixture preview of the earlier Overview Report card (noindex). |
| Optional `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Loads gtag only when set. **Off by default.** |

## What Ox sees on `/admin` (signed in)

Open **Dashboard / Insights** (`/admin?section=dashboard`, optional `&range=24h|7d|30d|90d`):

1. **Range control** — last 24 hours, 7 days, 30 days, or 90 days, compared with the previous period of the same length. Deltas show as a percent, or “No previous period” when the earlier window has no baseline.
2. **KPI cards** — page views, approximate sessions, outbound clicks, click-through (clicks ÷ page views), partner earning clicks, and submissions.
3. **Chart** — page views and outbound clicks over the selected window (hourly in 24h, daily otherwise, London time). Inline SVG, no extra chart library.
4. **Ranked lists** — top pages, external referrers, countries, devices, browsers, partners, placements, and paths that sent clicks.
5. **Core Web Vitals** — p75 LCP, INP, and CLS for the selected range, coloured Good / Needs improvement / Poor.
6. **Recent activity** — latest outbound clicks and submissions in the window, including the `admin-migration-verify` test click if it falls in range.

Approximate sessions group views that share a country and the first 80 characters of the user agent. The site does not store a visitor id. Bot user agents are left out of page-view totals. The `admin-migration-verify` placement is left out of click totals and lists, but can still appear in the activity feed.

Queries are scoped to the selected window plus the previous period (service role, server side). Aggregates then run on that slice, not on an unbounded table dump. An unapplied migration, `supabase/migrations/20261120234500_admin_dashboard_indexes.sql`, adds supporting indexes. Do not apply it until asked.

Analytics env toggles stay under **Settings**. Vercel Analytics remains a separate product.

## Migrations (apply on hosted Supabase)

```bash
# From a machine linked to the DirtyDecember Supabase project:
supabase db push
# Or paste these in the SQL editor:
#   supabase/migrations/20261025120000_page_views.sql
#   supabase/migrations/20261025123000_web_vitals.sql
#   supabase/migrations/20261119120000_outbound_clicks.sql
# Index helper (unapplied until asked):
#   supabase/migrations/20261120234500_admin_dashboard_indexes.sql
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
