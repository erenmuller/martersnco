"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  adminReturnPath,
  isClientStoragePath,
  safeFileName,
  writeAdminAudit,
} from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  DOCUMENT_KINDS,
  complete,
  databaseFail,
  fail,
  firstError,
  uuid,
  value,
} from "./shared";

/**
 * Extension/MIME pairs accepted into client storage. A file whose declared type
 * disagrees with its extension is rejected rather than stored and puzzled over.
 */
const DOCUMENT_MIME_BY_EXTENSION: Record<string, readonly string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ppt: ["application/vnd.ms-powerpoint"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  odt: ["application/vnd.oasis.opendocument.text"],
  ods: ["application/vnd.oasis.opendocument.spreadsheet"],
  odp: ["application/vnd.oasis.opendocument.presentation"],
  csv: ["text/csv", "application/csv"],
  txt: ["text/plain"],
  md: ["text/markdown", "text/plain"],
  json: ["application/json", "text/json"],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  webp: ["image/webp"],
  zip: ["application/zip", "application/x-zip-compressed"],
};

function normaliseMime(value: string): string {
  return value.trim().toLowerCase().split(";", 1)[0] ?? "";
}

function documentTypeError(fileName: string, contentType: string): string | null {
  const extension = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";
  const allowedMimes = DOCUMENT_MIME_BY_EXTENSION[extension];
  if (!allowedMimes) return "That file extension is not allowed for client documents.";

  const mime = normaliseMime(contentType);
  if (mime !== "application/octet-stream" && !allowedMimes.includes(mime)) {
    return "The file type does not match its extension.";
  }
  return null;
}


const DocumentSchema = z.object({
  client_id: uuid,
  title: z.string().trim().min(2, "Enter a document title.").max(240),
  kind: z.enum(DOCUMENT_KINDS),
});

const PreparedUploadSchema = DocumentSchema.extend({
  file_name: z.string().trim().min(1).max(255),
  size_bytes: z.number().int().positive().max(25 * 1024 * 1024),
  content_type: z.string().trim().max(200),
});

export async function prepareDocumentUploadAction(input: unknown) {
  const actor = await requireAdmin();
  const parsed = PreparedUploadSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: firstError(parsed.error) };
  const contentType = normaliseMime(parsed.data.content_type);
  const typeError = documentTypeError(parsed.data.file_name, contentType);
  if (typeError) return { ok: false as const, error: typeError };

  const supabase = await createClient();
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("id", parsed.data.client_id)
    .single();
  if (clientError || !client) {
    return { ok: false as const, error: `Client could not be verified: ${clientError?.message ?? "not found"}` };
  }

  const pendingName = `${randomUUID()}-${safeFileName(parsed.data.file_name)}`;
  const path = `_pending/${actor.id}/${pendingName}`;
  const { data, error } = await supabase.storage
    .from("client-documents")
    .createSignedUploadUrl(path, { upsert: false });
  if (error || !data) {
    return { ok: false as const, error: `A secure upload could not be prepared: ${error?.message ?? "unknown error"}` };
  }

  return { ok: true as const, path: data.path, token: data.token, contentType };
}

const FinalizeUploadSchema = DocumentSchema.extend({
  path: z.string().trim().min(38).max(500),
  expected_size: z.number().int().positive().max(25 * 1024 * 1024),
  expected_content_type: z.string().trim().min(1).max(200),
});

const CleanupPreparedUploadSchema = z.object({
  path: z.string().trim().min(47).max(500),
});

function pendingUploadName(path: string, actorId: string): string | null {
  const prefix = `_pending/${actorId}/`;
  if (!path.startsWith(prefix)) return null;
  const name = path.slice(prefix.length);
  if (!name || name.includes("/")) return null;
  if (name[36] !== "-" || !uuid.safeParse(name.slice(0, 36)).success || !name.slice(37)) {
    return null;
  }
  return name;
}

function rollbackMessage(message: string, failures: string[]): string {
  return failures.length
    ? `${message} Automatic cleanup also failed: ${failures.join("; ")}.`
    : message;
}

