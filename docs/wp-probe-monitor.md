# WordPress probe monitoring

DirtyDecember runs on **Next.js (Vercel)**, not WordPress. Scanners still hit `/wp-admin`, `/wp-login.php`, `/index.php`, and other `.php` paths.

## What we ship

- Root `proxy.ts` (Next.js 16; formerly middleware) matches those probe paths, writes one structured JSON line per hit to stdout, and returns **404** with `noindex`.
- `app/robots.ts` disallows the same unused WordPress paths. Real routes such as `/admin` are unchanged.

## How to read the logs

1. Open the DirtyDecember project on [Vercel](https://vercel.com) → **Logs** (Runtime / Functions).
2. Filter for `wp_probe` (the `type` field in each log line).
3. Each line looks like:

```json
{"type":"wp_probe","ts":"2026-10-25T05:40:00.000Z","method":"GET","path":"/wp-login.php","ua":"...","ip":"...","xff":"...","referer":null,"host":"www.dirtydecember.info"}
```

Fields: `path`, `user-agent` (`ua`), client IP (`ip` / `xff`), `referer`, `ts`.

## Note on Vercel edge mitigation

Vercel may already return **403** with `x-vercel-mitigated: deny` for many `.php` and `wp-*` probes before the app runs. Those hits will not appear as `wp_probe` lines. The proxy covers probes that reach the Next deployment (local, preview, or when edge rules change).
