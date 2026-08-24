-- =============================================================================
-- Document metadata/path integrity and orphan-safe Storage reads
--
-- Client-visible document metadata must point into that same client's final
-- Storage prefix. Uploads are staged elsewhere and gain client visibility only
-- after a matching public.documents row is finalized.
-- =============================================================================

begin;

-- PostgreSQL has no ADD CONSTRAINT IF NOT EXISTS. Look up this table-specific
-- name so the migration can be safely replayed on an already-hardened project.
do $migration$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'documents_storage_path_client_prefix_ck'
      and conrelid = 'public.documents'::regclass
  ) then
    execute $ddl$
      alter table public.documents
        add constraint documents_storage_path_client_prefix_ck
        check (starts_with(storage_path, client_id::text || '/'))
        not valid
    $ddl$;
  end if;
end;
$migration$;

-- NOT VALID avoids an extended validation scan while adding the constraint,
-- then this explicit step proves every legacy row before the migration commits.
alter table public.documents
  validate constraint documents_storage_path_client_prefix_ck;

comment on constraint documents_storage_path_client_prefix_ck
  on public.documents is
  'Final object paths must begin with the owning client UUID and a slash. Pending upload paths never belong in document metadata.';

-- Admins retain bucket-wide read access. A client object is readable only when
-- both its prefix and an RLS-visible metadata row identify the current tenant.
-- This makes abandoned final-prefix objects unreadable until an admin safely
-- reconciles them into public.documents or removes them.
drop policy if exists "client-documents: admin or owning client reads"
  on storage.objects;

create policy "client-documents: admin or owning client reads"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'client-documents'
    and (
      public.is_admin()
      or (
        (storage.foldername(name))[1] = public.current_client_id()::text
        and exists (
          select 1
          from public.documents as doc
          where doc.client_id = public.current_client_id()
            and doc.storage_path = storage.objects.name
        )
      )
    )
  );

commit;
