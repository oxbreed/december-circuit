# WordPress probe monitoring

DirtyDecember runs on **Next.js (Vercel)**, not WordPress. Scanners still hit `/wp-admin`, `/wp-login.php`, `/index.php`, and other `.php` paths.

## What we ship

| Piece | Role |
| --- | --- |
| Root `proxy.ts` | Matches WP probe paths, logs JSON to stdout, best-effort POST to ingest, returns **404**. |
| `POST /api/wp-probes/ingest` | Service-role insert behind `WP_PROBE_INGEST_SECRET`. Never called from the browser. |
| `GET /api/wp-probes/export` | CSV for the signed-in admin only. |
| `/admin?section=probes` | Recent hits, filters, summary, export. Storage / retention / purge live under **Settings**. |
| Migration `20261025060000_wp_probes.sql` | `wp_probes` + `wp_probe_settings` tables; RLS on; no anon/authenticated grants. |
| `app/robots.ts` | Disallows unused WP paths. Real routes such as `/admin` are unchanged. |

## Apply the migration first

This branch adds schema. Do **not** rely on `/admin` probe storage until the migration is on the hosted Supabase project (same caution as the pended UGC branch).

```bash
# From a machine linked to the DirtyDecember Supabase project:
supabase db push
# Or paste supabase/migrations/20261025060000_wp_probes.sql in the SQL editor.
```

Then set Vercel env (Production + Preview as needed):

- `SUPABASE_SERVICE_ROLE_KEY` — already used for unpublished submissions; required for probe storage and `/admin` reads.
- `WP_PROBE_INGEST_SECRET` — long random string. `proxy.ts` sends it as `Authorization: Bearer …`. Leave empty for stdout-only logging.

Redeploy after env changes.

## Admin usage

1. Sign in at `/sign-in` with the `ADMIN_EMAIL` address.
2. Open `/admin?section=probes` (Ox Management → **Probes**).
3. **Filters:** path substring, IP exact, from/to date → Filter. Clear filters returns to `/admin?section=probes`.
4. **Summary:** count in view, last 24h, distinct IPs, top paths. Export CSV — current filters, admin session required.
5. **Controls** (under `/admin?section=settings`):
   - Enable / Disable storage — stops or resumes inserts. Stdout `wp_probe` lines still appear either way.
   - Retention (days) — blank keeps rows until purged; saving a number deletes older rows immediately and on each successful ingest.
   - Purge older than retention / Clear all probes.

Empty, loading, and error states are covered on the section (including “apply the migration” when the table is missing).

## Stdout (Vercel logs)

Each matched request still logs one line:

```json
{"type":"wp_probe","ts":"...","method":"GET","path":"/wp-login.php","ua":"...","ip":"...","xff":"...","referer":null,"host":"www.dirtydecember.info"}
```

Vercel → **Logs** → filter `wp_probe`. Local: `npm run dev` and hit a probe path.

## Security notes

- Service role stays server-only (`createServiceClient` / ingest route). Never `NEXT_PUBLIC_`.
- Ingest secret is server-only. Without it, proxy skips the POST (404 + stdout still work).
- `wp_probes` / `wp_probe_settings`: RLS enabled; revoked from `anon` / `authenticated`; no public policies.
- `/admin` and export require the same admin email check as submissions.

## Note on Vercel edge mitigation

Vercel may already return **403** with `x-vercel-mitigated: deny` for many `.php` and `wp-*` probes before the app runs. Those hits never reach `proxy.ts`. The proxy covers probes that reach the Next deployment (local, preview, or when edge rules change).

## Build note (`cacheComponents`)

`/admin` must await `searchParams` **inside** the session `Suspense` child. Awaiting it in the page body fails `next build` on Vercel once Supabase env vars are present (`uncached or runtime data during prerendering`).

Do **not** set `export const runtime = "nodejs"` on the ingest/export routes. Next.js 16 with `cacheComponents: true` fails the production build with that segment config. Node is already the default for these handlers.

## Admin submissions + service role grants

`/admin` unpublished submissions use `SUPABASE_SERVICE_ROLE_KEY` (server-only). Migration `20261025114500_admin_service_role_select.sql` grants `service_role` SELECT on `submissions` / `reviews` and DML on the probe tables. Apply with `supabase db push` (or the SQL editor) if `/admin` still shows “Submissions could not be read.” after the place/UGC/wp_probes migrations — `BYPASSRLS` does not replace table `GRANT`s, and early migrations revoked `PUBLIC` without an explicit `service_role` grant.

## UGC

UGC product UI stays pended on `cursor/supabase-ugc`. The UGC migration file `20261024201200_ugc_ratings_votes_photos_qa.sql` is kept on `main` when that version is already in remote history so `supabase migration list` stays aligned. Probe work does not depend on UGC tables.
