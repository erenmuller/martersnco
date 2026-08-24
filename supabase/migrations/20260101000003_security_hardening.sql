-- =============================================================================
-- Security hardening and server-side abuse controls
--
-- This migration deliberately repeats the two profile functions from the
-- initial migration. That makes the fix effective for both fresh databases and
-- projects that applied the original init migration before it was hardened.
-- =============================================================================

-- Never derive authorization from raw_user_meta_data. Supabase clients can set
-- that object themselves during sign-up. A new account is intentionally
-- unlinked; a trusted service-role flow assigns role/client_id afterwards.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name, role, client_id, is_active)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'client',
    null,
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Limit browser-authenticated profile updates at the SQL privilege layer.
-- Trusted admin mutations use the service role after verifying requireAdmin().
revoke update on table public.profiles from authenticated;
grant update (full_name, phone_e164) on public.profiles to authenticated;

create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Service-role and internal database work has no end-user JWT subject.
  if auth.uid() is null then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.role is distinct from old.role
     or new.client_id is distinct from old.client_id
     or new.whatsapp_verified_at is distinct from old.whatsapp_verified_at
     or new.is_active is distinct from old.is_active
     or new.created_at is distinct from old.created_at then
    raise exception 'Not permitted to change protected profile fields.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

-- Fixed-window counters used by trusted server actions. Only a digest is
-- stored; callers must never pass a raw IP address, email address or user ID.
create table if not exists public.rate_limits (
  scope              text not null,
  key_hash           text not null,
  window_started_at  timestamptz not null,
  hit_count          integer not null default 1 check (hit_count > 0),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  primary key (scope, key_hash, window_started_at),
  constraint rate_limits_scope_ck
    check (scope ~ '^[a-z0-9][a-z0-9:_-]{0,63}$'),
  constraint rate_limits_key_hash_ck
    check (key_hash ~ '^[0-9a-f]{64}$')
);

create index if not exists rate_limits_window_started_at_idx
  on public.rate_limits (window_started_at);

alter table public.rate_limits enable row level security;
revoke all on table public.rate_limits from public, anon, authenticated;

-- Atomically consumes one slot in a fixed window. The upsert takes a row lock,
-- so concurrent requests cannot all observe the same pre-increment count.
create or replace function public.consume_rate_limit(
  p_scope text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
volatile
parallel unsafe
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window_start timestamptz;
  v_hit_count integer;
begin
  if p_scope is null
     or p_scope !~ '^[a-z0-9][a-z0-9:_-]{0,63}$' then
    raise exception 'Invalid rate-limit scope.' using errcode = '22023';
  end if;

  if p_key_hash is null
     or p_key_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Rate-limit key must be a lowercase SHA-256 hex digest.'
      using errcode = '22023';
  end if;

  if p_limit is null or p_limit < 1 or p_limit > 10000 then
    raise exception 'Rate-limit count must be between 1 and 10000.'
      using errcode = '22023';
  end if;

  if p_window_seconds is null
     or p_window_seconds < 1
     or p_window_seconds > 604800 then
    raise exception 'Rate-limit window must be between 1 and 604800 seconds.'
      using errcode = '22023';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limits as current_window (
    scope,
    key_hash,
    window_started_at,
    hit_count,
    created_at,
    updated_at
  )
  values (
    p_scope,
    p_key_hash,
    v_window_start,
    1,
    v_now,
    v_now
  )
  on conflict (scope, key_hash, window_started_at)
  do update set
    hit_count = current_window.hit_count + 1,
    updated_at = excluded.updated_at
  returning hit_count into v_hit_count;

  allowed := v_hit_count <= p_limit;
  remaining := greatest(p_limit - v_hit_count, 0);
  reset_at := v_window_start + make_interval(secs => p_window_seconds);
  return next;
end;
$$;

comment on function public.consume_rate_limit(text, text, integer, integer) is
  'Service-role-only atomic fixed-window counter. Pass only a keyed SHA-256 digest, never raw identifying data.';

revoke all on function public.consume_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer)
  to service_role;

