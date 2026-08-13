-- Long-distance realtime foundation.
-- `shared_state` is a tiny key/value store the app mirrors live between the two
-- devices (via Supabase Realtime broadcast) and reads on late-join. Keys look
-- like "<couple-id>:<feature>" e.g. "our-room:home.messages" or
-- "our-room:match.chess".

create table if not exists public.shared_state (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

alter table public.shared_state enable row level security;

-- It's just the two of them; any authenticated user may read/write.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'shared_state'
      and policyname = 'authenticated can read shared_state'
  ) then
    execute 'create policy "authenticated can read shared_state" on public.shared_state for select to authenticated using (true)';
    execute 'create policy "authenticated can write shared_state" on public.shared_state for insert to authenticated with check (true)';
    execute 'create policy "authenticated can update shared_state" on public.shared_state for update to authenticated using (true)';
  end if;
end $$;

-- Broadcast/presence used by the app do not require a table, but enabling
-- Realtime on this table lets you also drive updates from Postgres changes.
alter publication supabase_realtime add table public.shared_state;
