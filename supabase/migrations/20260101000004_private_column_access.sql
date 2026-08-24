-- =============================================================================
-- Authenticated Data API column and catalogue access
--
-- RLS limits which rows a browser-authenticated user may read; it does not
-- hide individual columns on an otherwise visible row. Remove the broad table
-- SELECT grants installed by 00001, then expose only the portal-safe columns.
-- Admin code that needs an operator-note column must first verify the caller
-- with requireAdmin() and then read it through a server-only service-role
-- client using an explicit projection.
--
-- The explicit private-column revokes also make this migration safe to replay
-- if a project was previously given a column-level grant in addition to the
-- table-level grant.
-- =============================================================================

begin;

-- Organisation notes are internal; clients may still see their organisation's
-- identity, status, industry and primary-contact details under the existing
-- tenant RLS policy.
revoke select on table public.clients from authenticated;
revoke select (notes) on table public.clients from authenticated;
grant select (
  id,
  name,
  legal_name,
  status,
  industry,
  primary_contact_name,
  primary_contact_email,
  created_at,
  updated_at
) on table public.clients to authenticated;

-- Engagement notes are internal; lifecycle, ownership and service linkage are
-- part of the client-facing engagement view.
revoke select on table public.client_services from authenticated;
revoke select (notes) on table public.client_services from authenticated;
grant select (
  id,
  client_id,
  service_id,
  status,
  started_on,
  ended_on,
  owner_name,
  created_at,
  updated_at
) on table public.client_services to authenticated;

-- Billing notes are internal; plan, amount, currency and lifecycle dates remain
-- available to the owning client under RLS.
revoke select on table public.subscriptions from authenticated;
revoke select (notes) on table public.subscriptions from authenticated;
grant select (
  id,
  client_id,
  plan_name,
  status,
  billing_period,
  amount_minor,
  currency,
  started_on,
  renews_on,
  cancelled_at,
  created_at,
  updated_at
) on table public.subscriptions to authenticated;

-- The request body and its public workflow state belong in the portal;
-- admin_notes is an operator-only triage field.
revoke select on table public.requests from authenticated;
revoke select (admin_notes) on table public.requests from authenticated;
grant select (
  id,
  client_id,
  created_by,
  subject,
  body,
  status,
  priority,
  created_at,
  updated_at,
  resolved_at
) on table public.requests to authenticated;

comment on column public.clients.notes is
  'Private operator notes. Browser-authenticated roles have no SELECT privilege; guarded server-side admin reads use the service role.';
comment on column public.client_services.notes is
  'Private operator notes. Browser-authenticated roles have no SELECT privilege; guarded server-side admin reads use the service role.';
comment on column public.subscriptions.notes is
  'Private operator notes. Browser-authenticated roles have no SELECT privilege; guarded server-side admin reads use the service role.';
comment on column public.requests.admin_notes is
  'Private triage notes. Browser-authenticated roles have no SELECT privilege; guarded server-side admin reads use the service role.';

-- A direct Data API caller may supply only the client-authored request fields.
-- Server-owned identifiers, workflow state, operator notes and timestamps use
-- database defaults or trusted admin updates. Explicit sensitive-column
-- revokes also remove any earlier column-level grants if this is replayed.
revoke insert on table public.requests from authenticated;
revoke insert (
  id,
  status,
  admin_notes,
  created_at,
  updated_at,
  resolved_at
) on table public.requests from authenticated;
grant insert (
  client_id,
  created_by,
  subject,
  body,
  priority
) on table public.requests to authenticated;

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
    )
  );

-- Anonymous visitors see only active catalogue entries. An authenticated
-- client may additionally resolve an inactive service already assigned to its
-- own engagement, preserving historical/paused portal records. This subquery
-- does not recurse: client_services RLS checks only client_id/current_client_id.
drop policy if exists "services: anyone reads active" on public.services;
drop policy if exists "services: anon reads active" on public.services;
drop policy if exists "services: authenticated reads available" on public.services;

create policy "services: anon reads active"
  on public.services for select
  to anon
  using (is_active);

create policy "services: authenticated reads available"
  on public.services for select
  to authenticated
  using (
    is_active
    or public.is_admin()
    or exists (
      select 1
      from public.client_services as assigned
      where assigned.service_id = services.id
        and assigned.client_id = public.current_client_id()
    )
  );

commit;
