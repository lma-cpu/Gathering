-- Run this in Supabase SQL Editor if you already have the tables
-- but get "Could not find the 'creator_id' column" errors

alter table if exists public.hangout_sessions
  add column if not exists creator_id uuid references auth.users(id) on delete set null;

create index if not exists hangout_sessions_creator_id_idx on public.hangout_sessions(creator_id);
