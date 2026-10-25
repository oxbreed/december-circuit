-- UGC layer: subject-scoped reviews with ratings, helpful votes, review photos, and Q&A.
-- Extends public.reviews (text-only, Auth insert). Does not invent or seed any UGC rows.
-- Verified directory listings still must not invent ratings; these tables hold visitor UGC only.

-- ---------------------------------------------------------------------------
-- Reviews: subject, rating, publish status
-- ---------------------------------------------------------------------------

alter table public.reviews
  add column if not exists subject_kind text;

alter table public.reviews
  add column if not exists subject_key text;

alter table public.reviews
  add column if not exists rating smallint;

alter table public.reviews
  add column if not exists status text;

-- Legacy rows (home text reviews) stay public and unscoped.
update public.reviews
set
  subject_kind = coalesce(subject_kind, 'site'),
  subject_key = coalesce(subject_key, 'home'),
  status = coalesce(status, 'published')
where subject_kind is null
   or subject_key is null
   or status is null;

alter table public.reviews
  alter column subject_kind set default 'site';

alter table public.reviews
  alter column subject_key set default 'home';

alter table public.reviews
  alter column status set default 'published';

alter table public.reviews
  alter column subject_kind set not null;

alter table public.reviews
  alter column subject_key set not null;

alter table public.reviews
  alter column status set not null;

alter table public.reviews
  drop constraint if exists reviews_subject_kind_check;

alter table public.reviews
  add constraint reviews_subject_kind_check
  check (subject_kind in ('event', 'place', 'site'));

alter table public.reviews
  drop constraint if exists reviews_subject_key_length;

alter table public.reviews
  add constraint reviews_subject_key_length
  check (char_length(btrim(subject_key)) between 1 and 200);

alter table public.reviews
  drop constraint if exists reviews_rating_range;

alter table public.reviews
  add constraint reviews_rating_range
  check (rating is null or rating between 1 and 5);

alter table public.reviews
  drop constraint if exists reviews_status_check;

alter table public.reviews
  add constraint reviews_status_check
  check (status in ('published', 'unpublished'));

-- Subject reviews carry a star rating; site-wide text reviews may omit it.
alter table public.reviews
  drop constraint if exists reviews_rating_for_subject;

alter table public.reviews
  add constraint reviews_rating_for_subject
  check (
    (subject_kind = 'site' and rating is null)
    or (subject_kind in ('event', 'place') and rating between 1 and 5)
  );

comment on table public.reviews is
  'Visitor UGC. Ratings apply only to event/place subjects. No seed rows.';

comment on column public.reviews.subject_kind is
  'event | place | site. site is the home reviews strip.';

comment on column public.reviews.subject_key is
  'Event slug, place key, or home. Never invent ratings on verified directory files.';

comment on column public.reviews.rating is
  '1–5 for event/place UGC. Null for legacy site text reviews.';

comment on column public.reviews.status is
  'published is public-readable. unpublished waits for a person to check it.';

create index if not exists reviews_subject_published_idx
  on public.reviews (subject_kind, subject_key, created_at)
  where status = 'published';

drop policy if exists "public reads review text" on public.reviews;
drop policy if exists "public reads published reviews" on public.reviews;
drop policy if exists "signed-in visitor inserts own review" on public.reviews;

create policy "public reads published reviews"
  on public.reviews
  for select
  to anon, authenticated
  using (status = 'published');

create policy "signed-in visitor inserts own review"
  on public.reviews
  for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and status in ('published', 'unpublished')
  );

-- Authors can read their own unpublished reviews (moderation path).
drop policy if exists "author reads own unpublished reviews" on public.reviews;

create policy "author reads own unpublished reviews"
  on public.reviews
  for select
  to authenticated
  using (author_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Helpful votes
-- ---------------------------------------------------------------------------

create table if not exists public.helpful_votes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  voter_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (review_id, voter_id)
);

comment on table public.helpful_votes is
  'One helpful mark per signed-in visitor per review. No seed rows.';

create index if not exists helpful_votes_review_idx
  on public.helpful_votes (review_id);

alter table public.helpful_votes enable row level security;

revoke all on table public.helpful_votes from public, anon, authenticated;
grant select on table public.helpful_votes to anon, authenticated;
grant insert, delete on table public.helpful_votes to authenticated;

drop policy if exists "public reads helpful votes" on public.helpful_votes;
drop policy if exists "signed-in visitor marks helpful" on public.helpful_votes;
drop policy if exists "signed-in visitor removes own helpful mark" on public.helpful_votes;

create policy "public reads helpful votes"
  on public.helpful_votes
  for select
  to anon, authenticated
  using (true);

create policy "signed-in visitor marks helpful"
  on public.helpful_votes
  for insert
  to authenticated
  with check (
    voter_id = auth.uid()
    and exists (
      select 1
      from public.reviews r
      where r.id = review_id
        and r.status = 'published'
    )
  );

