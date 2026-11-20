# Sign-in and admin console setup

This site already uses **Supabase Auth** (not Auth.js or NextAuth). `/sign-in` supports an email one-time code plus Sign in with Google and Sign in with Apple. `/admin` is the Ox Management control panel. It is closed to everyone except allowlisted admin addresses, it sends `noindex`, and it is omitted from the sitemap and disallowed in `robots.ts`.

The code degrades safely if provider settings are missing:

- Empty Google or Apple client IDs: the matching button is shown as **not configured** and stays disabled. The production build still passes.
- Missing Supabase URL or anon key: sign-in is treated as disconnected and `/admin` stays closed.
- Missing service role key or an unapplied table: admin lists that need the database show **Database not connected** instead of failing the page.

Do not put secrets in the repo. Do not apply SQL migrations from this document unless you have chosen to apply them.

Official references:

- [Sign in with Google (Supabase)](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- [Sign in with Apple (Supabase)](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple)
- [Redirect URLs (Supabase)](https://supabase.com/docs/guides/auth/redirect-urls)

## What is already in the app

- Callback route: `https://www.dirtydecember.info/auth/callback` (this path is hardcoded as the OAuth `redirectTo` target, always on the production host).
- Admin path: `https://www.dirtydecember.info/admin`.
- Default admin allowlist, if `ADMIN_EMAILS` and `ADMIN_EMAIL` are both unset: `oxbreedmanagement@gmail.com`.

The app does not store Google or Apple client secrets. Those belong only in the Supabase Auth dashboard. Vercel only needs the *client IDs* (so the buttons can appear) plus the existing Supabase URL, anon key, and service role key.

## 1. Google Cloud OAuth client

You need a Google Cloud project and access to [Google Auth Platform](https://console.cloud.google.com/auth/clients) (Clients; older screens call this Credentials).

1. Configure the OAuth consent screen if it is not already set: app name, user support email, and the authorised domain `dirtydecember.info`. In testing mode, only Google accounts you add as test users can sign in.
2. Create an OAuth client ID. Application type: **Web application**.
3. Under **Authorized JavaScript origins** add (scheme and host only, no path):
   - `https://www.dirtydecember.info`
   - `https://dirtydecember.info` (apex, if you ever sign in there)
   - `http://localhost:3000` for local development, then remove it once you no longer need it
   - Your Supabase project origin, `https://<project-ref>.supabase.co`
4. Under **Authorized redirect URIs** add only the Supabase Auth callback, not the Dirty December `/auth/callback` path:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
   - Copy the exact URL from the Google provider page in the Supabase dashboard.
   - For a local Supabase CLI stack only, also add `http://127.0.0.1:54321/auth/v1/callback`.
5. Create the client and keep the **Client ID** and **Client Secret**. The secret is pasted into Supabase, not into Vercel.

Google can take a few minutes (sometimes longer) to apply origin and redirect changes.

## 2. Apple Developer (Sign in with Apple)

Apple requires a paid [Apple Developer Program](https://developer.apple.com/programs/) membership to configure Sign in with Apple. An unpaid Apple ID is not enough. This repository does not create that membership and does not spend on it.

If you have a membership, in [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources):

1. Note your **Team ID** (10 characters), shown in the account membership details and often in the upper right of the developer site.
2. Create an **App ID** (Identifiers, type App IDs) if you do not already have one for this site, for example `info.dirtydecember.web`. Enable the Sign in with Apple capability. Leave the server-to-server notification endpoint blank; Supabase Auth does not use it.
3. Optionally register email sources under Services, Sign in with Apple for Email Communication, if you want Apple to relay hidden-email addresses through your domain.
4. Create a **Services ID** (Identifiers, type Services IDs), for example `info.dirtydecember.signin`. This Services ID is the OAuth client ID for the web flow.
5. Enable Sign in with Apple on that Services ID, associate it with the App ID, and set Website URLs:
   - Domain: `<project-ref>.supabase.co` (the host of the Supabase project, not `www.dirtydecember.info`)
   - Return URL: `https://<project-ref>.supabase.co/auth/v1/callback`
6. In Keys, create a key, enable Sign in with Apple, and link it to the App ID. Download the `.p8` file once and store it privately. Note the **Key ID**. If the file is lost or leaked, revoke the key and create a new one.

The Services ID, Team ID, Key ID, and `.p8` contents are used in the Supabase Apple provider settings. You can use the secret generator on that dashboard page. A client secret that you generate yourself as a JWT lasts at most six months; web Sign in with Apple stops when it expires until you paste a new secret.

## 3. Supabase Auth dashboard

Open the hosted project that already matches `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`).

1. **Authentication, URL configuration**
   - Site URL: `https://www.dirtydecember.info`
   - Redirect URLs (allow list), at least:
     - `https://www.dirtydecember.info/auth/callback`
     - `http://localhost:3000/auth/callback` for local work
   - Preview deploys: this app always sends OAuth `redirectTo` to the production callback above, so a sign-in started on a Vercel preview still returns to `www.dirtydecember.info`. Do not point Site URL at a preview host.
2. **Authentication, Providers, Google**
   - Enable the provider.
   - Client ID and Client Secret: the Google Cloud web client from section 1.
   - Save.
3. **Authentication, Providers, Apple**
   - Enable the provider.
   - Client IDs: the Services ID from section 2. If you later add native iOS sign-in, keep the Services ID as the first entry; Supabase uses the first ID for the web flow.
   - Secret: generate it on this page from the Team ID, Key ID, and `.p8` file, or paste a generated JWT.
   - Save.

Do not apply database migrations from this change unless you have decided to apply them. `supabase/migrations/20261119120000_outbound_clicks.sql` is still unapplied; the admin Outbound clicks section will say the database is not connected until that table exists and `SUPABASE_SERVICE_ROLE_KEY` is set.

## 4. Vercel environment variables

Set these on the Dirty December project (Production, and Preview or Development if you use those). Redeploy after changing them. Names only; never commit values.

Already required for sign-in and admin data:

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Hosted project URL. Alias: `SUPABASE_URL`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon (publishable) key. Alias: `SUPABASE_ANON_KEY`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only. Lets `/admin` read submissions, reviews, probes, analytics, and outbound clicks. Never expose this in the browser. |

For the Google and Apple buttons to appear (the IDs only; secrets stay in Supabase):

| Name | Purpose |
| --- | --- |
| `GOOGLE_OAUTH_CLIENT_ID` | Google Cloud web client ID. Alias: `GOOGLE_CLIENT_ID`. |
| `APPLE_OAUTH_CLIENT_ID` | Apple Services ID. Aliases: `APPLE_SERVICES_ID`, `APPLE_CLIENT_ID`. |

For the admin allowlist:

| Name | Purpose |
| --- | --- |
| `ADMIN_EMAILS` | Comma-separated addresses that may open `/admin`. Example: `oxbreedmanagement@gmail.com`. |
| `ADMIN_EMAIL` | Optional legacy single address, still read and merged into the allowlist. |

If both admin variables are unset, the app allows `oxbreedmanagement@gmail.com` only. Addresses are compared in lower case. Sign in must use that mailbox (or another address you add).

You do not set Google or Apple client secrets, Team ID, Key ID, or the `.p8` file on Vercel.

## 5. How to confirm it worked

1. Open `https://www.dirtydecember.info/sign-in`.
2. The Google and Apple buttons should be enabled, not labelled “not configured”.
3. After Google or Apple, you should land on `/sign-in` as a signed-in user. The account also appears under Authentication, Users in Supabase.
4. With an allowlisted email, `/admin` opens the overview. Any other signed-in address sees “Access refused.” A visitor who is not signed in is sent to `/sign-in`.
5. Sign out from `/sign-in` or from the button on `/admin`.

Email one-time codes continue to work once Supabase Auth is connected, independent of Google and Apple.

## Admin console (what is read-only)

`/admin` is a control panel, not WordPress. Events, places, featured cards, and slideshow posters are compiled from TypeScript files (`app/events.ts`, `app/places.ts`, `app/home-featured.ts`, `app/home-hero-slides.ts`, `app/landmarks.ts`). Those sections are **read-only** in the console. To change them, edit the repo and open a pull request.

A later piece of work could store database overrides on top of those files. That is not in this change.

The console also lists Get featured placement submissions and outbound clicks when the matching tables are on the project. Email enquiries sent to partners@dirtydecember.info are not stored.
