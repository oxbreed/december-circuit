-- WordPress-shaped probe hits on this Next.js app (not WordPress).
-- Inserts go through a server ingest route with a shared secret + service role.
-- Anon and authenticated have no table grants; RLS stays on with no public policies.

create table public.wp_probes (
  id uuid primary key default gen_random_uuid(),
  path text not null check (char_length(path) between 1 and 2048),
  method text not null check (char_length(method) between 1 and 16),
  ua text check (ua is null or char_length(ua) <= 2048),
  ip text check (ip is null or char_length(ip) <= 128),
  xff text check (xff is null or char_length(xff) <= 1024),
  referer text check (referer is null or char_length(referer) <= 2048),
  host text check (host is null or char_length(host) <= 512),
  ts timestamptz not null default now()
);

comment on table public.wp_probes is
  'Scanner hits on WordPress-shaped paths. Not public. Service role only.';

create index wp_probes_ts_desc on public.wp_probes (ts desc);
create index wp_probes_path_ts on public.wp_probes (path, ts desc);
create index wp_probes_ip_ts on public.wp_probes (ip, ts desc);

create table public.wp_probe_settings (
  id smallint primary key default 1 check (id = 1),
  logging_enabled boolean not null default true,
  retention_days integer check (retention_days is null or retention_days between 1 and 3650),
  updated_at timestamptz not null default now()
);

comment on table public.wp_probe_settings is
  'Singleton (id=1). Controls whether probe hits are stored and how long they are kept.';

insert into public.wp_probe_settings (id, logging_enabled, retention_days)
values (1, true, 30)
on conflict (id) do nothing;

alter table public.wp_probes enable row level security;
alter table public.wp_probe_settings enable row level security;

revoke all on table public.wp_probes from public, anon, authenticated;
revoke all on table public.wp_probe_settings from public, anon, authenticated;
