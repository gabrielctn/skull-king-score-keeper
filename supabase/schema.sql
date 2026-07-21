-- Live score follow — Supabase schema.
--
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste
-- everything -> Run. Safe to re-run (idempotent).
--
-- Model: one row per live-sharing session. The game master's device creates a
-- session and receives its unguessable UUID; knowing that UUID is the read
-- capability that the QR code hands to spectators. Writes require the session's
-- writer key, generated on the game master's device and never stored here in
-- clear — only its SHA-256, in a table no API role can read. All writes go
-- through SECURITY DEFINER functions; the anon role can only SELECT active
-- sessions and execute those functions.

create extension if not exists pgcrypto with schema extensions;

-- Public, spectator-readable session state.
create table if not exists public.live_games (
  id uuid primary key default gen_random_uuid(),
  state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours'
);

-- Writer-key hashes, kept away from every API role.
create table if not exists public.live_game_keys (
  game_id uuid primary key references public.live_games (id) on delete cascade,
  writer_key_hash bytea not null
);

alter table public.live_games enable row level security;
alter table public.live_game_keys enable row level security;

-- Spectators read a session by knowing its UUID; expired sessions vanish.
drop policy if exists "read active sessions" on public.live_games;
create policy "read active sessions" on public.live_games
  for select to anon, authenticated
  using (expires_at > now());

-- No direct writes, and no API access at all to the key table.
revoke insert, update, delete on public.live_games from anon, authenticated;
revoke all on public.live_game_keys from anon, authenticated;

-- Guards shared by the functions below.
create or replace function public.assert_live_game_args(
  writer_key text,
  game_state jsonb
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if writer_key is null
     or length(writer_key) < 16
     or length(writer_key) > 200 then
    raise exception 'invalid writer key';
  end if;
  if game_state is null or pg_column_size(game_state) > 200000 then
    raise exception 'invalid game state';
  end if;
end;
$$;

-- Start a session: store the state, remember the writer key's hash.
create or replace function public.create_live_game(
  writer_key text,
  game_state jsonb
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  perform public.assert_live_game_args(writer_key, game_state);
  -- Opportunistic cleanup keeps the free-tier table tiny without pg_cron.
  delete from public.live_games where expires_at < now() - interval '1 hour';
  insert into public.live_games (state) values (game_state)
    returning id into new_id;
  insert into public.live_game_keys (game_id, writer_key_hash)
    values (new_id, extensions.digest(writer_key, 'sha256'));
  return new_id;
end;
$$;

-- Push a new snapshot; sliding 24h expiry while the table keeps playing.
create or replace function public.update_live_game(
  game_id uuid,
  writer_key text,
  game_state jsonb
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated integer;
begin
  perform public.assert_live_game_args(writer_key, game_state);
  update public.live_games g
     set state = game_state,
         updated_at = now(),
         expires_at = now() + interval '24 hours'
   where g.id = game_id
     and exists (
       select 1 from public.live_game_keys k
        where k.game_id = g.id
          and k.writer_key_hash = extensions.digest(writer_key, 'sha256')
     );
  get diagnostics updated = row_count;
  if updated = 0 then
    raise exception 'unknown session or wrong writer key';
  end if;
end;
$$;

-- End a session early (rows also expire on their own after 24h idle).
create or replace function public.end_live_game(
  game_id uuid,
  writer_key text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.live_games g
   where g.id = game_id
     and exists (
       select 1 from public.live_game_keys k
        where k.game_id = g.id
          and k.writer_key_hash = extensions.digest(writer_key, 'sha256')
     );
end;
$$;

revoke execute on function public.assert_live_game_args(text, jsonb)
  from public, anon, authenticated;
grant execute on function public.create_live_game(text, jsonb)
  to anon, authenticated;
grant execute on function public.update_live_game(uuid, text, jsonb)
  to anon, authenticated;
grant execute on function public.end_live_game(uuid, text)
  to anon, authenticated;

-- Realtime: spectators subscribe to UPDATE/DELETE on their session row.
do $$
begin
  alter publication supabase_realtime add table public.live_games;
exception
  when duplicate_object then null;
end;
$$;
