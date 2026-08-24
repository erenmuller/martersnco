import AdminNotice from "@/components/AdminNotice";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminSubmitButton from "@/components/AdminSubmitButton";
import AdminDocumentUpload from "@/components/AdminDocumentUpload";
import {
  deleteDocumentAction,
  updateDocumentAction,
} from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";
import { DOCUMENT_KIND_LABEL } from "@/lib/types";
import type { Client, ClientDocument, DocumentKind } from "@/lib/types";

type SearchParams = Promise<{
  client?: string;
  notice?: string | string[];
  error?: string | string[];
}>;

type DocumentWithClient = ClientDocument & { client: Pick<Client, "id" | "name"> | null };
const kinds = Object.entries(DOCUMENT_KIND_LABEL) as [DocumentKind, string][];

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DocumentsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const clientsResult = await supabase.from("clients").select("id, name").order("name");
  const clients = (clientsResult.data ?? []) as Pick<Client, "id" | "name">[];
  const clientFilter = clients.some((client) => client.id === params.client) ? params.client! : "";

  let request = supabase
    .from("documents")
    .select("*, client:clients(id, name)")
    .order("created_at", { ascending: false });
  if (clientFilter) request = request.eq("client_id", clientFilter);
  const documentsResult = await request;
  const documents = (documentsResult.data ?? []) as unknown as DocumentWithClient[];
  const loadError = clientsResult.error?.message ?? documentsResult.error?.message;

  return (
    <>
      <AdminPageHeader
        eyebrow="Deliverables"
        title="Documents"
        description="Files live in the private client-documents bucket. Downloads are short-lived signed URLs and clients can only read their own folder."
        action={
          <a href="#upload-document" className="btn btn-primary">
            Upload a document
          </a>
        }
      />
      <AdminNotice notice={params.notice} error={params.error} />
      {loadError ? (
        <p className="notice notice-error" role="alert">
          Document data could not be loaded: {loadError}
        </p>
      ) : null}

      <section id="upload-document" className="card scroll-mt-6">
        <details>
          <summary className="cursor-pointer font-medium">Upload a client file</summary>
          {clients.length ? (
            <AdminDocumentUpload clients={clients} initialClientId={clientFilter} />
          ) : (
            <p className="notice notice-info mt-4">Create a client before uploading a document.</p>
          )}
        </details>
      </section>

      <section className="mt-10" aria-labelledby="document-list-title">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="document-list-title" className="display-s">
              Document register
            </h2>
            <p className="mono mt-1 text-[0.6875rem] text-ink-45">{documents.length} files</p>
          </div>
          <form method="get" className="flex gap-2">
            <label>
              <span className="sr-only">Filter by client</span>
              <select className="select min-w-[14rem]" name="client" defaultValue={clientFilter}>
                <option value="">All clients</option>
                {clients.map((client) => (
                  <option value={client.id} key={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn btn-secondary">
              Filter
            </button>
          </form>
        </div>

        {documents.length ? (
          <div className="space-y-3">
            {documents.map((document) => (
              <details key={document.id} className="card">
                <summary className="cursor-pointer list-none">
                  <span className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                    <span>
                      <strong className="block text-[0.9375rem]">{document.title}</strong>
                      <span className="mt-1 block text-[0.8125rem] text-ink-45">
                        {document.client?.name ?? "Unknown client"} · {DOCUMENT_KIND_LABEL[document.kind]}
                      </span>
                    </span>
                    <span className="mono text-[0.6875rem] text-ink-45">{formatBytes(document.size_bytes)}</span>
                    <span className="mono text-[0.6875rem] text-ink-45">{formatDateTime(document.created_at)}</span>
                  </span>
                </summary>
                <div className="mt-6 border-t border-rule pt-6">
                  <a
                    href={`/admin/documents/${document.id}/download`}
                    className="btn btn-secondary"
                  >
                    Download file
                  </a>
                </div>
                <form action={updateDocumentAction} className="mt-5 border-t border-rule pt-5">
                  <input type="hidden" name="id" value={document.id} />
                  <input type="hidden" name="client_id" value={document.client_id} />
                  <input type="hidden" name="returnTo" value="/admin/documents" />
                  <div className="grid gap-x-5 sm:grid-cols-[1fr_15rem]">
                    <label className="field">
                      <span className="field-label">Display title</span>
                      <input className="input" name="title" defaultValue={document.title} required maxLength={240} />
                    </label>
                    <label className="field">
                      <span className="field-label">Kind</span>
                      <select className="select" name="kind" defaultValue={document.kind}>
                        {kinds.map(([value, label]) => (
                          <option value={value} key={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <AdminSubmitButton>Save metadata</AdminSubmitButton>
                </form>
                <form action={deleteDocumentAction} className="mt-5 border-t border-rule pt-5">
                  <input type="hidden" name="id" value={document.id} />
                  <input type="hidden" name="returnTo" value="/admin/documents" />
                  <AdminSubmitButton
                    tone="danger"
                    pendingLabel="Deleting…"
                    confirmMessage={`Delete ${document.title} from storage and the document register?`}
                  >
                    Delete document
                  </AdminSubmitButton>
                </form>
              </details>
            ))}
          </div>
        ) : (
          <div className="empty">
            {clientFilter ? "This client has no documents." : "No documents have been uploaded."}
          </div>
        )}
      </section>
    </>
  );
}
