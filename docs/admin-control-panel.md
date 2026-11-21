# Admin control panel

The `/admin` console is a multi-section control panel for dirtydecember.info. Sign-in is still email magic link through Supabase Auth, and every mutation is checked server-side against the `ADMIN_EMAILS` allowlist (the default operator address is always included).

## What each section does

- **Overview.** Counts, pending approvals, quick actions, recent audit entries, plus the existing directory snapshot.
- **Approvals.** Inbox for `/list` and `/get-featured` submissions. Tabs for pending, approved, and rejected. Search and kind filters. Approve or reject one row or several at once, with an optional note and light edits before publish. An approved event or place can appear on the public site once the database update below is applied.
- **Events, Places, Featured, Landmarks.** Manage overlays on top of the TypeScript seed files (`events.ts`, `places.ts`, `home-featured.ts`, `landmarks.ts`). Create, edit, publish, hide, schedule, and reorder. Seed files remain the fallback. New landmarks append after the seed list and require a credit.
- **Affiliates.** Partner registry, recent outbound clicks, and published Get featured placements.
- **Insights.** The first-party analytics dashboard from PR #19.
- **Audit log.** Append-only record of admin actions.
- **Search.** Panel-wide lookup and quick actions, also in the header.
- **Reviews, Probes, Settings.** Existing tools, including the admin allowlist view.

Older URLs still work: `section=submissions` opens Approvals, `section=clicks` and `section=get-featured` open Affiliates.

## Database update (not applied)

The pull request adds `supabase/migrations/20261121020000_admin_control_panel.sql`. Do not apply it until Ox agrees. Until it runs:

- Approvals can list existing unpublished submissions, but approve/reject cannot change status (the table still only allows `unpublished`).
- Overlay saves and the audit log show a clear “needs a database update” state.
- The public site keeps using the seed files only.

After it is applied, the table still uses service-role access from the Next.js server (row level security on, no anon or authenticated grants). Admin checks stay in the server actions, not in the database as an email policy.

## Visual QA

Fixture previews (noindex, no session):

- `/preview/admin-control-panel` (Approvals)
- `/preview/admin-control-panel/overview`
- `/preview/admin-control-panel/events`

## Configure

No new environment variables. The panel uses the existing project URL, anon key, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_EMAILS`.
