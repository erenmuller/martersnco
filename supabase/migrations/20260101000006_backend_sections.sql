-- =============================================================================
-- Admin console restructure
--
-- Adds the three operational capabilities the console was missing:
--   * subscription payment state, so a period can be marked paid or unpaid;
--   * request quoting, so an admin can price a client request or waive it;
--   * newsletter editions, the acquisition-side record of each issue.
--
-- Migration 00004 replaced the table-level SELECT grants with explicit column
-- lists. Every new client-visible column therefore needs its own grant here,
-- or the portal's Data API reads will fail.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Subscriptions — payment state for the current billing period
-- -----------------------------------------------------------------------------

create type public.payment_state as enum ('unpaid', 'paid');

alter table public.subscriptions
  add column payment_status public.payment_state not null default 'unpaid',
  add column paid_on date;

-- `paid_on` is the date the period was settled, so it exists exactly when the
-- subscription is marked paid.
alter table public.subscriptions
  add constraint subscriptions_paid_on_ck
  check ((payment_status = 'paid') = (paid_on is not null));

create index subscriptions_payment_status_idx
  on public.subscriptions (payment_status)
  where status in ('active', 'trialing');

grant select (payment_status, paid_on) on table public.subscriptions to authenticated;

comment on column public.subscriptions.payment_status is
  'Whether the current billing period has been settled. Reset to unpaid when the period rolls over.';

-- -----------------------------------------------------------------------------
-- Requests — quoting
-- -----------------------------------------------------------------------------

create type public.quote_state as enum ('none', 'free', 'quoted', 'accepted', 'declined');

alter table public.requests
  add column quote_status     public.quote_state not null default 'none',
  add column quote_amount_minor integer check (quote_amount_minor >= 0),
  add column quote_currency   char(3) not null default 'AED',
  add column quote_note       text check (quote_note is null or char_length(quote_note) <= 2000),
  add column quoted_at        timestamptz;

-- A priced quote must carry an amount; a waived or unquoted request must not.
alter table public.requests
  add constraint requests_quote_amount_ck check (
    case quote_status
      when 'none' then quote_amount_minor is null
      when 'free' then quote_amount_minor is null
      else quote_amount_minor is not null
    end
  );

alter table public.requests
  add constraint requests_quoted_at_ck
  check ((quote_status = 'none') = (quoted_at is null));

create index requests_quote_status_idx on public.requests (quote_status)
  where quote_status <> 'none';

-- The quote is the client's answer to their own request, so the portal reads it.
grant select (quote_status, quote_amount_minor, quote_currency, quote_note, quoted_at)
  on table public.requests to authenticated;

comment on column public.requests.quote_note is
  'Client-visible note explaining the quote. Operator-only commentary belongs in admin_notes.';

-- A client still files a plain, unpriced request; pricing is an admin act.
drop policy if exists "requests: client files own" on public.requests;
create policy "requests: client files own"
  on public.requests for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      client_id = public.current_client_id()
      and created_by = auth.uid()
      and status = 'open'
      and admin_notes is null
      and resolved_at is null
      and quote_status = 'none'
      and quote_amount_minor is null
      and quote_note is null
    )
  );

-- -----------------------------------------------------------------------------
-- Newsletter editions — client acquisition
--
-- No client-facing surface: this is an internal publishing record. Supabase
-- grants new public tables to anon/authenticated by default, so revoke first.
-- -----------------------------------------------------------------------------

create type public.newsletter_status as enum ('draft', 'scheduled', 'sent');

create table public.newsletter_editions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 2 and 200),
  -- The Google Doc the edition is written in. https only, checked again in app code.
  doc_url     text not null check (doc_url ~ '^https://' and char_length(doc_url) <= 2000),
  status      public.newsletter_status not null default 'draft',
  sent_on     date,
  notes       text check (notes is null or char_length(notes) <= 5000),
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint newsletter_editions_sent_on_ck
    check ((status = 'sent') = (sent_on is not null))
);

create index newsletter_editions_status_idx
  on public.newsletter_editions (status, created_at desc);

comment on table public.newsletter_editions is
  'One row per newsletter issue. Admin-only; clients have no read path to it.';

create trigger newsletter_editions_touch
  before update on public.newsletter_editions
  for each row execute function public.touch_updated_at();

alter table public.newsletter_editions enable row level security;

revoke all on table public.newsletter_editions from anon, authenticated;
grant select, insert, update, delete on table public.newsletter_editions to authenticated;

create policy "newsletter_editions: admin reads"
  on public.newsletter_editions for select
  to authenticated
  using (public.is_admin());

create policy "newsletter_editions: admin writes"
  on public.newsletter_editions for insert
  to authenticated
  with check (public.is_admin());

create policy "newsletter_editions: admin updates"
  on public.newsletter_editions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "newsletter_editions: admin deletes"
  on public.newsletter_editions for delete
  to authenticated
  using (public.is_admin());

commit;
