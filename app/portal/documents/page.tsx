import type { Metadata } from "next";
import PortalPageHeader from "@/components/PortalPageHeader";
import { requireClient } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import {
  DOCUMENT_KIND_LABEL,
  type ClientDocument,
} from "@/lib/types";

export const metadata: Metadata = { title: "Documents" };

function formatBytes(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value < 0) return "Size unavailable";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const profile = await requireClient();
  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select(
      "id, client_id, title, kind, storage_path, size_bytes, uploaded_by, created_at",
    )
    .eq("client_id", profile.client_id)
    .order("created_at", { ascending: false });
  const documents = (data ?? []) as ClientDocument[];
  const downloadFailed = first(params.error) === "download";

  return (
    <>
      <PortalPageHeader
        eyebrow="Deliverables"
        title="Documents"
        description="Proposals, process maps, reports and account documents shared with your organisation. Download links expire shortly after they are issued."
      />

      {downloadFailed && (
        <p className="notice notice-error" role="alert">
          That document could not be downloaded. It may have moved or the file
          may be temporarily unavailable.
        </p>
      )}

      {error ? (
        <p className="notice notice-error" role="alert">
          Documents could not be loaded. Refresh the page or try again shortly.
        </p>
      ) : documents.length ? (
        <div className="divide-y divide-rule border border-rule bg-paper">
          {documents.map((document) => (
            <article
              key={document.id}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="min-w-0">
                <span className="eyebrow mb-2">
                  {DOCUMENT_KIND_LABEL[document.kind]}
                </span>
                <h2 className="font-medium text-ink">{document.title}</h2>
                <p className="mt-1 text-[0.75rem] text-ink-45">
                  <span className="mono">{formatDate(document.created_at)}</span>
                  {" · "}
                  {formatBytes(document.size_bytes)}
                </p>
              </div>
              <a
                href={`/portal/documents/${document.id}/download`}
                className="btn btn-secondary btn-sm shrink-0"
                aria-label={`Download ${document.title}`}
              >
                Download
              </a>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          No documents have been shared with your organisation yet.
        </div>
      )}
    </>
  );
}
