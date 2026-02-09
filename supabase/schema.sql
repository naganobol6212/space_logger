-- Space Logger schema for Supabase
-- Run this in Supabase SQL Editor

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  avatar text,
  streak integer not null default 0,
  github_username text,
  github_repo text,
  github_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.logs (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  duration text not null,
  duration_minutes integer not null default 0,
  learning_type text,
  tags jsonb not null default '[]'::jsonb,
  memo text not null default '',
  timestamp timestamptz not null default now(),
  category text not null default 'Frontend',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_logs_user_id_timestamp on public.logs(user_id, timestamp desc);

alter table public.profiles enable row level security;
alter table public.logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "logs_select_own" on public.logs;
create policy "logs_select_own" on public.logs
for select using (auth.uid() = user_id);

drop policy if exists "logs_insert_own" on public.logs;
create policy "logs_insert_own" on public.logs
for insert with check (auth.uid() = user_id);

drop policy if exists "logs_update_own" on public.logs;
create policy "logs_update_own" on public.logs
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "logs_delete_own" on public.logs;
create policy "logs_delete_own" on public.logs
for delete using (auth.uid() = user_id);
