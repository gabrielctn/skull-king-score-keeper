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

-- ============================================================================
-- Private cloud backup — durable, per-owner mirror of one scorekeeper's games.
--
-- Same capability model as live_games, but persistent instead of ephemeral:
-- the game-keeper's device creates an *owner* row and receives an unguessable
-- UUID plus a locally generated writer key (only its SHA-256 is stored here).
-- BOTH reading and writing go through SECURITY DEFINER functions that require
-- the key, so knowing the owner id alone reveals nothing and no scorekeeper can
-- ever see another's games. No API role can touch the tables directly.
-- ============================================================================

create table if not exists public.user_backups (
  owner_id uuid primary key default gen_random_uuid(),
  state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_backup_keys (
  owner_id uuid primary key
    references public.user_backups (owner_id) on delete cascade,
  writer_key_hash bytea not null
);

alter table public.user_backups enable row level security;
alter table public.user_backup_keys enable row level security;

-- No direct table access for any API role; everything goes through the
-- key-checked functions below.
revoke all on public.user_backups from anon, authenticated;
revoke all on public.user_backup_keys from anon, authenticated;

create or replace function public.assert_user_backup_state(game_state jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Generous 2 MB ceiling: years of games as JSON stay far below it.
  if game_state is null or pg_column_size(game_state) > 2000000 then
    raise exception 'invalid game state';
  end if;
end;
$$;

create or replace function public.assert_user_backup_key(writer_key text)
returns void
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
end;
$$;

-- Create an empty backup, remember the writer key's hash, return the owner id.
create or replace function public.create_user_backup(writer_key text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  perform public.assert_user_backup_key(writer_key);
  insert into public.user_backups (state) values ('{}'::jsonb)
    returning owner_id into new_id;
  insert into public.user_backup_keys (owner_id, writer_key_hash)
    values (new_id, extensions.digest(writer_key, 'sha256'));
  return new_id;
end;
$$;

-- Overwrite the stored state (owner must present the matching writer key).
create or replace function public.put_user_backup(
  owner_id uuid,
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
  perform public.assert_user_backup_key(writer_key);
  perform public.assert_user_backup_state(game_state);
  update public.user_backups b
     set state = game_state,
         updated_at = now()
   where b.owner_id = put_user_backup.owner_id
     and exists (
       select 1 from public.user_backup_keys k
        where k.owner_id = b.owner_id
          and k.writer_key_hash = extensions.digest(writer_key, 'sha256')
     );
  get diagnostics updated = row_count;
  if updated = 0 then
    raise exception 'unknown owner or wrong writer key';
  end if;
end;
$$;

-- Read the stored state back (key required); returns null when unknown.
create or replace function public.get_user_backup(
  owner_id uuid,
  writer_key text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  perform public.assert_user_backup_key(writer_key);
  select b.state into result
    from public.user_backups b
   where b.owner_id = get_user_backup.owner_id
     and exists (
       select 1 from public.user_backup_keys k
        where k.owner_id = b.owner_id
          and k.writer_key_hash = extensions.digest(writer_key, 'sha256')
     );
  return result;
end;
$$;

revoke execute on function public.assert_user_backup_state(jsonb)
  from public, anon, authenticated;
revoke execute on function public.assert_user_backup_key(text)
  from public, anon, authenticated;
grant execute on function public.create_user_backup(text) to anon, authenticated;
grant execute on function public.put_user_backup(uuid, text, jsonb)
  to anon, authenticated;
grant execute on function public.get_user_backup(uuid, text) to anon, authenticated;

-- ============================================================================
-- Table invites — short codes for joining a shared table, phone to phone.
--
-- A QR code cannot reach an installed app: iOS opens scanned links in Safari,
-- and a home-screen PWA lives in its own container that no link can target. So
-- the invite travels the other way round. The host's device asks for a short
-- code (6 characters, Crockford base32, no I/L/O/U to misread); the guest opens
-- the app they already have and types it in.
--
-- The row holds the table's credentials in clear, because the guest must walk
-- away with them — that is the whole point of an invite. Three things keep it
-- narrow: no API role can read the table (only the SECURITY DEFINER functions
-- below can), a code lives 15 minutes, and only a device that already holds the
-- table's writer key can mint one.
--
-- 6 characters is 32^6 ≈ 1.1e9 codes. Guessing is bounded by a global counter
-- of failed redemptions per minute: an attacker gets INVITE_MAX_FAILURES tries
-- a minute against the handful of codes alive at any moment, which is hopeless,
-- while a real crew never comes close to the ceiling.
-- ============================================================================

create table if not exists public.table_invites (
  code_hash bytea primary key,
  owner_id uuid not null
    references public.user_backups (owner_id) on delete cascade,
  writer_key text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '15 minutes'
);

create index if not exists table_invites_owner_idx
  on public.table_invites (owner_id);

-- Failed redemptions, bucketed by minute: the brute-force ceiling.
create table if not exists public.table_invite_failures (
  minute timestamptz primary key,
  failures integer not null default 0
);

alter table public.table_invites enable row level security;
alter table public.table_invite_failures enable row level security;

revoke all on public.table_invites from anon, authenticated;
revoke all on public.table_invite_failures from anon, authenticated;

-- Draw a code. 256 is a multiple of 32, so the modulo stays uniform.
create or replace function public.new_table_invite_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  alphabet constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  bytes bytea := extensions.gen_random_bytes(6);
  code text := '';
  i integer;
begin
  for i in 0..5 loop
    code := code || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return code;
end;
$$;

-- Mint an invite for a table the caller can already write.
-- Returns {code, expires_in} (seconds, so no clock agreement is needed).
create or replace function public.create_table_invite(
  owner_id uuid,
  writer_key text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  ttl constant interval := interval '15 minutes';
  code text;
  attempts integer := 0;
begin
  perform public.assert_user_backup_key(writer_key);
  if not exists (
    select 1 from public.user_backup_keys k
     where k.owner_id = create_table_invite.owner_id
       and k.writer_key_hash = extensions.digest(writer_key, 'sha256')
  ) then
    raise exception 'unknown table or wrong writer key';
  end if;

  -- Opportunistic cleanup keeps both tables tiny without pg_cron.
  delete from public.table_invites where expires_at < now();
  delete from public.table_invite_failures
   where minute < now() - interval '1 hour';

  -- One live code per table: asking for a new one retires the previous code
  -- instead of leaving a trail of them valid.
  delete from public.table_invites i
   where i.owner_id = create_table_invite.owner_id;

  loop
    attempts := attempts + 1;
    code := public.new_table_invite_code();
    begin
      insert into public.table_invites (code_hash, owner_id, writer_key, expires_at)
      values (
        extensions.digest(code, 'sha256'),
        create_table_invite.owner_id,
        writer_key,
        now() + ttl
      );
      exit;
    exception when unique_violation then
      if attempts >= 10 then
        raise exception 'could not allocate an invite code';
      end if;
    end;
  end loop;

  return jsonb_build_object(
    'code', code,
    'expires_in', floor(extract(epoch from ttl))::integer
  );
end;
$$;

-- Trade a code for the table's credentials.
-- Returns {owner_id, writer_key} on success, {throttled:true} when the guessing
-- ceiling is hit, and null for an unknown, expired or malformed code. Misses
-- return rather than raise on purpose: an exception would roll back the very
-- counter that bounds the guessing.
create or replace function public.redeem_table_invite(code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  max_failures constant integer := 100;
  bucket timestamptz := date_trunc('minute', now());
  normalized text;
  recent integer;
  found_owner uuid;
  found_key text;
begin
  if code is null then return null; end if;
  normalized := upper(code);
  if normalized !~ '^[0-9ABCDEFGHJKMNPQRSTVWXYZ]{6}$' then
    return null;
  end if;

  select f.failures into recent
    from public.table_invite_failures f where f.minute = bucket;
  if coalesce(recent, 0) >= max_failures then
    return jsonb_build_object('throttled', true);
  end if;

  select i.owner_id, i.writer_key into found_owner, found_key
    from public.table_invites i
   where i.code_hash = extensions.digest(normalized, 'sha256')
     and i.expires_at > now();

  if found_owner is null then
    insert into public.table_invite_failures (minute, failures)
    values (bucket, 1)
    on conflict (minute) do update
      set failures = public.table_invite_failures.failures + 1;
    return null;
  end if;

  return jsonb_build_object('owner_id', found_owner, 'writer_key', found_key);
end;
$$;

revoke execute on function public.new_table_invite_code()
  from public, anon, authenticated;
grant execute on function public.create_table_invite(uuid, text)
  to anon, authenticated;
grant execute on function public.redeem_table_invite(text)
  to anon, authenticated;
