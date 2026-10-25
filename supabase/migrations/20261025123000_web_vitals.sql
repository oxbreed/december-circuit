-- First-party Core Web Vitals samples for /admin performance cards.
-- Collected in-browser (LCP / INP / CLS); no visitor IP. Service role only.

create table public.web_vitals (
  id uuid primary key default gen_random_uuid(),
  path text not null check (char_length(path) between 1 and 512),
  metric text not null check (metric in ('LCP', 'INP', 'CLS', 'FCP', 'TTFB')),
  value double precision not null check (value >= 0),
  rating text check (rating is null or rating in ('good', 'needs-improvement', 'poor')),
  country text check (country is null or country ~ '^[A-Z]{2}$'),
  ts timestamptz not null default now()
);

comment on table public.web_vitals is
  'Cookieless first-party Web Vitals. No visitor IP. Service role only.';

create index web_vitals_ts_desc on public.web_vitals (ts desc);
create index web_vitals_metric_ts on public.web_vitals (metric, ts desc);
create index web_vitals_path_ts on public.web_vitals (path, ts desc);

alter table public.web_vitals enable row level security;

revoke all on table public.web_vitals from public, anon, authenticated;

grant select, insert, delete on table public.web_vitals to service_role;
