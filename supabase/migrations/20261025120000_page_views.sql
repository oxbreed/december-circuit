-- First-party page views for /admin summaries.
-- Country comes from edge headers (x-vercel-ip-country / cf-ipcountry) on ingest.
-- No visitor IP is stored. Anon/authenticated have no grants; service_role only.

create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null check (char_length(path) between 1 and 512),
  country text check (country is null or country ~ '^[A-Z]{2}$'),
  referrer text check (referrer is null or char_length(referrer) <= 512),
  ua text check (ua is null or char_length(ua) <= 256),
  ts timestamptz not null default now()
);

comment on table public.page_views is
  'Cookieless first-party page views. Country from edge headers only. Service role only.';

create index page_views_ts_desc on public.page_views (ts desc);
create index page_views_path_ts on public.page_views (path, ts desc);
create index page_views_country_ts on public.page_views (country, ts desc);

alter table public.page_views enable row level security;

revoke all on table public.page_views from public, anon, authenticated;

grant select, insert, delete on table public.page_views to service_role;
