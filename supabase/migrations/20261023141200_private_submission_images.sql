-- Private picture for an unpublished submission.
-- The bucket row is the bucket itself. No submission rows and no sample images.

alter table public.submissions
  add column if not exists image_path text;

alter table public.submissions
  drop constraint if exists submissions_image_path_object;

alter table public.submissions
  add constraint submissions_image_path_object
  check (
    image_path is null
    or image_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'
  );

comment on column public.submissions.image_path is
  'Object name in the private submission-images bucket. Not a public URL.';

-- A business placement stays unpublished. The status check is unchanged.
do $$
declare
  cons name;
begin
  -- Postgres stores "kind in (...)" as "kind = ANY (ARRAY[...])".
  select c.conname into cons
  from pg_constraint c
  where c.conrelid = 'public.submissions'::regclass
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) like '%event%'
    and pg_get_constraintdef(c.oid) not like '%public_link%';
  if cons is null then
    raise exception 'submissions kind check was not found';
  end if;
  execute format('alter table public.submissions drop constraint %I', cons);

  select c.conname into cons
  from pg_constraint c
  where c.conrelid = 'public.submissions'::regclass
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) like '%public_link%';
  if cons is null then
    raise exception 'submissions content check was not found';
  end if;
  execute format('alter table public.submissions drop constraint %I', cons);
end $$;

alter table public.submissions
  add constraint submissions_kind_check
  check (kind in ('event', 'product', 'transportation', 'booking', 'placement'));

alter table public.submissions
  add constraint submissions_content
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
      or (
        kind = 'placement'
        and business_name is not null
      )
    )
  );

alter table storage.objects enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'submission-images',
  'submission-images',
  false,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Upload only. No select policy grants a read or a list of this bucket.
create policy "upload submission image"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'submission-images'
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'
  );

create policy "submission images are not public"
  on storage.objects
  as restrictive
  for select
  to anon, authenticated
  using (bucket_id is distinct from 'submission-images');
