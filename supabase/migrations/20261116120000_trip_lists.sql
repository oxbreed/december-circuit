-- Cloud-synced trip lists (personal + group). No seeded rows.

create table public.trip_lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'My trip' check (char_length(btrim(title)) between 1 and 120),
  is_group boolean not null default false,
  share_token text unique check (share_token is null or share_token ~ '^[a-z0-9]{20,64}$'),
  updated_at timestamptz not null default now()
);

comment on table public.trip_lists is
  'Saved directory events/places per account. share_token powers read-only or join links for group trips.';

create table public.trip_list_items (
  list_id uuid not null references public.trip_lists (id) on delete cascade,
  kind text not null check (kind in ('event', 'place')),
  item_id text not null check (char_length(item_id) between 1 and 200),
  sort_order int not null default 0,
  primary key (list_id, kind, item_id)
);

create table public.trip_list_members (
  list_id uuid not null references public.trip_lists (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  primary key (list_id, user_id)
);

create index trip_lists_owner_idx on public.trip_lists (owner_id);
create index trip_list_items_list_sort_idx on public.trip_list_items (list_id, sort_order);

alter table public.trip_lists enable row level security;
alter table public.trip_list_items enable row level security;
alter table public.trip_list_members enable row level security;

revoke all on table public.trip_lists from public, anon, authenticated;
revoke all on table public.trip_list_items from public, anon, authenticated;
revoke all on table public.trip_list_members from public, anon, authenticated;

grant select, insert, update, delete on table public.trip_lists to authenticated;
grant select, insert, update, delete on table public.trip_list_items to authenticated;
grant select, insert, update, delete on table public.trip_list_members to authenticated;

create or replace function public.trip_list_can_edit(p_list_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trip_lists tl
    left join public.trip_list_members m on m.list_id = tl.id and m.user_id = auth.uid()
    where tl.id = p_list_id
      and (
        tl.owner_id = auth.uid()
        or (m.user_id is not null and m.role in ('owner', 'editor'))
      )
  );
$$;

create policy "trip list read for owner or member"
  on public.trip_lists
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.trip_list_members m
      where m.list_id = trip_lists.id and m.user_id = auth.uid()
    )
  );

create policy "trip list insert own"
  on public.trip_lists
  for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "trip list update for editor"
  on public.trip_lists
  for update
  to authenticated
  using (public.trip_list_can_edit(id))
  with check (public.trip_list_can_edit(id));

create policy "trip list delete for owner"
  on public.trip_lists
  for delete
  to authenticated
  using (owner_id = auth.uid());

create policy "trip items read for editor"
  on public.trip_list_items
  for select
  to authenticated
  using (public.trip_list_can_edit(list_id));

create policy "trip items write for editor"
  on public.trip_list_items
  for all
  to authenticated
  using (public.trip_list_can_edit(list_id))
  with check (public.trip_list_can_edit(list_id));

create policy "trip members read for editor"
  on public.trip_list_members
  for select
  to authenticated
  using (public.trip_list_can_edit(list_id));

create policy "trip members insert for owner"
  on public.trip_list_members
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.trip_lists tl
      where tl.id = list_id and tl.owner_id = auth.uid()
    )
    or (
      user_id = auth.uid()
      and exists (
        select 1 from public.trip_lists tl
        where tl.id = list_id and tl.share_token is not null and tl.is_group
      )
    )
  );

create policy "trip members delete self or owner"
  on public.trip_list_members
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.trip_lists tl
      where tl.id = list_id and tl.owner_id = auth.uid()
    )
  );

create or replace function public.trip_shared_snapshot(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_list public.trip_lists%rowtype;
  v_items json;
begin
  if p_token is null or length(btrim(p_token)) < 20 then
    return null;
  end if;
  select * into v_list from public.trip_lists where share_token = p_token limit 1;
  if not found then
    return null;
  end if;
  select coalesce(
    json_agg(json_build_object('kind', kind, 'id', item_id) order by sort_order, kind, item_id),
    '[]'::json
  )
  into v_items
  from public.trip_list_items
  where list_id = v_list.id;

  return json_build_object(
    'id', v_list.id,
    'title', v_list.title,
    'is_group', v_list.is_group,
    'items', v_items
  );
end;
$$;

revoke all on function public.trip_shared_snapshot(text) from public;
grant execute on function public.trip_shared_snapshot(text) to anon, authenticated;