async function removeStoredObject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
): Promise<string | null> {
  const { error } = await supabase.storage.from("client-documents").remove([path]);
  return error?.message ?? null;
}

export async function finalizeDocumentUploadAction(input: unknown) {
  const actor = await requireAdmin();
  const parsed = FinalizeUploadSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: firstError(parsed.error) };

  const relativeName = pendingUploadName(parsed.data.path, actor.id);
  if (!relativeName) {
    return { ok: false as const, error: "The prepared upload is outside your admin pending folder." };
  }
  const expectedContentType = normaliseMime(parsed.data.expected_content_type);
  const typeError = documentTypeError(relativeName, expectedContentType);
  if (typeError) return { ok: false as const, error: typeError };

  const finalPath = `${parsed.data.client_id}/${relativeName}`;
  if (!isClientStoragePath(finalPath, parsed.data.client_id)) {
    return { ok: false as const, error: "The final tenant storage path is invalid." };
  }

  const supabase = await createClient();
  const bucket = supabase.storage.from("client-documents");
  const { data: info, error: infoError } = await bucket.info(parsed.data.path);
  if (infoError || !info) {
    const cleanupError = await removeStoredObject(supabase, parsed.data.path);
    return {
      ok: false as const,
      error: rollbackMessage(
        `The pending object could not be verified: ${infoError?.message ?? "not found"}`,
        cleanupError ? [`pending object: ${cleanupError}`] : [],
      ),
    };
  }
  if (info.size !== parsed.data.expected_size || info.size > 25 * 1024 * 1024) {
    const cleanupError = await removeStoredObject(supabase, parsed.data.path);
    return {
      ok: false as const,
      error: rollbackMessage(
        "The stored file size does not match the selected file.",
        cleanupError ? [`pending object: ${cleanupError}`] : [],
      ),
    };
  }
  if (normaliseMime(info.contentType ?? "") !== expectedContentType) {
    const cleanupError = await removeStoredObject(supabase, parsed.data.path);
    return {
      ok: false as const,
      error: rollbackMessage(
        "The stored content type does not match the prepared upload.",
        cleanupError ? [`pending object: ${cleanupError}`] : [],
      ),
    };
  }

  const { error: moveError } = await bucket.move(parsed.data.path, finalPath);
  if (moveError) {
    const cleanupError = await removeStoredObject(supabase, parsed.data.path);
    return {
      ok: false as const,
      error: rollbackMessage(
        `The verified file could not be moved into the client folder: ${moveError.message}`,
        cleanupError ? [`pending object: ${cleanupError}`] : [],
      ),
    };
  }

  const { data: document, error } = await supabase
    .from("documents")
    .insert({
      client_id: parsed.data.client_id,
      title: parsed.data.title,
      kind: parsed.data.kind,
      storage_path: finalPath,
      size_bytes: info.size,
      uploaded_by: actor.id,
    })
    .select("id")
    .single();
  if (error || !document) {
    const cleanupError = await removeStoredObject(supabase, finalPath);
    return {
      ok: false as const,
      error: rollbackMessage(
        `Document metadata could not be recorded: ${error?.message ?? "unknown error"}`,
        cleanupError ? [`final object: ${cleanupError}`] : [],
      ),
    };
  }

  try {
    await writeAdminAudit(actor.id, "document.created", "document", document.id, {
      client_id: parsed.data.client_id,
      title: parsed.data.title,
      kind: parsed.data.kind,
      size_bytes: info.size,
    });
  } catch (auditError) {
    console.error("[admin:audit]", auditError);
    const failures: string[] = [];
    const { data: rolledBack, error: metadataRollbackError } = await supabase
      .from("documents")
      .delete()
      .eq("id", document.id)
      .select("id")
      .single();
    if (metadataRollbackError || !rolledBack) {
      failures.push(`metadata: ${metadataRollbackError?.message ?? "row was not removed"}`);
    }
    const storageRollbackError = await removeStoredObject(supabase, finalPath);
    if (storageRollbackError) failures.push(`final object: ${storageRollbackError}`);
    return {
      ok: false as const,
      error: rollbackMessage("The audit entry failed, so the upload was rolled back.", failures),
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/documents");
  revalidatePath(`/admin/clients/${parsed.data.client_id}`);
  return { ok: true as const, documentId: document.id };
}

export async function cleanupPreparedDocumentUploadAction(input: unknown) {
  const actor = await requireAdmin();
  const parsed = CleanupPreparedUploadSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: firstError(parsed.error) };

  const name = pendingUploadName(parsed.data.path, actor.id);
  if (!name) {
    return { ok: false as const, error: "Pending cleanup was refused for a path outside your admin folder." };
  }

  const supabase = await createClient();
  const bucket = supabase.storage.from("client-documents");
  const { data: exists, error: existsError } = await bucket.exists(parsed.data.path);
  if (existsError) {
    return { ok: false as const, error: `Pending cleanup could not check the object: ${existsError.message}` };
  }
  if (!exists) return { ok: true as const, cleaned: false };

  const cleanupError = await removeStoredObject(supabase, parsed.data.path);
  if (cleanupError) {
    return { ok: false as const, error: `Pending cleanup failed: ${cleanupError}` };
  }

  try {
    await writeAdminAudit(actor.id, "document.pending_discarded", "pending_upload", name.slice(0, 36));
  } catch (auditError) {
    console.error("[admin:audit]", auditError);
    return { ok: false as const, error: "The pending object was removed, but its audit entry failed." };
  }

  return { ok: true as const, cleaned: true };
}

