-- Free place / business intake. Rows stay unpublished until a person checks them.
-- Coordinates are only those the submitter picked from an OpenStreetMap lookup.

alter table public.submissions
  add column if not exists category text;

alter table public.submissions
  add column if not exists note text;

alter table public.submissions
  add column if not exists latitude double precision;

alter table public.submissions
  add column if not exists longitude double precision;

comment on column public.submissions.category is
  'Place or business category chosen on /list. Not published from this table.';

comment on column public.submissions.note is
  'Optional note from the submitter. Not published from this table.';

comment on column public.submissions.latitude is
  'Optional OpenStreetMap Nominatim latitude the submitter picked. Never invented.';

comment on column public.submissions.longitude is
  'Optional OpenStreetMap Nominatim longitude the submitter picked. Never invented.';

do $$
declare
  cons name;
begin
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
  drop constraint if exists submissions_note_length;

alter table public.submissions
  drop constraint if exists submissions_coordinates_pair;

alter table public.submissions
  add constraint submissions_kind_check
  check (kind in ('event', 'product', 'transportation', 'booking', 'placement', 'place', 'business'));

alter table public.submissions
  add constraint submissions_note_length
  check (note is null or char_length(btrim(note)) between 1 and 500);

alter table public.submissions
  add constraint submissions_coordinates_pair
  check (
    (latitude is null and longitude is null)
    or (
      latitude is not null
      and longitude is not null
      and latitude between -90 and 90
      and longitude between -180 and 180
    )
  );

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
      or (
        kind in ('place', 'business')
        and business_name is not null
        and city is not null
        and city in ('Lagos', 'Accra', 'Calabar')
        and category is not null
        and category in (
          'Hotels',
          'Short-stay',
          'Bars',
          'Car rental',
          'Catering',
          'Clubs',
          'Event centres',
          'Practical stops',
          'Restaurants'
        )
      )
    )
  );
