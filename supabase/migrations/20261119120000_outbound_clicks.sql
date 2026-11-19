-- First-party outbound click log for /go/<partner> affiliate redirects and
-- tracked ticket / paid-sponsor links. Used to report clicks per partner and
-- placement (for affiliate review and organiser reporting).
-- No visitor IP is stored. Country comes from edge headers only.
-- Anon/authenticated have no grants; service_role only (same as page_views).

create table public.outbound_clicks (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('partner', 'ticket', 'sponsor')),
  partner text not null check (char_length(partner) between 1 and 64),
  target text check (target is null or char_length(target) <= 160),
  destination_host text not null check (char_length(destination_host) between 1 and 255),
  placement text check (placement is null or char_length(placement) <= 64),
  from_path text check (from_path is null or char_length(from_path) <= 512),
  referrer_host text check (referrer_host is null or char_length(referrer_host) <= 255),
  country text check (country is null or country ~ '^[A-Z]{2}$'),
  earning boolean not null default false,
  ts timestamptz not null default now()
);

comment on table public.outbound_clicks is
  'Cookieless first-party outbound clicks (affiliate /go/ redirects, ticket and sponsor links). No IP. Service role only.';

create index outbound_clicks_ts_desc on public.outbound_clicks (ts desc);
create index outbound_clicks_partner_ts on public.outbound_clicks (partner, ts desc);
create index outbound_clicks_placement_ts on public.outbound_clicks (placement, ts desc);

alter table public.outbound_clicks enable row level security;

revoke all on table public.outbound_clicks from public, anon, authenticated;

grant select, insert, delete on table public.outbound_clicks to service_role;