export async function updateDocumentAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = value(formData, "id");
  const returnTo = adminReturnPath(formData, "/admin/documents");
  const idResult = uuid.safeParse(id);
  const parsed = DocumentSchema.safeParse({
    client_id: value(formData, "client_id"),
    title: value(formData, "title"),
    kind: value(formData, "kind"),
  });
  if (!idResult.success) fail(returnTo, firstError(idResult.error));
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("documents")
    .update({ title: parsed.data.title, kind: parsed.data.kind })
    .eq("id", id)
    .eq("client_id", parsed.data.client_id)
    .select("id")
    .single();
  if (error || !updated) databaseFail(returnTo, "Updating document metadata", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Document metadata updated.",
    {
      action: "document.updated",
      entity: "document",
      entityId: id,
      meta: { client_id: parsed.data.client_id, title: parsed.data.title, kind: parsed.data.kind },
    },
    ["/admin/documents", `/admin/clients/${parsed.data.client_id}`],
  );
}

export async function deleteDocumentAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = value(formData, "id");
  const returnTo = adminReturnPath(formData, "/admin/documents");
  const idResult = uuid.safeParse(id);
  if (!idResult.success) fail(returnTo, firstError(idResult.error));

  const supabase = await createClient();
  const { data: document, error: loadError } = await supabase
    .from("documents")
    .select("client_id, title, storage_path")
    .eq("id", id)
    .single();
  if (loadError || !document) databaseFail(returnTo, "Loading the document", loadError?.message);
  if (!isClientStoragePath(document.storage_path, document.client_id)) {
    fail(returnTo, "Document deletion stopped because its tenant storage path is invalid.");
  }

  const { data: deleted, error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (error || !deleted) databaseFail(returnTo, "Deleting document metadata", error?.message);

  const { error: storageError } = await supabase.storage
    .from("client-documents")
    .remove([document.storage_path]);

  await complete(
    actor.id,
    returnTo,
    storageError
      ? "Document metadata was deleted, but the stored object could not be removed. Check the audit context."
      : "Document deleted.",
    {
      action: "document.deleted",
      entity: "document",
      entityId: id,
      meta: {
        client_id: document.client_id,
        title: document.title,
        storage_cleanup_error: storageError?.message ?? null,
        ...(storageError ? { orphaned_path: document.storage_path } : {}),
      },
    },
    ["/admin", "/admin/documents", `/admin/clients/${document.client_id}`],
    storageError ? "error" : "notice",
  );
}
