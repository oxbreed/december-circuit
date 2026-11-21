-- Support inbox: visitor messages left through Ask support.
-- Not applied from the pull request that adds this file.
-- Until this runs, the leave-a-message form returns a clear error, and the
-- admin Support section shows a "needs a database update" state. Chat replies
-- from /api/support keep working either way.

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null
    check (char_length(btrim(name)) between 1 and 80),
  email text not null
    check (position('@' in email) > 1 and char_length(email) <= 320),
  topic text not null
    check (topic in ('visitor', 'listing', 'partnership', 'other')),
  message text not null
    check (char_length(btrim(message)) between 10 and 2000),
  status text not null default 'open'
    check (status in ('open', 'resolved')),
  page_path text
    check (page_path is null or (char_length(page_path) between 1 and 300 and page_path like '/%')),
  resolved_at timestamptz,
  resolved_by text
    check (resolved_by is null or (position('@' in resolved_by) > 1 and char_length(resolved_by) <= 320)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.support_requests is
  'Messages left through Ask support. status open is waiting for a reply. resolved marks a request as handled. Rows are not published on the public site.';

comment on column public.support_requests.page_path is
  'Optional path of the page the visitor was on, such as /events. Query strings are not stored.';

comment on column public.support_requests.resolved_by is
  'Email of the admin who last marked the row resolved or opened it again.';

create index if not exists support_requests_status_created_at
  on public.support_requests (status, created_at desc);

create index if not exists support_requests_topic_status
  on public.support_requests (topic, status);

create index if not exists support_requests_email
  on public.support_requests (email);

alter table public.support_requests enable row level security;

revoke all on table public.support_requests from public, anon, authenticated;
grant select, insert, update on table public.support_requests to service_role;
