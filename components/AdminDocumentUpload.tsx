"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cleanupPreparedDocumentUploadAction,
  finalizeDocumentUploadAction,
  prepareDocumentUploadAction,
} from "@/app/admin/_actions/documents";
import { createClient } from "@/lib/supabase/client";
import { DOCUMENT_KIND_LABEL } from "@/lib/types";
import type { DocumentKind } from "@/lib/types";

const kinds = Object.entries(DOCUMENT_KIND_LABEL) as [DocumentKind, string][];

export default function AdminDocumentUpload({
  clients,
  initialClientId = "",
}: {
  clients: { id: string; name: string }[];
  initialClientId?: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function bestEffortCleanup(path: string): Promise<string | null> {
    try {
      const result = await cleanupPreparedDocumentUploadAction({ path });
      return result.ok ? null : result.error;
    } catch (error) {
      return error instanceof Error ? error.message : "Unknown pending cleanup error.";
    }
  }

  function withCleanupError(message: string, cleanupError: string | null): string {
    return cleanupError ? `${message} Pending cleanup also failed: ${cleanupError}` : message;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setMessage({ tone: "error", text: "Choose a file to upload." });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setMessage({ tone: "error", text: "Files must be 25 MB or smaller." });
      return;
    }

    const input = {
      client_id: String(formData.get("client_id") ?? ""),
      title: String(formData.get("title") ?? ""),
      kind: String(formData.get("kind") ?? ""),
      file_name: file.name,
      size_bytes: file.size,
      content_type: file.type || "application/octet-stream",
    };

    setBusy(true);
    let pendingPath: string | null = null;
    try {
      const prepared = await prepareDocumentUploadAction(input);
      if (!prepared.ok) {
        setMessage({ tone: "error", text: prepared.error });
        return;
      }
      pendingPath = prepared.path;

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("client-documents")
        .uploadToSignedUrl(prepared.path, prepared.token, file, {
          contentType: prepared.contentType,
          upsert: false,
        });
      if (uploadError) {
        const cleanupError = await bestEffortCleanup(prepared.path);
        pendingPath = null;
        setMessage({
          tone: "error",
          text: withCleanupError(`Upload failed: ${uploadError.message}`, cleanupError),
        });
        return;
      }

      const finalized = await finalizeDocumentUploadAction({
        client_id: input.client_id,
        title: input.title,
        kind: input.kind,
        path: prepared.path,
        expected_size: file.size,
        expected_content_type: prepared.contentType,
      });
      if (!finalized.ok) {
        const cleanupError = await bestEffortCleanup(prepared.path);
        pendingPath = null;
        setMessage({ tone: "error", text: withCleanupError(finalized.error, cleanupError) });
        return;
      }

      pendingPath = null;
      formRef.current?.reset();
      setMessage({ tone: "ok", text: "Document uploaded and recorded." });
      router.refresh();
    } catch (error) {
      const cleanupError = pendingPath ? await bestEffortCleanup(pendingPath) : null;
      setMessage({
        tone: "error",
        text: withCleanupError(
          error instanceof Error ? error.message : "The upload could not be completed.",
          cleanupError,
        ),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-6">
      {message ? (
        <p
          className={`notice ${message.tone === "error" ? "notice-error" : "notice-ok"}`}
          role={message.tone === "error" ? "alert" : "status"}
        >
          {message.text}
        </p>
      ) : null}
      <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="field sm:col-span-2">
          <span className="field-label">Client</span>
          <select className="select" name="client_id" required defaultValue={initialClientId}>
            <option value="" disabled>
              Choose a client
            </option>
            {clients.map((client) => (
              <option value={client.id} key={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Kind</span>
          <select className="select" name="kind" defaultValue="other">
            {kinds.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">File (25 MB max)</span>
          <input
            className="input"
            name="file"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.csv,.txt,.md,.json,.png,.jpg,.jpeg,.webp,.zip"
            required
            disabled={busy}
          />
        </label>
        <label className="field sm:col-span-2 lg:col-span-4">
          <span className="field-label">Display title</span>
          <input className="input" name="title" required maxLength={240} disabled={busy} />
        </label>
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Uploading…" : "Upload document"}
      </button>
      <p className="field-hint mt-3">
        The browser sends the file directly to private storage; only metadata passes through the app server.
      </p>
    </form>
  );
}
