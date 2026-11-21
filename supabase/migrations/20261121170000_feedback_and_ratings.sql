alter table public.support_requests
  drop constraint if exists support_requests_topic_check,
  add constraint support_requests_topic_check
    check (topic in ('visitor', 'listing', 'partnership', 'feedback', 'other'));

create table public.listing_ratings (
  subject_kind text not null check (subject_kind in ('event', 'place')),
  subject_slug text not null check (char_length(subject_slug) between 1 and 200),
  author_id uuid not null references auth.users(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  primary key (subject_kind, subject_slug, author_id)
);

alter table public.listing_ratings enable row level security;
revoke all on table public.listing_ratings from public, anon, authenticated;
grant select, insert, update on table public.listing_ratings to service_role;

create function public.listing_rating_summary(kind text, slug text)
returns table (average numeric, total integer)
language sql stable security invoker set search_path = ''
as $$
  select round(avg(score), 1), count(*)::integer
  from public.listing_ratings
  where subject_kind = kind and subject_slug = slug;
$$;

revoke all on function public.listing_rating_summary(text, text) from public, anon, authenticated;
grant execute on function public.listing_rating_summary(text, text) to service_role;