create policy "signed-in visitor removes own helpful mark"
  on public.helpful_votes
  for delete
  to authenticated
  using (voter_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Review photos (storage bucket plan: private, 4 MB objects, Free Tier 1 GB)
-- ---------------------------------------------------------------------------

create table if not exists public.review_photos (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  status text not null default 'unpublished'
    check (status in ('published', 'unpublished')),
  created_at timestamptz not null default now(),
  constraint review_photos_path_object
    check (
      storage_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'
    )
);

comment on table public.review_photos is
  'Paths in the private review-photos bucket. Unpublished until checked. No seed images.';

create index if not exists review_photos_review_published_idx
  on public.review_photos (review_id)
  where status = 'published';

alter table public.review_photos enable row level security;

revoke all on table public.review_photos from public, anon, authenticated;
grant select on table public.review_photos to anon, authenticated;
grant insert on table public.review_photos to authenticated;

drop policy if exists "public reads published review photos" on public.review_photos;
drop policy if exists "author reads own review photos" on public.review_photos;
drop policy if exists "signed-in visitor inserts own review photo" on public.review_photos;

create policy "public reads published review photos"
  on public.review_photos
  for select
  to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.reviews r
      where r.id = review_id
        and r.status = 'published'
    )
  );

create policy "author reads own review photos"
  on public.review_photos
  for select
  to authenticated
  using (author_id = auth.uid());

create policy "signed-in visitor inserts own review photo"
  on public.review_photos
  for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and status = 'unpublished'
    and exists (
      select 1
      from public.reviews r
      where r.id = review_id
        and r.author_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-photos',
  'review-photos',
  false,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "upload review photo" on storage.objects;
drop policy if exists "review photos are not public" on storage.objects;

create policy "upload review photo"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'review-photos'
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'
  );

-- Block anon/authenticated select on the private bucket (service role for signed URLs).
create policy "review photos are not public"
  on storage.objects
  as restrictive
  for select
  to anon, authenticated
  using (bucket_id is distinct from 'review-photos');

-- ---------------------------------------------------------------------------
-- Q&A
-- ---------------------------------------------------------------------------

create table if not exists public.ugc_questions (
  id uuid primary key default gen_random_uuid(),
  subject_kind text not null check (subject_kind in ('event', 'place')),
  subject_key text not null check (char_length(btrim(subject_key)) between 1 and 200),
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  author_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'published'
    check (status in ('published', 'unpublished')),
  created_at timestamptz not null default now()
);

comment on table public.ugc_questions is
  'Visitor questions on an event or place. No seed rows.';

create index if not exists ugc_questions_subject_published_idx
  on public.ugc_questions (subject_kind, subject_key, created_at)
  where status = 'published';

alter table public.ugc_questions enable row level security;

revoke all on table public.ugc_questions from public, anon, authenticated;
grant select on table public.ugc_questions to anon, authenticated;
grant insert on table public.ugc_questions to authenticated;

drop policy if exists "public reads published questions" on public.ugc_questions;
drop policy if exists "author reads own unpublished questions" on public.ugc_questions;
drop policy if exists "signed-in visitor inserts own question" on public.ugc_questions;

create policy "public reads published questions"
  on public.ugc_questions
  for select
  to anon, authenticated
  using (status = 'published');

create policy "author reads own unpublished questions"
  on public.ugc_questions
  for select
  to authenticated
  using (author_id = auth.uid());

create policy "signed-in visitor inserts own question"
  on public.ugc_questions
  for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and status in ('published', 'unpublished')
  );

create table if not exists public.ugc_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.ugc_questions (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  author_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'unpublished'
    check (status in ('published', 'unpublished')),
  created_at timestamptz not null default now()
);

comment on table public.ugc_answers is
  'Answers stay unpublished by default until a person checks them. No seed rows.';

create index if not exists ugc_answers_question_published_idx
  on public.ugc_answers (question_id, created_at)
  where status = 'published';

alter table public.ugc_answers enable row level security;

revoke all on table public.ugc_answers from public, anon, authenticated;
grant select on table public.ugc_answers to anon, authenticated;
grant insert on table public.ugc_answers to authenticated;

drop policy if exists "public reads published answers" on public.ugc_answers;
drop policy if exists "author reads own unpublished answers" on public.ugc_answers;
drop policy if exists "signed-in visitor inserts own answer" on public.ugc_answers;

create policy "public reads published answers"
  on public.ugc_answers
  for select
  to anon, authenticated
  using (status = 'published');

create policy "author reads own unpublished answers"
  on public.ugc_answers
  for select
  to authenticated
  using (author_id = auth.uid());

create policy "signed-in visitor inserts own answer"
  on public.ugc_answers
  for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and status = 'unpublished'
  );
