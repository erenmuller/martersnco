"use server";

import { z } from "zod";
import { adminReturnPath, isClientStoragePath, nullableText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  CLIENT_STATUSES,
  complete,
  databaseFail,
  fail,
  firstError,
  uuid,
  value,
} from "./shared";

const ClientSchema = z.object({
  name: z.string().trim().min(2, "Enter a client name.").max(160),
  legal_name: z.string().trim().max(240),
  status: z.enum(CLIENT_STATUSES),
  industry: z.string().trim().max(160),
  primary_contact_name: z.string().trim().max(160),
  primary_contact_email: z.union([
    z.literal(""),
    z.string().trim().email("Enter a valid contact email.").max(200),
  ]),
  notes: z.string().trim().max(5000),
});

function clientInput(formData: FormData) {
  return {
    name: value(formData, "name"),
    legal_name: value(formData, "legal_name"),
    status: value(formData, "status"),
    industry: value(formData, "industry"),
    primary_contact_name: value(formData, "primary_contact_name"),
    primary_contact_email: value(formData, "primary_contact_email"),
    notes: value(formData, "notes"),
  };
}

export async function createClientAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/clients");
  const parsed = ClientSchema.safeParse(clientInput(formData));
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      ...parsed.data,
      legal_name: nullableText(parsed.data.legal_name),
      industry: nullableText(parsed.data.industry),
      primary_contact_name: nullableText(parsed.data.primary_contact_name),
      primary_contact_email: nullableText(parsed.data.primary_contact_email),
      notes: nullableText(parsed.data.notes),
    })
    .select("id, name")
    .single();
  if (error || !data) databaseFail(returnTo, "Creating the client", error?.message);

  await complete(
    actor.id,
    `/admin/clients/${data.id}`,
    "Client created.",
    { action: "client.created", entity: "client", entityId: data.id, meta: { name: data.name } },
    ["/admin", "/admin/clients"],
  );
}

export async function updateClientAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = value(formData, "id");
  const returnTo = adminReturnPath(formData, `/admin/clients/${id}`);
  const idResult = uuid.safeParse(id);
  const parsed = ClientSchema.safeParse(clientInput(formData));
  if (!idResult.success) fail(returnTo, firstError(idResult.error));
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("clients")
    .update({
      ...parsed.data,
      legal_name: nullableText(parsed.data.legal_name),
      industry: nullableText(parsed.data.industry),
      primary_contact_name: nullableText(parsed.data.primary_contact_name),
      primary_contact_email: nullableText(parsed.data.primary_contact_email),
      notes: nullableText(parsed.data.notes),
    })
    .eq("id", id)
    .select("id")
    .single();
  if (error || !updated) databaseFail(returnTo, "Updating the client", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Client updated.",
    { action: "client.updated", entity: "client", entityId: id, meta: { name: parsed.data.name } },
    ["/admin", "/admin/clients", `/admin/clients/${id}`],
  );
}

export async function deleteClientAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = value(formData, "id");
  const returnTo = adminReturnPath(formData, "/admin/clients");
  const idResult = uuid.safeParse(id);
  if (!idResult.success) fail(returnTo, firstError(idResult.error));

  const supabase = await createClient();
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("name")
    .eq("id", id)
    .single();
  if (clientError || !client) databaseFail(returnTo, "Loading the client", clientError?.message);

  const { data: documents, error: documentError } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("client_id", id);
  if (documentError) databaseFail(returnTo, "Checking client documents", documentError.message);

  const paths = (documents ?? []).map((document) => document.storage_path);
  if (paths.some((path) => !isClientStoragePath(path, id))) {
    fail(returnTo, "Client deletion stopped because a document failed its tenant storage-path check.");
  }
  const { data: deleted, error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (error || !deleted) databaseFail(returnTo, "Deleting the client", error?.message);

  let cleanupError: string | null = null;
  for (let index = 0; index < paths.length; index += 100) {
    const result = await supabase.storage
      .from("client-documents")
      .remove(paths.slice(index, index + 100));
    if (result.error) {
      cleanupError = result.error.message;
      break;
    }
  }

  await complete(
    actor.id,
    returnTo,
    cleanupError
      ? "Client deleted, but one or more stored files could not be removed. Check the audit context."
      : "Client deleted.",
    {
      action: "client.deleted",
      entity: "client",
      entityId: id,
      meta: {
        name: client.name,
        stored_files: paths.length,
        storage_cleanup_error: cleanupError,
        ...(cleanupError ? { orphaned_paths: paths } : {}),
      },
    },
    ["/admin", "/admin/clients", "/admin/documents", "/admin/subscriptions", "/admin/users"],
    cleanupError ? "error" : "notice",
  );
}
