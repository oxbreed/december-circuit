-- Joining requires the invitation token, not just the list ID.
drop policy "trip members insert for owner" on public.trip_list_members;
revoke insert, update on public.trip_list_members from authenticated;

create function public.trip_join_by_token(p_token text)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare v_list public.trip_lists%rowtype;
begin
  if auth.uid() is null then return false; end if;
  select * into v_list from public.trip_lists where is_group and share_token = p_token;
  if not found then return false; end if;
  if v_list.owner_id <> auth.uid() then
    insert into public.trip_list_members (list_id, user_id, role)
    values (v_list.id, auth.uid(), 'editor')
    on conflict do nothing;
  end if;
  return true;
end;
$$;

-- Keep list identity and sharing settings under the owner's control.
drop policy "trip list update for editor" on public.trip_lists;
create policy "trip list update for owner" on public.trip_lists for update to authenticated
using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create function public.trip_write(p_items jsonb, p_title text default null, p_token text default null)
returns uuid language plpgsql security invoker set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_list uuid;
begin
  if v_user is null then raise insufficient_privilege; end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) > 500 then
    raise exception 'Invalid trip items';
  end if;

  if p_token is not null then
    insert into public.trip_lists (owner_id, title, is_group, share_token)
    values (v_user, p_title, true, p_token) returning id into v_list;
  else
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text, 0));
    select id into v_list from public.trip_lists
      where owner_id = v_user and not is_group order by updated_at desc, id limit 1;
    if v_list is null then
      insert into public.trip_lists (owner_id) values (v_user) returning id into v_list;
    end if;
    delete from public.trip_list_items where list_id = v_list;
    update public.trip_lists set updated_at = now() where id = v_list;
  end if;

  insert into public.trip_list_items (list_id, kind, item_id, sort_order)
  select v_list, item->>'kind', item->>'id', min(position)::int - 1
  from jsonb_array_elements(p_items) with ordinality as entries(item, position)
  group by item->>'kind', item->>'id';
  return v_list;
end;
$$;

revoke all on function public.trip_join_by_token(text), public.trip_write(jsonb,text,text) from public, anon;
grant execute on function public.trip_join_by_token(text), public.trip_write(jsonb,text,text) to authenticated;
