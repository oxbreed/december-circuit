-- Control panel: submission approval states, directory overlays, and an audit log.
-- Not applied from the pull request that adds this file.
-- Until this runs, /admin still works: Approvals, Content, and Audit show a
-- "needs a database update" state, and the public site keeps using the TypeScript
-- seed files (events.ts, places.ts, landmarks.ts, home-featured.ts).

-- ---------------------------------------------------------------------------
-- Submissions may be approved or rejected. Existing rows stay 'unpublished'
-- (the pending inbox). Public intake may still insert only unpublished rows.
-- ---------------------------------------------------------------------------

do $$
declare
  cons name;
begin
  select c.conname into cons
  from pg_constraint c
  where c.conrelid = 'public.submissions'::regclass
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) ~* 'status'
    and pg_get_constraintdef(c.oid) like '%unpublished%'
    and pg_get_constraintdef(c.oid) not like '%event_name%'
    and pg_get_constraintdef(c.oid) not like '%sender_email%';
  if cons is not null then
    execute format('alter table public.submissions drop constraint %I', cons);
  end if;
end $$;

alter table public.submissions drop constraint if exists submissions_status_check;

alter table public.submissions
  add constraint submissions_status_check
  check (status in ('unpublished', 'approved', 'rejected'));

alter table public.submissions
  add column if not exists review_note text;

alter table public.submissions
  drop constraint if exists submissions_review_note_length;

alter table public.submissions
  add constraint submissions_review_note_length
  check (review_note is null or char_length(btrim(review_note)) between 1 and 1000);

alter table public.submissions
  add column if not exists reviewed_at timestamptz;

alter table public.submissions
  add column if not exists reviewed_by text;

alter table public.submissions
  add column if not exists published_slug text;

alter table public.submissions
  add column if not exists updated_at timestamptz not null default now();

comment on table public.submissions is
  'Directory intake. status unpublished is pending review. approved rows may be published through directory_entries. rejected rows stay off the public site.';

comment on column public.submissions.review_note is
  'Optional note left by the reviewing admin.';

comment on column public.submissions.reviewed_by is
  'Email of the admin who last approved or rejected the row.';

create index if not exists submissions_status_created_at
  on public.submissions (status, created_at desc);

create index if not exists submissions_kind_status
  on public.submissions (kind, status);

-- ---------------------------------------------------------------------------
-- Overlay / CMS rows. The TypeScript seed files remain the fallback.
-- ---------------------------------------------------------------------------

create table if not exists public.directory_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('event', 'place', 'landmark', 'featured', 'placement')),
  slug text not null check (char_length(btrim(slug)) between 1 and 180),
  title text not null check (char_length(btrim(title)) between 1 and 240),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'unpublished', 'scheduled')),
  source text not null default 'admin'
    check (source in ('seed', 'submission', 'admin')),
  payload jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  publish_at timestamptz,
  unpublish_at timestamptz,
  submission_id uuid references public.submissions (id) on delete set null,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, slug)
);

comment on table public.directory_entries is
  'Admin-managed overlays for events, places, landmarks, featured cards, and placements. Seed TypeScript files are the fallback when a slug has no published row. An unpublished overlay hides the matching seed row.';

create index if not exists directory_entries_kind_status
  on public.directory_entries (kind, status, sort_order);

create index if not exists directory_entries_publish_at
  on public.directory_entries (publish_at);

create index if not exists directory_entries_submission_id
  on public.directory_entries (submission_id);

alter table public.directory_entries enable row level security;

revoke all on table public.directory_entries from public, anon, authenticated;
grant select, insert, update, delete on table public.directory_entries to service_role;

-- ---------------------------------------------------------------------------
-- Append-only audit of admin actions.
-- ---------------------------------------------------------------------------

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_email text not null check (position('@' in actor_email) > 1),
  action text not null check (char_length(btrim(action)) between 1 and 80),
  entity_type text not null check (char_length(btrim(entity_type)) between 1 and 80),
  entity_id text,
  summary text not null check (char_length(btrim(summary)) between 1 and 500),
  payload jsonb,
  created_at timestamptz not null default now()
);

comment on table public.admin_audit_log is
  'Append-only log of admin control-panel actions. Written by the service role after an allowlisted server action.';

create index if not exists admin_audit_log_created_at
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_entity
  on public.admin_audit_log (entity_type, entity_id, created_at desc);

alter table public.admin_audit_log enable row level security;

revoke all on table public.admin_audit_log from public, anon, authenticated;
grant select, insert on table public.admin_audit_log to service_role;
