# Site analytics

DirtyDecember monitors visits and performance with **Vercel Web Analytics**, **Vercel Speed Insights**, and an optional first-party `page_views` table for `/admin` summaries.

## What is enabled in code

| Piece | Role |
| --- | --- |
| `@vercel/analytics` in `app/layout.tsx` | Page views / visitors on the Vercel project (cookieless product). |
| `@vercel/speed-insights` in `app/layout.tsx` | Core Web Vitals / performance on Vercel. |
| `POST /api/analytics/pageview` | Best-effort first-party insert: path, referrer, short UA, **country only** from `x-vercel-ip-country` / `cf-ipcountry`. No IP stored. Quiet no-op if Supabase service role or table is missing. |
| Client beacon in `SiteAnalytics` | Sends path on App Router navigations (`sendBeacon` / `fetch`). Skips `/admin`, `/api/*`, `/auth/*`. |
| `/admin` → **Site analytics** | Links to Vercel dashboards + first-party totals, top paths, top countries. Empty / loading / error states covered. |
| Optional `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Loads gtag only when set. **Off by default.** |

## Where Ox Management reads dashboards

1. Open [Vercel Dashboard](https://vercel.com/dashboard).
2. Select the project that deploys **dirtydecember.info** (oxbreed/december-circuit).
3. **Analytics** — visits, top pages, referrers, devices, and the **Country** panel (primary location source).
4. **Speed Insights** — LCP, INP, CLS and related Web Vitals.

Enable **Web Analytics** and **Speed Insights** for the project in Vercel if they are not already on. The npm packages alone do not create historical data until the product is enabled and production traffic hits the site.

Filtering by country and pages: [Vercel Analytics filtering](https://vercel.com/docs/analytics/filtering).

## First-party table (optional backup)

Apply on the hosted Supabase project:

```bash
# From a machine linked to the DirtyDecember Supabase project:
supabase db push
# Or paste supabase/migrations/20261025120000_page_views.sql in the SQL editor.
```

Requires existing `SUPABASE_SERVICE_ROLE_KEY` (same as submissions / WP probes).

Then:

1. Sign in at `/sign-in` with `ADMIN_EMAIL`.
2. Open `/admin` → **Site analytics**.
3. After traffic, see summary counts, top paths, and country codes.

Local `npm run dev` often has no country header; production on Vercel does.

Disable first-party inserts without removing Vercel products:

```bash
SITE_PAGEVIEWS_ENABLED=false
```

## Env vars

| Name | Required | Notes |
| --- | --- | --- |
| (none new for Vercel packages) | — | Analytics + Speed Insights work once enabled on the Vercel project. |
| `SUPABASE_SERVICE_ROLE_KEY` | For first-party rows + `/admin` summary | Already used for admin. Server only. |
| `SITE_PAGEVIEWS_ENABLED` | No | Default on when unset. Set `false` to skip Supabase inserts. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Optional GA. Leave empty. |

See `.env.example`.

## Privacy (NDPR-oriented)

- Vercel Web Analytics: anonymised visit metrics; no advertising cookie for that product (per Vercel docs).
- First-party rows: path, optional referrer, short UA, ISO country code from the edge. **No visitor IP.**
- Retention: first-party rows swept after ~90 days on ingest; Vercel products follow Vercel retention.
- `/privacy` discloses visit monitoring, country derivation, and optional GA.
- Do not enable GA unless deliberately chosen; default remains off.

## What this does not do

- Does not invent events or merge UGC product UI.
- Does not change WP probe monitoring.
- Does not hard-require Google Analytics, Plausible, or Umami.
- Does not expose page-view tables to anon/authenticated (RLS on; service_role grants only).

## Build note

Same `cacheComponents` rules as WP probes: keep `/admin` `searchParams` await inside the session `Suspense` child. Do not add `export const runtime = "nodejs"` on the pageview route.
