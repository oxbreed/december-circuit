# Affiliate links, paid placements, and click logging

## Partner links (`/go/<partner>`)

| Slug | Partner | IDs needed to earn | Where it appears |
| --- | --- | --- | --- |
| `tripcom-hotels` | Trip.com hotels | Defaults in `affiliate-config.ts` (Allianceid `11268503`, SID `335386234`, site "Oxbreed Management Ltd"). `TRIPCOM_ALLIANCE_ID` and `TRIPCOM_SID` override if set. | Stays modules |
| `agoda` | Agoda | `AGODA_CID` | Stays modules |
| `booking` | Booking.com | `BOOKING_AID` | Stays modules |
| `tripcom-flights` | Trip.com flights | Same Trip.com defaults / env overrides as hotels | `/flights#book` |
| `viator` | Viator | `VIATOR_PID`, `VIATOR_MCID` | `/guide#on`, event pages, Lagos stay guide |

- Code: `app/affiliate-partners.ts` (slugs, `goHref`), `app/affiliate-config.ts` (server-only destinations + IDs), `app/go/[partner]/route.ts`, `app/components/partner-modules.tsx`.
- Trip.com links earn with the in-code defaults even when the env vars are unset. The Trip.com deep-link creator also offers an optional `trip_sub3` param; `/go/` does not add it.
- No ID and no default → the redirect opens the partner's normal public search, that partner's link stays unsponsored, and the click row has `earning = false`.
- ID present (from env, or a Trip.com default) → the ID is appended server-side, that partner's link gets `rel="sponsored nofollow"`, and a module that lists an earning partner shows "We may earn a commission". Other partners in the same module stay unsponsored until their own IDs are set.
- Labels are decided at build time. Redeploy after adding or changing an ID or a default.
- If a partner gives you a different deep-link format after approval (for example a CJ tracking link for Booking.com), change only the builder for that slug in `app/affiliate-config.ts`.
- Never paste an affiliate ID into a template, and never invent one. Public Trip.com defaults belong only in `app/affiliate-config.ts`.
- Airbnb links stay plain links (its open Associates programme closed in 2021).

## Placements

- `/guide#stay` — stays module for Lagos, Accra, Calabar (above the Airbnb block).
- `/guide#on` — Viator tours for Lagos, Accra, Calabar.
- `/places` — stays module in the hub.
- `/place/<slug>` — for Hotels and Short-stay: partner searches for that stay's name.
- `/flights#book` — Trip.com flights next to the Google Flights board, then a stays module.
- `/events/<slug>` — for Lagos, Accra, Calabar events: hotels and tours in that city.
- `/guides/where-to-stay-lagos-december` — new guide page.

## Paid placements

- Add an entry to `app/sponsors.ts` only after an agreement and payment. `eventSlug` badges that event "Featured · Paid placement" on cards and its page; the first entry shows in the featured slot on `/events`.
- Remove the entry when the paid period ends (no automatic expiry).
- `/get-featured` explains the offer with no prices. Pay buttons appear only when `PAYSTACK_PAYMENT_URL` / `FLUTTERWAVE_PAYMENT_URL` are set (https on paystack.com / paystack.shop / flutterwave.com only).

## Click log

- Table `public.outbound_clicks` (migration `supabase/migrations/20261119120000_outbound_clicks.sql`). Service role only. Needs `SUPABASE_SERVICE_ROLE_KEY`. `SITE_PAGEVIEWS_ENABLED=false` turns it off.
- Columns: kind (`partner` / `ticket` / `sponsor`), partner, target, destination_host, placement, from_path, referrer_host, country, earning, ts. No IP.
- Clicks per partner and placement, last 30 days:

```sql
select partner, placement, count(*) as clicks
from public.outbound_clicks
where ts > now() - interval '30 days'
group by 1, 2
order by clicks desc;
```

## Analytics events (Vercel Web Analytics custom events, and GA if enabled)

`stay_click`, `outbound_go`, `ticket_click`, `sponsor_click`, `featured_enquiry`.
