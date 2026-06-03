-- Tic-Tac-Toe Arcade schema for the shared Gogi Supabase project.
-- All objects are prefixed with usr_nmexs7bytxq2_ttt_ to scope them to this user.
-- Safe to run multiple times.

-- ============================================================================
-- Tables
-- ============================================================================

create table if not exists public."usr_nmexs7bytxq2_ttt_profiles" (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  username text not null,
  points integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public."usr_nmexs7bytxq2_ttt_games" (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'waiting',
  board jsonb not null default '[null,null,null,null,null,null,null,null,null]'::jsonb,
  current_turn text not null default 'X',
  player_x text not null,
  player_x_name text not null,
  player_o text,
  player_o_name text,
  winner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists usr_nmexs7bytxq2_ttt_games_status_idx
  on public."usr_nmexs7bytxq2_ttt_games" (status, created_at desc);

create table if not exists public."usr_nmexs7bytxq2_ttt_souvenirs" (
  id text primary key,
  name text not null,
  emoji text not null,
  price integer not null,
  description text not null,
  sort integer not null default 0
);

create table if not exists public."usr_nmexs7bytxq2_ttt_purchases" (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  souvenir_id text not null,
  souvenir_name text not null,
  souvenir_emoji text not null,
  price integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, souvenir_id)
);

create index if not exists usr_nmexs7bytxq2_ttt_purchases_user_idx
  on public."usr_nmexs7bytxq2_ttt_purchases" (user_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public."usr_nmexs7bytxq2_ttt_profiles" enable row level security;
alter table public."usr_nmexs7bytxq2_ttt_games" enable row level security;
alter table public."usr_nmexs7bytxq2_ttt_souvenirs" enable row level security;
alter table public."usr_nmexs7bytxq2_ttt_purchases" enable row level security;

-- Profiles: readable by any authenticated user (so opponents and the
-- leaderboard can show names + points). Point/counter mutations only happen
-- through SECURITY DEFINER functions below, so there is no direct UPDATE policy
-- and points cannot be tampered with from the client.
drop policy if exists "profiles_read" on public."usr_nmexs7bytxq2_ttt_profiles";
create policy "profiles_read" on public."usr_nmexs7bytxq2_ttt_profiles"
  for select to authenticated using (true);

-- Games: readable by any authenticated user so the lobby can list open games
-- and both participants receive realtime updates. Moves go through RPCs.
drop policy if exists "games_read" on public."usr_nmexs7bytxq2_ttt_games";
create policy "games_read" on public."usr_nmexs7bytxq2_ttt_games"
  for select to authenticated using (true);

-- Souvenir catalog: readable by everyone (also guests browsing the store).
drop policy if exists "souvenirs_read" on public."usr_nmexs7bytxq2_ttt_souvenirs";
create policy "souvenirs_read" on public."usr_nmexs7bytxq2_ttt_souvenirs"
  for select to anon, authenticated using (true);

-- Purchases: a user can read only their own collection. Inserts happen through
-- the buy_souvenir RPC.
drop policy if exists "purchases_read_own" on public."usr_nmexs7bytxq2_ttt_purchases";
create policy "purchases_read_own" on public."usr_nmexs7bytxq2_ttt_purchases"
  for select to authenticated using (auth.uid()::text = user_id);

-- ============================================================================
-- Grants (explicit; required since the public-schema auto-grant was removed)
-- ============================================================================

grant select on public."usr_nmexs7bytxq2_ttt_profiles" to authenticated;
grant select on public."usr_nmexs7bytxq2_ttt_games" to authenticated;
grant select on public."usr_nmexs7bytxq2_ttt_souvenirs" to anon, authenticated;
grant select on public."usr_nmexs7bytxq2_ttt_purchases" to authenticated;

grant select, insert, update, delete on public."usr_nmexs7bytxq2_ttt_profiles" to service_role;
grant select, insert, update, delete on public."usr_nmexs7bytxq2_ttt_games" to service_role;
grant select, insert, update, delete on public."usr_nmexs7bytxq2_ttt_souvenirs" to service_role;
grant select, insert, update, delete on public."usr_nmexs7bytxq2_ttt_purchases" to service_role;

-- ============================================================================
-- Souvenir catalog seed (mirrors src/lib/store.js)
-- ============================================================================

insert into public."usr_nmexs7bytxq2_ttt_souvenirs" (id, name, emoji, price, description, sort) values
  ('lucky-star', 'Lucky Star', '⭐', 30, 'A little sparkle for good fortune.', 1),
  ('top-hat', 'Top Hat', '🎩', 50, 'Classy headwear for champions.', 2),
  ('medal', 'Champion Medal', '🎖️', 75, 'Proof you came, saw, and conquered.', 3),
  ('trophy', 'Golden Trophy', '🏆', 100, 'The classic symbol of victory.', 4),
  ('rocket', 'Pocket Rocket', '🚀', 120, 'To the moon and back.', 5),
  ('crown', 'Royal Crown', '👑', 150, 'Rule the tic-tac-toe kingdom.', 6),
  ('console', 'Retro Console', '🎮', 180, 'For the true arcade soul.', 7),
  ('unicorn', 'Unicorn Plush', '🦄', 200, 'Rare, magical, and very cuddly.', 8),
  ('diamond', 'Brilliant Diamond', '💎', 250, 'Forever shiny, forever yours.', 9),
  ('dragon', 'Dragon Figurine', '🐉', 300, 'Legendary loot for legends.', 10)
on conflict (id) do update
  set name = excluded.name,
      emoji = excluded.emoji,
      price = excluded.price,
      description = excluded.description,
      sort = excluded.sort;

-- ============================================================================
-- Helper: winner of a board (returns 'X', 'O', 'draw', or null)
-- ============================================================================

create or replace function public.usr_nmexs7bytxq2_ttt_winner(b jsonb)
returns text
language plpgsql
immutable
as $$
declare
  lines int[][] := array[
    array[0,1,2], array[3,4,5], array[6,7,8],
    array[0,3,6], array[1,4,7], array[2,5,8],
    array[0,4,8], array[2,4,6]
  ];
  ln int[];
  a text; c text; d text;
  i int;
begin
  foreach ln slice 1 in array lines loop
    a := b->>ln[1];
    c := b->>ln[2];
    d := b->>ln[3];
    if a is not null and a = c and a = d then
      return a;
    end if;
  end loop;
  for i in 0..8 loop
    if (b->>i) is null then
      return null;
    end if;
  end loop;
  return 'draw';
end;
$$;

-- ============================================================================
-- Profile bootstrap
-- ============================================================================

create or replace function public.usr_nmexs7bytxq2_ttt_ensure_profile(p_username text default null)
returns public."usr_nmexs7bytxq2_ttt_profiles"
language plpgsql
security definer
set search_path = public
as $$
declare
  uid text := auth.uid()::text;
  prof public."usr_nmexs7bytxq2_ttt_profiles";
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  insert into public."usr_nmexs7bytxq2_ttt_profiles" (user_id, username)
  values (uid, coalesce(nullif(trim(p_username), ''), 'Player ' || left(uid, 4)))
  on conflict (user_id) do nothing;
  select * into prof from public."usr_nmexs7bytxq2_ttt_profiles" where user_id = uid;
  return prof;
end;
$$;

create or replace function public.usr_nmexs7bytxq2_ttt_set_username(p_username text)
returns public."usr_nmexs7bytxq2_ttt_profiles"
language plpgsql
security definer
set search_path = public
as $$
declare
  uid text := auth.uid()::text;
  prof public."usr_nmexs7bytxq2_ttt_profiles";
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if coalesce(nullif(trim(p_username), ''), '') = '' then
    raise exception 'username required';
  end if;
  update public."usr_nmexs7bytxq2_ttt_profiles"
    set username = trim(p_username)
    where user_id = uid
    returning * into prof;
  return prof;
end;
$$;

-- Auto-create a profile whenever a new auth user signs up.
create or replace function public.usr_nmexs7bytxq2_ttt_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public."usr_nmexs7bytxq2_ttt_profiles" (user_id, username)
  values (
    new.id::text,
    coalesce(nullif(trim(new.raw_user_meta_data->>'username'), ''), split_part(new.email, '@', 1))
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists usr_nmexs7bytxq2_ttt_on_auth_user_created on auth.users;
create trigger usr_nmexs7bytxq2_ttt_on_auth_user_created
  after insert on auth.users
  for each row execute function public.usr_nmexs7bytxq2_ttt_handle_new_user();

-- ============================================================================
-- Single-player point award
-- ============================================================================

create or replace function public.usr_nmexs7bytxq2_ttt_award_vs_computer(p_result text)
returns public."usr_nmexs7bytxq2_ttt_profiles"
language plpgsql
security definer
set search_path = public
as $$
declare
  uid text := auth.uid()::text;
  prof public."usr_nmexs7bytxq2_ttt_profiles";
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  perform public.usr_nmexs7bytxq2_ttt_ensure_profile(null);
  if p_result = 'win' then
    update public."usr_nmexs7bytxq2_ttt_profiles"
      set points = points + 10, wins = wins + 1 where user_id = uid returning * into prof;
  elsif p_result = 'draw' then
    update public."usr_nmexs7bytxq2_ttt_profiles"
      set points = points + 4, draws = draws + 1 where user_id = uid returning * into prof;
  elsif p_result = 'loss' then
    update public."usr_nmexs7bytxq2_ttt_profiles"
      set points = points + 1, losses = losses + 1 where user_id = uid returning * into prof;
  else
    raise exception 'invalid result';
  end if;
  return prof;
end;
$$;

-- ============================================================================
-- Online play
-- ============================================================================

create or replace function public.usr_nmexs7bytxq2_ttt_create_online_game()
returns public."usr_nmexs7bytxq2_ttt_games"
language plpgsql
security definer
set search_path = public
as $$
declare
  uid text := auth.uid()::text;
  prof public."usr_nmexs7bytxq2_ttt_profiles";
  g public."usr_nmexs7bytxq2_ttt_games";
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  prof := public.usr_nmexs7bytxq2_ttt_ensure_profile(null);
  insert into public."usr_nmexs7bytxq2_ttt_games" (player_x, player_x_name)
  values (uid, prof.username)
  returning * into g;
  return g;
end;
$$;

create or replace function public.usr_nmexs7bytxq2_ttt_join_online_game(p_game_id uuid)
returns public."usr_nmexs7bytxq2_ttt_games"
language plpgsql
security definer
set search_path = public
as $$
declare
  uid text := auth.uid()::text;
  prof public."usr_nmexs7bytxq2_ttt_profiles";
  g public."usr_nmexs7bytxq2_ttt_games";
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  prof := public.usr_nmexs7bytxq2_ttt_ensure_profile(null);
  select * into g from public."usr_nmexs7bytxq2_ttt_games" where id = p_game_id for update;
  if not found then
    raise exception 'game not found';
  end if;
  if g.status <> 'waiting' or g.player_o is not null then
    raise exception 'game not joinable';
  end if;
  if g.player_x = uid then
    raise exception 'cannot join your own game';
  end if;
  update public."usr_nmexs7bytxq2_ttt_games"
    set player_o = uid, player_o_name = prof.username, status = 'active', updated_at = now()
    where id = p_game_id
    returning * into g;
  return g;
end;
$$;

create or replace function public.usr_nmexs7bytxq2_ttt_settle_online(g public."usr_nmexs7bytxq2_ttt_games")
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if g.winner = 'draw' then
    update public."usr_nmexs7bytxq2_ttt_profiles" set points = points + 6, draws = draws + 1 where user_id = g.player_x;
    update public."usr_nmexs7bytxq2_ttt_profiles" set points = points + 6, draws = draws + 1 where user_id = g.player_o;
  elsif g.winner = 'X' then
    update public."usr_nmexs7bytxq2_ttt_profiles" set points = points + 25, wins = wins + 1 where user_id = g.player_x;
    update public."usr_nmexs7bytxq2_ttt_profiles" set points = points + 2, losses = losses + 1 where user_id = g.player_o;
  elsif g.winner = 'O' then
    update public."usr_nmexs7bytxq2_ttt_profiles" set points = points + 25, wins = wins + 1 where user_id = g.player_o;
    update public."usr_nmexs7bytxq2_ttt_profiles" set points = points + 2, losses = losses + 1 where user_id = g.player_x;
  end if;
end;
$$;

create or replace function public.usr_nmexs7bytxq2_ttt_make_online_move(p_game_id uuid, p_index int)
returns public."usr_nmexs7bytxq2_ttt_games"
language plpgsql
security definer
set search_path = public
as $$
declare
  uid text := auth.uid()::text;
  g public."usr_nmexs7bytxq2_ttt_games";
  mark text;
  newboard jsonb;
  w text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  select * into g from public."usr_nmexs7bytxq2_ttt_games" where id = p_game_id for update;
  if not found then
    raise exception 'game not found';
  end if;
  if g.status <> 'active' then
    raise exception 'game not active';
  end if;
  if uid = g.player_x then
    mark := 'X';
  elsif uid = g.player_o then
    mark := 'O';
  else
    raise exception 'not a participant';
  end if;
  if g.current_turn <> mark then
    raise exception 'not your turn';
  end if;
  if p_index < 0 or p_index > 8 then
    raise exception 'invalid square';
  end if;
  if (g.board->>p_index) is not null then
    raise exception 'square taken';
  end if;

  newboard := jsonb_set(g.board, array[p_index::text], to_jsonb(mark));
  w := public.usr_nmexs7bytxq2_ttt_winner(newboard);

  if w is null then
    update public."usr_nmexs7bytxq2_ttt_games"
      set board = newboard,
          current_turn = case when mark = 'X' then 'O' else 'X' end,
          updated_at = now()
      where id = p_game_id
      returning * into g;
  else
    update public."usr_nmexs7bytxq2_ttt_games"
      set board = newboard, status = 'finished', winner = w, updated_at = now()
      where id = p_game_id
      returning * into g;
    perform public.usr_nmexs7bytxq2_ttt_settle_online(g);
  end if;

  return g;
end;
$$;

-- ============================================================================
-- Store purchase (atomic: validates balance + price, deducts, records)
-- ============================================================================

create or replace function public.usr_nmexs7bytxq2_ttt_buy_souvenir(p_souvenir_id text)
returns public."usr_nmexs7bytxq2_ttt_profiles"
language plpgsql
security definer
set search_path = public
as $$
declare
  uid text := auth.uid()::text;
  s public."usr_nmexs7bytxq2_ttt_souvenirs";
  prof public."usr_nmexs7bytxq2_ttt_profiles";
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  perform public.usr_nmexs7bytxq2_ttt_ensure_profile(null);

  select * into s from public."usr_nmexs7bytxq2_ttt_souvenirs" where id = p_souvenir_id;
  if not found then
    raise exception 'unknown souvenir';
  end if;

  if exists (
    select 1 from public."usr_nmexs7bytxq2_ttt_purchases"
    where user_id = uid and souvenir_id = p_souvenir_id
  ) then
    raise exception 'already owned';
  end if;

  select * into prof from public."usr_nmexs7bytxq2_ttt_profiles" where user_id = uid for update;
  if prof.points < s.price then
    raise exception 'insufficient points';
  end if;

  insert into public."usr_nmexs7bytxq2_ttt_purchases"
    (user_id, souvenir_id, souvenir_name, souvenir_emoji, price)
  values (uid, s.id, s.name, s.emoji, s.price);

  update public."usr_nmexs7bytxq2_ttt_profiles"
    set points = points - s.price
    where user_id = uid
    returning * into prof;

  return prof;
end;
$$;

-- ============================================================================
-- Function execution grants
-- ============================================================================

grant execute on function public.usr_nmexs7bytxq2_ttt_ensure_profile(text) to authenticated;
grant execute on function public.usr_nmexs7bytxq2_ttt_set_username(text) to authenticated;
grant execute on function public.usr_nmexs7bytxq2_ttt_award_vs_computer(text) to authenticated;
grant execute on function public.usr_nmexs7bytxq2_ttt_create_online_game() to authenticated;
grant execute on function public.usr_nmexs7bytxq2_ttt_join_online_game(uuid) to authenticated;
grant execute on function public.usr_nmexs7bytxq2_ttt_make_online_move(uuid, int) to authenticated;
grant execute on function public.usr_nmexs7bytxq2_ttt_buy_souvenir(text) to authenticated;

-- ============================================================================
-- Realtime: broadcast game updates to subscribed players
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'usr_nmexs7bytxq2_ttt_games'
  ) then
    execute 'alter publication supabase_realtime add table public."usr_nmexs7bytxq2_ttt_games"';
  end if;
end;
$$;
