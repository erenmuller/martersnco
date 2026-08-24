-- =============================================================================
-- Row Level Security
--
-- Model: an admin sees everything. A client user sees only rows belonging to
-- the single client they are attached to. Anonymous visitors see nothing but
-- the active service catalogue.
--
-- `leads` and `otp_challenges` are deliberately unreachable by anon and
-- authenticated roles — both are written server-side with the service-role key.
-- =============================================================================

alter table public.clients          enable row level security;
alter table public.profiles         enable row level security;
alter table public.services         enable row level security;
alter table public.client_services  enable row level security;
alter table public.subscriptions    enable row level security;
alter table public.documents        enable row level security;
alter table public.requests         enable row level security;
alter table public.leads            enable row level security;
alter table public.otp_challenges   enable row level security;
alter table public.audit_log        enable row level security;

-- Nothing bypasses RLS by accident, including the table owner.
alter table public.leads          force row level security;
alter table public.otp_challenges force row level security;

-- -----------------------------------------------------------------------------
-- Grants. RLS does the real gating; these keep the SQL-level surface honest.
-- -----------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;

grant select on public.services to anon, authenticated;
grant select on public.clients, public.profiles, public.client_services,
                public.subscriptions, public.documents, public.requests,
                public.audit_log
  to authenticated;
grant insert on public.requests to authenticated;
-- A signed-in user may maintain only non-authoritative profile fields. Email
-- changes go through Supabase Auth; role, tenant assignment, active state and
-- WhatsApp verification are service-role/admin concerns.
grant update (full_name, phone_e164) on public.profiles to authenticated;
grant insert, update, delete on
  public.clients, public.services, public.client_services,
  public.subscriptions, public.documents, public.requests
  to authenticated;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------

create policy "profiles: read own or admin reads all"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- Column-level grants above are the primary restriction. The privilege guard
-- trigger is defence in depth for protected columns.
create policy "profiles: update own or admin updates any"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profiles: admin deletes"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- clients
-- -----------------------------------------------------------------------------

create policy "clients: admin reads all, client reads own"
  on public.clients for select
  to authenticated
  using (public.is_admin() or id = public.current_client_id());

create policy "clients: admin writes"
  on public.clients for insert
  to authenticated
  with check (public.is_admin());

create policy "clients: admin updates"
  on public.clients for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "clients: admin deletes"
  on public.clients for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- services — the catalogue is public so the marketing site can render it.
-- -----------------------------------------------------------------------------

create policy "services: anyone reads active"
  on public.services for select
  to anon, authenticated
  using (is_active or public.is_admin());

create policy "services: admin writes"
  on public.services for insert
  to authenticated
  with check (public.is_admin());

create policy "services: admin updates"
  on public.services for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "services: admin deletes"
  on public.services for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- client_services
-- -----------------------------------------------------------------------------

create policy "client_services: admin or own client reads"
  on public.client_services for select
  to authenticated
  using (public.is_admin() or client_id = public.current_client_id());

create policy "client_services: admin writes"
  on public.client_services for insert
  to authenticated
  with check (public.is_admin());

create policy "client_services: admin updates"
  on public.client_services for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "client_services: admin deletes"
  on public.client_services for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- subscriptions
-- -----------------------------------------------------------------------------

create policy "subscriptions: admin or own client reads"
  on public.subscriptions for select
  to authenticated
  using (public.is_admin() or client_id = public.current_client_id());

create policy "subscriptions: admin writes"
  on public.subscriptions for insert
  to authenticated
  with check (public.is_admin());

create policy "subscriptions: admin updates"
  on public.subscriptions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "subscriptions: admin deletes"
  on public.subscriptions for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- documents
-- -----------------------------------------------------------------------------

create policy "documents: admin or own client reads"
  on public.documents for select
  to authenticated
  using (public.is_admin() or client_id = public.current_client_id());

create policy "documents: admin writes"
  on public.documents for insert
  to authenticated
  with check (public.is_admin());

create policy "documents: admin updates"
  on public.documents for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "documents: admin deletes"
  on public.documents for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- requests — the one table a client may write to.
-- -----------------------------------------------------------------------------

create policy "requests: admin or own client reads"
  on public.requests for select
  to authenticated
  using (public.is_admin() or client_id = public.current_client_id());

-- A client may only file a request against their own client, authored by them.
create policy "requests: client files own"
  on public.requests for insert
  to authenticated
  with check (
    public.is_admin()
    or (client_id = public.current_client_id() and created_by = auth.uid())
  );

-- Triage is admin-only; a filed request is a fixed record.
create policy "requests: admin updates"
  on public.requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "requests: admin deletes"
  on public.requests for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- audit_log — admins read; only the service role writes.
-- -----------------------------------------------------------------------------

create policy "audit_log: admin reads"
  on public.audit_log for select
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- leads and otp_challenges intentionally have zero policies.
-- RLS enabled with no policy means deny-all for anon and authenticated.
-- Both are reached only through the service-role key in server code.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- Storage: private bucket for client deliverables.
-- Objects are keyed `<client_id>/<filename>`, so the first path segment is the
-- tenant boundary.
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit)
values ('client-documents', 'client-documents', false, 26214400)
on conflict (id) do nothing;

create policy "client-documents: admin or owning client reads"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'client-documents'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = public.current_client_id()::text
    )
  );

create policy "client-documents: admin uploads"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'client-documents' and public.is_admin());

create policy "client-documents: admin updates"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'client-documents' and public.is_admin())
  with check (bucket_id = 'client-documents' and public.is_admin());

create policy "client-documents: admin deletes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'client-documents' and public.is_admin());
