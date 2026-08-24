-- =============================================================================
-- Marters & Co. — core schema
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

create type public.user_role as enum ('admin', 'client');

create type public.service_category as enum (
  'process_identification',
  'automation_implementation',
  'workflow_program',
  'enterprise_build',
  'enablement'
);

create type public.client_status as enum ('prospect', 'active', 'paused', 'closed');
create type public.engagement_status as enum ('scoped', 'active', 'paused', 'completed');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'cancelled', 'expired');
create type public.billing_period as enum ('monthly', 'quarterly', 'annual');
create type public.request_status as enum ('open', 'in_progress', 'blocked', 'resolved');
create type public.request_priority as enum ('low', 'normal', 'high');
create type public.document_kind as enum ('process_map', 'proposal', 'report', 'invoice', 'other');
create type public.otp_purpose as enum ('login', 'enrol', 'step_up');

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table public.clients (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  legal_name             text,
  status                 public.client_status not null default 'prospect',
  industry               text,
  primary_contact_name   text,
  primary_contact_email  text,
  notes                  text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.clients is 'Companies Marters & Co. works with. One row per organisation.';

-- Profiles extend auth.users. Every auth user gets exactly one.
create table public.profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  email                 text not null,
  full_name             text,
  role                  public.user_role not null default 'client',
  client_id             uuid references public.clients (id) on delete set null,
  phone_e164            text,
  whatsapp_verified_at  timestamptz,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  -- A client user must belong to a client; an admin must not.
  constraint profiles_client_link_ck check (
    (role = 'client' and client_id is not null)
    or (role = 'admin' and client_id is null)
    -- Newly invited users sit here until an admin links them.
    or (role = 'client' and client_id is null)
  )
);

create index profiles_client_id_idx on public.profiles (client_id);
create index profiles_role_idx on public.profiles (role);

-- The service catalogue. Admin-editable, shown on the marketing site too.
create table public.services (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  summary     text,
  category    public.service_category not null,
  is_active   boolean not null default true,
  sort_order  integer not null default 100,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Which services a given client actually has. The join carries its own state.
create table public.client_services (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  service_id  uuid not null references public.services (id) on delete restrict,
  status      public.engagement_status not null default 'scoped',
  started_on  date,
  ended_on    date,
  owner_name  text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint client_services_dates_ck check (ended_on is null or started_on is null or ended_on >= started_on)
);

create index client_services_client_id_idx on public.client_services (client_id);
create index client_services_service_id_idx on public.client_services (service_id);

create table public.subscriptions (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients (id) on delete cascade,
  plan_name       text not null,
  status          public.subscription_status not null default 'active',
  billing_period  public.billing_period not null default 'monthly',
  -- Minor units (fils / cents). Integer, so no float rounding on money.
  amount_minor    integer not null default 0 check (amount_minor >= 0),
  currency        char(3) not null default 'AED',
  started_on      date not null default current_date,
  renews_on       date,
  cancelled_at    timestamptz,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index subscriptions_client_id_idx on public.subscriptions (client_id);
create index subscriptions_renews_on_idx on public.subscriptions (renews_on)
  where status in ('active', 'trialing');

create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients (id) on delete cascade,
  title         text not null,
  kind          public.document_kind not null default 'other',
  -- Path inside the private `client-documents` storage bucket.
  storage_path  text not null unique,
  size_bytes    bigint,
  uploaded_by   uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index documents_client_id_idx on public.documents (client_id, created_at desc);

create table public.requests (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  created_by   uuid references public.profiles (id) on delete set null,
  subject      text not null check (char_length(subject) between 3 and 200),
  body         text not null check (char_length(body) between 1 and 5000),
  status       public.request_status not null default 'open',
  priority     public.request_priority not null default 'normal',
  admin_notes  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  resolved_at  timestamptz
);

create index requests_client_id_idx on public.requests (client_id, created_at desc);
create index requests_status_idx on public.requests (status) where status <> 'resolved';

-- Contact-form submissions from the marketing site.
create table public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  email       text not null check (char_length(email) between 3 and 200),
  company     text,
  employees   text,
  message     text not null check (char_length(message) between 1 and 4000),
  source      text,
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index leads_created_at_idx on public.leads (created_at desc);

-- -----------------------------------------------------------------------------
-- WhatsApp OTP — infrastructure only, nothing writes here yet.
-- -----------------------------------------------------------------------------

create table public.otp_challenges (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid references public.profiles (id) on delete cascade,
  phone_e164  text not null,
  -- SHA-256 of `salt:code`. The plaintext code is never stored.
  code_hash   text not null,
  salt        text not null,
  purpose     public.otp_purpose not null default 'login',
  attempts    smallint not null default 0,
  expires_at  timestamptz not null,
  consumed_at timestamptz,
  created_at  timestamptz not null default now()
);

create index otp_challenges_lookup_idx
  on public.otp_challenges (phone_e164, purpose, created_at desc)
  where consumed_at is null;

comment on table public.otp_challenges is
  'WhatsApp OTP challenges. Table ships ahead of the feature so enabling it later needs no migration. No client role can read this table.';

create table public.audit_log (
  id          bigserial primary key,
  actor_id    uuid references public.profiles (id) on delete set null,
  action      text not null,
  entity      text not null,
  entity_id   text,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index audit_log_created_at_idx on public.audit_log (created_at desc);
create index audit_log_entity_idx on public.audit_log (entity, entity_id);

-- -----------------------------------------------------------------------------
-- Helper functions
--
-- SECURITY DEFINER so they read `profiles` without triggering that table's own
-- RLS policies. Without this, any policy shaped "am I an admin?" would recurse.
-- -----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active
  );
$$;

create or replace function public.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select client_id from public.profiles
  where id = auth.uid() and is_active;
$$;

revoke execute on function public.is_admin() from public;
revoke execute on function public.current_client_id() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_client_id() to authenticated;

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_touch          before update on public.clients          for each row execute function public.touch_updated_at();
create trigger profiles_touch         before update on public.profiles         for each row execute function public.touch_updated_at();
create trigger services_touch         before update on public.services         for each row execute function public.touch_updated_at();
create trigger client_services_touch  before update on public.client_services  for each row execute function public.touch_updated_at();
create trigger subscriptions_touch    before update on public.subscriptions    for each row execute function public.touch_updated_at();
create trigger requests_touch         before update on public.requests         for each row execute function public.touch_updated_at();

-- Every auth user gets a profile immediately, so there is never an orphan
-- login. Access is deliberately NOT read from raw_user_meta_data: callers can
-- supply that object themselves during sign-up. New users therefore start as
-- unlinked clients and gain no tenant access until a trusted service-role flow
-- assigns role/client_id after the auth user has been created.
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profiles.email in step with auth.users.email after an email change.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- Privilege guard: a non-admin may only change presentation/contact fields.
-- Column grants in the RLS migration provide the first barrier; this trigger
-- is defence in depth if a broader grant is ever added later.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- The service-role key and internal triggers run without a JWT claim.
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

create trigger profiles_guard_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- Stamp resolved_at whenever a request moves in or out of 'resolved'.
create or replace function public.sync_request_resolved_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'resolved' and old.status <> 'resolved' then
    new.resolved_at = now();
  elsif new.status <> 'resolved' then
    new.resolved_at = null;
  end if;
  return new;
end;
$$;

create trigger requests_sync_resolved
  before update on public.requests
  for each row execute function public.sync_request_resolved_at();
