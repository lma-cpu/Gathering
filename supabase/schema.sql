create extension if not exists "pgcrypto";

create table if not exists public.hangout_sessions (
  id uuid primary key default gen_random_uuid(),
  creator_name text not null,
  city text not null,
  title text,
  date_range text,
  status text not null default 'collecting' check (status in ('collecting', 'finalized')),
  creator_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.friend_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.hangout_sessions(id) on delete cascade,
  friend_name text not null,
  available_slots jsonb not null default '[]'::jsonb,
  chosen_vibes text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.final_itineraries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.hangout_sessions(id) on delete cascade,
  selected_date text not null,
  selected_time text not null,
  venue_name text not null,
  venue_address text not null,
  google_maps_url text not null,
  weather_condition text not null,
  ai_reasoning text not null,
  created_at timestamptz not null default now()
);

create index if not exists friend_responses_session_id_idx on public.friend_responses(session_id);
create index if not exists final_itineraries_session_id_idx on public.final_itineraries(session_id);

alter table public.hangout_sessions enable row level security;
alter table public.friend_responses enable row level security;
alter table public.final_itineraries enable row level security;

-- Everyone can view sessions
drop policy if exists "Invite sessions are readable" on public.hangout_sessions;
create policy "Invite sessions are readable"
  on public.hangout_sessions for select
  using (true);

-- Authenticated users can create sessions, or anyone can create without auth
drop policy if exists "Anyone can create invite sessions" on public.hangout_sessions;
create policy "Anyone can create invite sessions"
  on public.hangout_sessions for insert
  with check (status = 'collecting');

-- Only the creator or an admin can update/finalize their session
drop policy if exists "Creators can update their sessions" on public.hangout_sessions;
create policy "Creators can update their sessions"
  on public.hangout_sessions for update
  using (creator_id = auth.uid() or creator_id is null)
  with check (creator_id = auth.uid() or creator_id is null);

-- Responses are readable by anyone
drop policy if exists "Session responses are readable" on public.friend_responses;
create policy "Session responses are readable"
  on public.friend_responses for select
  using (true);

-- Anyone can add responses to sessions still collecting
drop policy if exists "Anyone can add responses to collecting sessions" on public.friend_responses;
create policy "Anyone can add responses to collecting sessions"
  on public.friend_responses for insert
  with check (
    exists (
      select 1
      from public.hangout_sessions
      where hangout_sessions.id = friend_responses.session_id
        and hangout_sessions.status = 'collecting'
    )
  );

-- Final itineraries are readable by anyone
drop policy if exists "Final itineraries are readable" on public.final_itineraries;
create policy "Final itineraries are readable"
  on public.final_itineraries for select
  using (true);
