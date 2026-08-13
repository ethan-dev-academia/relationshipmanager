-- ============================================================
-- Us — Supabase setup. Paste this whole file into the Supabase
-- SQL Editor and run it once. Safe to re-run (idempotent).
--
-- This is all the app needs today: a tiny key/value table that
-- the two devices mirror live (currency, messages, game moves,
-- quiz progress all sync through it). Auth is handled by Supabase.
-- ============================================================

create table if not exists public.shared_state (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz default now()
);

alter table public.shared_state enable row level security;

-- It's just the two of you: any signed-in user may read/write the shared row.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public'
      and tablename='shared_state' and policyname='auth read shared_state') then
    execute 'create policy "auth read shared_state" on public.shared_state for select to authenticated using (true)';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public'
      and tablename='shared_state' and policyname='auth insert shared_state') then
    execute 'create policy "auth insert shared_state" on public.shared_state for insert to authenticated with check (true)';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public'
      and tablename='shared_state' and policyname='auth update shared_state') then
    execute 'create policy "auth update shared_state" on public.shared_state for update to authenticated using (true)';
  end if;
end $$;

-- Optional: also stream row changes over Realtime (the app mainly uses
-- broadcast/presence which need no table, so this is just a nice-to-have).
do $$
begin
  begin
    alter publication supabase_realtime add table public.shared_state;
  exception when others then null;  -- already added / not applicable
  end;
end $$;
