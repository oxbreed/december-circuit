-- Unpublished submissions and text reviews.
-- The public event list is the file in the app, not this table.
-- This migration inserts no review rows.

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('event', 'product', 'transportation', 'booking')),
  status text not null default 'unpublished' check (status = 'unpublished'),
  sender_email text not null check (position('@' in sender_email) > 1 and char_length(sender_email) <= 320),
  event_name text,
  city text,
  dates text,
  venue text,
  product_name text,
  business_name text,
  offer text,
  public_link text,
  created_at timestamptz not null default now(),
  check (
    public_link is not null
    and public_link ~* '^https?://'
    and (
      (
        kind = 'event'
        and event_name is not null
        and city is not null
        and dates is not null
        and venue is not null
      )
      or (
        kind = 'product'
        and product_name is not null
        and business_name is not null
      )
      or (
        kind in ('transportation', 'booking')
        and business_name is not null
        and offer is not null
      )
    )
  )
);

comment on table public.submissions is
  'Held off the public event list. A row cannot leave the unpublished status.';

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  author_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.reviews is
  'Text only. There is no rating column and this migration inserts no rows.';

alter table public.submissions enable row level security;
alter table public.reviews enable row level security;

revoke all on table public.submissions from public, anon, authenticated;
grant insert on table public.submissions to anon, authenticated;

revoke all on table public.reviews from public, anon, authenticated;
grant select on table public.reviews to anon, authenticated;
grant insert on table public.reviews to authenticated;

create policy "insert unpublished submission"
  on public.submissions
  for insert
  to anon, authenticated
  with check (status = 'unpublished');

create policy "public reads review text"
  on public.reviews
  for select
  to anon, authenticated
  using (true);

create policy "signed-in visitor inserts own review"
  on public.reviews
  for insert
  to authenticated
  with check (author_id = auth.uid());
