# Sign-in and admin console setup

This site uses **Supabase Auth** for email sign-in, not Auth.js or NextAuth, and not Google or Apple. `/sign-in` sends a magic link to the address you enter. `/admin` is the Ox Management control panel. It is closed to everyone except allowlisted admin addresses, it sends `noindex`, and it is omitted from the sitemap and disallowed in `robots.ts`.

The code degrades safely if the hosted project is not in the environment:

- Missing Supabase URL or anon key: `/sign-in` shows “The directory sign-in is not connected yet.” and does not offer the email form. `/admin` stays closed.
- Missing service role key or an unapplied table: admin lists that need the database show **Database not connected** instead of failing the page.

Do not put secrets in the repo. Do not apply SQL migrations from this document unless you have chosen to apply them.

Official references:

- [Passwordless email logins (Supabase)](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Redirect URLs (Supabase)](https://supabase.com/docs/guides/auth/redirect-urls)

## What is already in the app

- Sign-in page: `https://www.dirtydecember.info/sign-in`.
- The email form calls `signInWithOtp` and asks Supabase to email a magic link. The link returns to `https://www.dirtydecember.info/auth/callback`, which exchanges the code and sends the visitor back to `/sign-in` as a signed-in user.
- Admin path: `https://www.dirtydecember.info/admin`.
- Default admin allowlist, if `ADMIN_EMAILS` and `ADMIN_EMAIL` are both unset: `oxbreedmanagement@gmail.com`. Sign in with that mailbox (or another address you add to the allowlist) to open the console.

## 1. Supabase Auth for email links

Open the hosted project that already matches `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`).

1. **Authentication, URL configuration**
   - Site URL: `https://www.dirtydecember.info`
   - Redirect URLs (allow list), at least:
     - `https://www.dirtydecember.info/auth/callback`
     - `http://localhost:3000/auth/callback` for local work
   - The app always sends the magic-link return address to the production callback above, so a link requested on a Vercel preview still returns to `www.dirtydecember.info`. Do not point Site URL at a preview host.
2. **Authentication, Providers, Email**
   - Enable the Email provider.
   - Keep magic links (or “Confirm sign in” / email one-time links) turned on. This app’s sign-in page expects a link in the inbox, not a typed six-digit code.
   - You do not need to enable a password, Google, or Apple provider for this flow.
3. **Mail delivery**
   - In a new Supabase project, built-in mail is enough to try one or two links, and it is rate limited. For reliable delivery to `oxbreedmanagement@gmail.com`, set a custom SMTP sender in the project’s Auth email settings.
   - If a link is refused, `/sign-in` may show “Supabase has reached its mail limit,” “Supabase refused this address,” or “The return address was refused.” Those usually mean the rate limit, an email allow list on the project, or a missing redirect URL.

`supabase/migrations/20261119120000_outbound_clicks.sql` is still unapplied. The admin Outbound clicks section will say the database is not connected until that table exists and `SUPABASE_SERVICE_ROLE_KEY` is set. Do not apply migrations from this change unless you have decided to apply them.

## 2. Vercel environment variables

Set these on the Dirty December project (Production, and Preview or Development if you use those). Redeploy after changing them. Names only; never commit values.

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Hosted project URL. Alias: `SUPABASE_URL`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon (publishable) key. Alias: `SUPABASE_ANON_KEY`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only. Lets `/admin` read submissions, reviews, probes, analytics, and outbound clicks. Never expose this in the browser. |
| `ADMIN_EMAILS` | Comma-separated addresses that may open `/admin`. Example: `oxbreedmanagement@gmail.com`. |
| `ADMIN_EMAIL` | Optional legacy single address, still read and merged into the allowlist. |

If both admin variables are unset, the app allows `oxbreedmanagement@gmail.com` only. Addresses are compared in lower case.

The live production site already presents the email form on `/sign-in`, which means a project URL and anon key appear to be set there. Confirm the Email provider, Site URL, and redirect allow list in the Supabase dashboard if a link fails to arrive or is refused.

## 3. How to confirm it worked

1. Open `https://www.dirtydecember.info/sign-in`.
2. You should see the email form, not the line “The directory sign-in is not connected yet.”
3. Enter `oxbreedmanagement@gmail.com` (or another allowlisted address), submit, and open the link from that inbox on the same browser.
4. You should land on `/sign-in` as a signed-in user. The account also appears under Authentication, Users in Supabase.
5. `/admin` should then open the overview. Any other signed-in address sees “Access refused.” A visitor who is not signed in is sent to `/sign-in`.
6. Sign out from `/sign-in` or from the button on `/admin`.

## Admin console (what is read-only)

`/admin` is a control panel, not WordPress. Events, places, featured cards, and slideshow posters are compiled from TypeScript files (`app/events.ts`, `app/places.ts`, `app/home-featured.ts`, `app/home-hero-slides.ts`, `app/landmarks.ts`). Those sections are **read-only** in the console. To change them, edit the repo and open a pull request.

A later piece of work could store database overrides on top of those files. That is not in this change.

The console also lists Get featured placement submissions and outbound clicks when the matching tables are on the project. Email enquiries sent to partners@dirtydecember.info are not stored.
