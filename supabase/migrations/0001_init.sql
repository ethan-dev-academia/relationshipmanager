-- Us — initial schema
-- Designed for exactly two people (you + your SO) sharing one "couple" space.
-- Run this in the Supabase SQL editor after creating your project.

-- 1. Profiles (one row per auth user) ---------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text check (role in ('me','partner')),
  created_at timestamptz default now()
);

-- 2. Timeline entries -------------------------------------------------------
create table if not exists public.timeline_entries (
  id uuid primary key default gen_random_uuid(),
  author uuid references auth.users(id) on delete set null,
  date date not null,
  title text not null,
  note text,
  emoji text,
  created_at timestamptz default now()
);

-- 3. Shared currency ledger (single shared pool) ----------------------------
create table if not exists public.currency_ledger (
  id uuid primary key default gen_random_uuid(),
  amount integer not null,          -- positive = earned, negative = spent
  reason text not null,
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- 4. Quiz answers -----------------------------------------------------------
create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  quiz_id text not null,
  question_id text not null,
  author uuid references auth.users(id) on delete cascade,
  answer text not null,
  created_at timestamptz default now(),
  unique (quiz_id, question_id, author)
);

-- 5. Location pings (latest known position per person) ----------------------
create table if not exists public.location_pings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  updated_at timestamptz default now()
);

-- 6. Long-term game scores --------------------------------------------------
create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  game text not null,               -- 'pong', 'chess', ...
  user_id uuid references auth.users(id) on delete cascade,
  score integer default 0,
  updated_at timestamptz default now(),
  unique (game, user_id)
);

-- Row Level Security --------------------------------------------------------
-- Since it's just the two of you, any authenticated user can read/write the
-- shared couple data. Tighten later with a couple_id if you ever want more.
alter table public.profiles          enable row level security;
alter table public.timeline_entries  enable row level security;
alter table public.currency_ledger   enable row level security;
alter table public.quiz_answers       enable row level security;
alter table public.location_pings     enable row level security;
alter table public.game_scores        enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','timeline_entries','currency_ledger',
    'quiz_answers','location_pings','game_scores'
  ]
  loop
    execute format(
      'create policy "authenticated can read %1$s" on public.%1$s for select to authenticated using (true);',
      t
    );
    execute format(
      'create policy "authenticated can write %1$s" on public.%1$s for insert to authenticated with check (true);',
      t
    );
    execute format(
      'create policy "authenticated can update %1$s" on public.%1$s for update to authenticated using (true);',
      t
    );
    execute format(
      'create policy "authenticated can delete %1$s" on public.%1$s for delete to authenticated using (true);',
      t
    );
  end loop;
end $$;
