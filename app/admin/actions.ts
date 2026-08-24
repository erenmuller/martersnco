"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  adminNoticeUrl,
  adminReturnPath,
  isClientStoragePath,
  nullableText,
  safeFileName,
  writeAdminAudit,
} from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const uuid = z.string().uuid("Choose a valid record.");
const optionalDate = z
  .string()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), "Use a valid date.");

const CLIENT_STATUSES = ["prospect", "active", "paused", "closed"] as const;
const SERVICE_CATEGORIES = [
  "process_identification",
  "automation_implementation",
  "workflow_program",
  "enterprise_build",
  "enablement",
] as const;
const ENGAGEMENT_STATUSES = ["scoped", "active", "paused", "completed"] as const;
const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "cancelled",
  "expired",
] as const;
const BILLING_PERIODS = ["monthly", "quarterly", "annual"] as const;
const DOCUMENT_KINDS = ["process_map", "proposal", "report", "invoice", "other"] as const;
const REQUEST_STATUSES = ["open", "in_progress", "blocked", "resolved"] as const;
const REQUEST_PRIORITIES = ["low", "normal", "high"] as const;

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

function value(formData: FormData, key: string): string {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry : "";
}

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Check the form and try again.";
}

function fail(path: string, message: string): never {
  redirect(adminNoticeUrl(path, "error", message));
}

function databaseFail(path: string, operation: string, message?: string): never {
  fail(path, `${operation} failed${message ? `: ${message}` : "."}`);
}

export async function adminSignOutAction() {
  const actor = await requireAdmin();
  const supabase = await createClient();
  try {
    await writeAdminAudit(actor.id, "session.signed_out", "profile", actor.id);
  } catch (error) {
    console.error("[admin:audit]", error);
  }
  const { error } = await supabase.auth.signOut();
  if (error) fail("/admin", `Signing out failed: ${error.message}`);
  revalidatePath("/admin", "layout");
  redirect("/login");
}

async function complete(
  actorId: string,
  returnTo: string,
  notice: string,
  audit: {
    action: string;
    entity: string;
    entityId?: string | null;
    meta?: Record<string, unknown>;
  },
  paths: string[],
  resultKind: "notice" | "error" = "notice",
): Promise<never> {
  try {
    await writeAdminAudit(
      actorId,
      audit.action,
      audit.entity,
      audit.entityId ?? null,
      audit.meta ?? {},
    );
  } catch (error) {
    console.error("[admin:audit]", error);
    paths.forEach((path) => revalidatePath(path));
    fail(returnTo, "The change was saved, but its audit entry failed. Stop and check the server logs.");
  }

  paths.forEach((path) => revalidatePath(path));
  redirect(adminNoticeUrl(returnTo, resultKind, notice));
}

/* --------------------------------------------------------------------------
   Clients
   -------------------------------------------------------------------------- */

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

/* --------------------------------------------------------------------------
   Service catalogue
   -------------------------------------------------------------------------- */

const ServiceSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Enter a service code.")
    .max(30)
    .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, hyphens or underscores in the code."),
  name: z.string().trim().min(2, "Enter a service name.").max(200),
  summary: z.string().trim().max(1000),
  category: z.enum(SERVICE_CATEGORIES),
  sort_order: z.coerce.number().int().min(0).max(100000),
  is_active: z.boolean(),
});

function serviceInput(formData: FormData) {
  return {
    code: value(formData, "code").toUpperCase(),
    name: value(formData, "name"),
    summary: value(formData, "summary"),
    category: value(formData, "category"),
    sort_order: value(formData, "sort_order"),
    is_active: formData.get("is_active") === "on",
  };
}

export async function createServiceAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/services");
  const parsed = ServiceSchema.safeParse(serviceInput(formData));
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .insert({ ...parsed.data, summary: nullableText(parsed.data.summary) })
    .select("id")
    .single();
  if (error || !data) databaseFail(returnTo, "Creating the service", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Service created.",
    {
      action: "service.created",
      entity: "service",
      entityId: data.id,
      meta: { code: parsed.data.code, name: parsed.data.name },
    },
    ["/admin", "/admin/services", "/admin/clients"],
  );
}

export async function updateServiceAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = value(formData, "id");
  const returnTo = adminReturnPath(formData, "/admin/services");
  const idResult = uuid.safeParse(id);
  const parsed = ServiceSchema.safeParse(serviceInput(formData));
  if (!idResult.success) fail(returnTo, firstError(idResult.error));
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("services")
    .update({ ...parsed.data, summary: nullableText(parsed.data.summary) })
    .eq("id", id)
    .select("id")
    .single();
  if (error || !updated) databaseFail(returnTo, "Updating the service", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Service updated.",
    {
      action: "service.updated",
      entity: "service",
      entityId: id,
      meta: { code: parsed.data.code, name: parsed.data.name },
    },
    ["/admin", "/admin/services", "/admin/clients"],
  );
}

export async function deleteServiceAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = value(formData, "id");
  const returnTo = adminReturnPath(formData, "/admin/services");
  const idResult = uuid.safeParse(id);
  if (!idResult.success) fail(returnTo, firstError(idResult.error));

  const supabase = await createClient();
  const { data: service, error: loadError } = await supabase
    .from("services")
    .select("code, name")
    .eq("id", id)
    .single();
  if (loadError || !service) databaseFail(returnTo, "Loading the service", loadError?.message);

  const { data: deleted, error } = await supabase
    .from("services")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (error || !deleted) databaseFail(returnTo, "Deleting the service", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Service deleted.",
    {
      action: "service.deleted",
      entity: "service",
      entityId: id,
      meta: { code: service.code, name: service.name },
    },
    ["/admin", "/admin/services"],
  );
}

/* --------------------------------------------------------------------------
   Client engagements
   -------------------------------------------------------------------------- */

const EngagementSchema = z
  .object({
    client_id: uuid,
    service_id: uuid,
    status: z.enum(ENGAGEMENT_STATUSES),
    started_on: optionalDate,
    ended_on: optionalDate,
    owner_name: z.string().trim().max(160),
    notes: z.string().trim().max(5000),
  })
  .refine(
    (data) => !data.started_on || !data.ended_on || data.ended_on >= data.started_on,
    { message: "The end date cannot be before the start date." },
  );

function engagementInput(formData: FormData) {
  return {
    client_id: value(formData, "client_id"),
    service_id: value(formData, "service_id"),
    status: value(formData, "status"),
    started_on: value(formData, "started_on"),
    ended_on: value(formData, "ended_on"),
    owner_name: value(formData, "owner_name"),
    notes: value(formData, "notes"),
  };
}

export async function createEngagementAction(formData: FormData) {
  const actor = await requireAdmin();
  const fallback = `/admin/clients/${value(formData, "client_id")}`;
  const returnTo = adminReturnPath(formData, fallback);
  const parsed = EngagementSchema.safeParse(engagementInput(formData));
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data: assignableService, error: serviceError } = await supabase
    .from("services")
    .select("id")
    .eq("id", parsed.data.service_id)
    .eq("is_active", true)
    .single();
  if (serviceError || !assignableService) {
    fail(returnTo, "Choose an active service catalogue item.");
  }

  const { data, error } = await supabase
    .from("client_services")
    .insert({
      ...parsed.data,
      started_on: nullableText(parsed.data.started_on),
      ended_on: nullableText(parsed.data.ended_on),
      owner_name: nullableText(parsed.data.owner_name),
      notes: nullableText(parsed.data.notes),
    })
    .select("id")
    .single();
  if (error || !data) databaseFail(returnTo, "Creating the engagement", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Engagement added.",
    {
      action: "engagement.created",
      entity: "client_service",
      entityId: data.id,
      meta: { client_id: parsed.data.client_id, service_id: parsed.data.service_id },
    },
    ["/admin", "/admin/clients", `/admin/clients/${parsed.data.client_id}`],
  );
}

export async function updateEngagementAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = value(formData, "id");
  const fallback = `/admin/clients/${value(formData, "client_id")}`;
  const returnTo = adminReturnPath(formData, fallback);
  const idResult = uuid.safeParse(id);
  const parsed = EngagementSchema.safeParse(engagementInput(formData));
  if (!idResult.success) fail(returnTo, firstError(idResult.error));
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("client_services")
    .update({
      service_id: parsed.data.service_id,
      status: parsed.data.status,
      started_on: nullableText(parsed.data.started_on),
      ended_on: nullableText(parsed.data.ended_on),
      owner_name: nullableText(parsed.data.owner_name),
      notes: nullableText(parsed.data.notes),
    })
    .eq("id", id)
    .eq("client_id", parsed.data.client_id)
    .select("id")
    .single();
  if (error || !updated) databaseFail(returnTo, "Updating the engagement", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Engagement updated.",
    {
      action: "engagement.updated",
      entity: "client_service",
      entityId: id,
      meta: { client_id: parsed.data.client_id, service_id: parsed.data.service_id },
    },
    ["/admin", "/admin/clients", `/admin/clients/${parsed.data.client_id}`],
  );
}

export async function deleteEngagementAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = value(formData, "id");
  const clientId = value(formData, "client_id");
  const returnTo = adminReturnPath(formData, `/admin/clients/${clientId}`);
  const parsed = z.object({ id: uuid, clientId: uuid }).safeParse({ id, clientId });
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data: deleted, error } = await supabase
    .from("client_services")
    .delete()
    .eq("id", id)
    .eq("client_id", clientId)
    .select("id")
    .single();
  if (error || !deleted) databaseFail(returnTo, "Deleting the engagement", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Engagement deleted.",
    {
      action: "engagement.deleted",
      entity: "client_service",
      entityId: id,
      meta: { client_id: clientId },
    },
    ["/admin", "/admin/clients", `/admin/clients/${clientId}`],
  );
}

/* --------------------------------------------------------------------------
   Subscriptions
   -------------------------------------------------------------------------- */

const SubscriptionSchema = z
  .object({
    client_id: uuid,
    plan_name: z.string().trim().min(2, "Enter a plan name.").max(200),
    status: z.enum(SUBSCRIPTION_STATUSES),
    billing_period: z.enum(BILLING_PERIODS),
    amount: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Enter a non-negative amount with at most two decimals.")
      .transform((amount) => Math.round(Number(amount) * 100))
      .refine(
        (amountMinor) => amountMinor <= 2_147_483_647,
        "Amount cannot exceed 21,474,836.47 in major currency units.",
      ),
    currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "Use a three-letter currency code."),
    started_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a start date."),
    renews_on: optionalDate,
    notes: z.string().trim().max(5000),
  })
  .refine((data) => !data.renews_on || data.renews_on >= data.started_on, {
    message: "The renewal date cannot be before the start date.",
  });

function subscriptionInput(formData: FormData) {
  return {
    client_id: value(formData, "client_id"),
    plan_name: value(formData, "plan_name"),
    status: value(formData, "status"),
    billing_period: value(formData, "billing_period"),
    amount: value(formData, "amount"),
    currency: value(formData, "currency"),
    started_on: value(formData, "started_on"),
    renews_on: value(formData, "renews_on"),
    notes: value(formData, "notes"),
  };
}

export async function createSubscriptionAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/subscriptions");
  const parsed = SubscriptionSchema.safeParse(subscriptionInput(formData));
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      client_id: parsed.data.client_id,
      plan_name: parsed.data.plan_name,
      status: parsed.data.status,
      billing_period: parsed.data.billing_period,
      amount_minor: parsed.data.amount,
      currency: parsed.data.currency,
      started_on: parsed.data.started_on,
      renews_on: nullableText(parsed.data.renews_on),
      cancelled_at: parsed.data.status === "cancelled" ? new Date().toISOString() : null,
      notes: nullableText(parsed.data.notes),
    })
    .select("id")
    .single();
  if (error || !data) databaseFail(returnTo, "Creating the subscription", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Subscription created.",
    {
      action: "subscription.created",
      entity: "subscription",
      entityId: data.id,
      meta: { client_id: parsed.data.client_id, plan_name: parsed.data.plan_name },
    },
    ["/admin", "/admin/subscriptions", `/admin/clients/${parsed.data.client_id}`],
  );
}

export async function updateSubscriptionAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = value(formData, "id");
  const returnTo = adminReturnPath(formData, "/admin/subscriptions");
  const idResult = uuid.safeParse(id);
  const parsed = SubscriptionSchema.safeParse(subscriptionInput(formData));
  if (!idResult.success) fail(returnTo, firstError(idResult.error));
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data: existing, error: loadError } = await supabase
    .from("subscriptions")
    .select("cancelled_at")
    .eq("id", id)
    .single();
  if (loadError || !existing) databaseFail(returnTo, "Loading the subscription", loadError?.message);

  const { data: updated, error } = await supabase
    .from("subscriptions")
    .update({
      client_id: parsed.data.client_id,
      plan_name: parsed.data.plan_name,
      status: parsed.data.status,
      billing_period: parsed.data.billing_period,
      amount_minor: parsed.data.amount,
      currency: parsed.data.currency,
      started_on: parsed.data.started_on,
      renews_on: nullableText(parsed.data.renews_on),
      cancelled_at:
        parsed.data.status === "cancelled"
          ? existing.cancelled_at ?? new Date().toISOString()
          : null,
      notes: nullableText(parsed.data.notes),
    })
    .eq("id", id)
    .select("id")
    .single();
  if (error || !updated) databaseFail(returnTo, "Updating the subscription", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Subscription updated.",
    {
      action: "subscription.updated",
      entity: "subscription",
      entityId: id,
      meta: { client_id: parsed.data.client_id, plan_name: parsed.data.plan_name },
    },
    ["/admin", "/admin/subscriptions", `/admin/clients/${parsed.data.client_id}`],
  );
}

export async function deleteSubscriptionAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = value(formData, "id");
  const returnTo = adminReturnPath(formData, "/admin/subscriptions");
  const idResult = uuid.safeParse(id);
  if (!idResult.success) fail(returnTo, firstError(idResult.error));

  const supabase = await createClient();
  const { data: subscription, error: loadError } = await supabase
    .from("subscriptions")
    .select("client_id, plan_name")
    .eq("id", id)
    .single();
  if (loadError || !subscription) databaseFail(returnTo, "Loading the subscription", loadError?.message);

  const { data: deleted, error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (error || !deleted) databaseFail(returnTo, "Deleting the subscription", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Subscription deleted.",
    {
      action: "subscription.deleted",
      entity: "subscription",
      entityId: id,
      meta: { client_id: subscription.client_id, plan_name: subscription.plan_name },
    },
    ["/admin", "/admin/subscriptions", `/admin/clients/${subscription.client_id}`],
  );
}

/* --------------------------------------------------------------------------
   Documents
   -------------------------------------------------------------------------- */

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

/* --------------------------------------------------------------------------
   Request triage
   -------------------------------------------------------------------------- */

const RequestTriageSchema = z.object({
  id: uuid,
  status: z.enum(REQUEST_STATUSES),
  priority: z.enum(REQUEST_PRIORITIES),
  admin_notes: z.string().trim().max(5000),
});

export async function triageRequestAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/requests");
  const parsed = RequestTriageSchema.safeParse({
    id: value(formData, "id"),
    status: value(formData, "status"),
    priority: value(formData, "priority"),
    admin_notes: value(formData, "admin_notes"),
  });
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data: request, error: loadError } = await supabase
    .from("requests")
    .select("client_id, subject")
    .eq("id", parsed.data.id)
    .single();
  if (loadError || !request) databaseFail(returnTo, "Loading the request", loadError?.message);

  const { data: updated, error } = await supabase
    .from("requests")
    .update({
      status: parsed.data.status,
      priority: parsed.data.priority,
      admin_notes: nullableText(parsed.data.admin_notes),
    })
    .eq("id", parsed.data.id)
    .select("id")
    .single();
  if (error || !updated) databaseFail(returnTo, "Updating the request", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Request updated.",
    {
      action: "request.triaged",
      entity: "request",
      entityId: parsed.data.id,
      meta: {
        client_id: request.client_id,
        subject: request.subject,
        status: parsed.data.status,
        priority: parsed.data.priority,
      },
    },
    ["/admin", "/admin/requests", `/admin/clients/${request.client_id}`],
  );
}

/* --------------------------------------------------------------------------
   Lead inbox (service-role table)
   -------------------------------------------------------------------------- */

export async function setLeadHandledAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/leads");
  const parsed = z
    .object({ id: uuid, handled: z.enum(["true", "false"]) })
    .safeParse({ id: value(formData, "id"), handled: value(formData, "handled") });
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const admin = createAdminClient();
  const handled = parsed.data.handled === "true";
  const { data: lead, error } = await admin
    .from("leads")
    .update({ handled })
    .eq("id", parsed.data.id)
    .select("id")
    .single();
  if (error || !lead) databaseFail(returnTo, "Updating the lead", error?.message);

  await complete(
    actor.id,
    returnTo,
    handled ? "Lead marked handled." : "Lead returned to the inbox.",
    {
      action: handled ? "lead.handled" : "lead.reopened",
      entity: "lead",
      entityId: parsed.data.id,
    },
    ["/admin", "/admin/leads"],
  );
}

export async function deleteLeadAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/leads");
  const id = value(formData, "id");
  const idResult = uuid.safeParse(id);
  if (!idResult.success) fail(returnTo, firstError(idResult.error));

  const admin = createAdminClient();
  const { data: deleted, error } = await admin
    .from("leads")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (error || !deleted) databaseFail(returnTo, "Deleting the lead", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Lead deleted.",
    {
      action: "lead.deleted",
      entity: "lead",
      entityId: id,
    },
    ["/admin", "/admin/leads"],
  );
}

/* --------------------------------------------------------------------------
   User management (service role, always after requireAdmin)
   -------------------------------------------------------------------------- */

const UserSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
    full_name: z.string().trim().max(160),
    role: z.enum(["admin", "client"]),
    client_id: z.string(),
  })
  .refine((data) => data.role === "admin" || uuid.safeParse(data.client_id).success, {
    message: "Choose a client for a client user.",
  });

export async function inviteUserAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/users");
  const parsed = UserSchema.safeParse({
    email: value(formData, "email"),
    full_name: value(formData, "full_name"),
    role: value(formData, "role"),
    client_id: value(formData, "client_id"),
  });
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const admin = createAdminClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const options: { data: { full_name: string }; redirectTo?: string } = {
    // Never put role or client_id in caller-editable user metadata. The profile
    // assignment below is the sole source of authority.
    data: { full_name: parsed.data.full_name },
  };
  if (origin) options.redirectTo = `${origin}/auth/callback`;

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    options,
  );
  if (inviteError || !invited.user) databaseFail(returnTo, "Inviting the user", inviteError?.message);

  const userId = invited.user.id;
  const clientId = parsed.data.role === "client" ? parsed.data.client_id : null;
  const { data: assignedProfile, error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: nullableText(parsed.data.full_name),
      role: parsed.data.role,
      client_id: clientId,
      is_active: true,
    })
    .eq("id", userId)
    .select("id")
    .single();

  if (profileError || !assignedProfile) {
    const assignmentMessage = profileError?.message ?? "The invited profile was not created.";
    const { error: rollbackError } = await admin.auth.admin.deleteUser(userId);
    try {
      await writeAdminAudit(actor.id, "user.invite_rolled_back", "profile", userId, {
        email: parsed.data.email,
        reason: assignmentMessage,
        rollback_failed: Boolean(rollbackError),
      });
    } catch (auditError) {
      console.error("[admin:audit]", auditError);
    }
    databaseFail(
      returnTo,
      "Assigning the invited user",
      rollbackError
        ? `${assignmentMessage}; rollback also failed: ${rollbackError.message}`
        : assignmentMessage,
    );
  }

  await complete(
    actor.id,
    returnTo,
    "Invitation sent.",
    {
      action: "user.invited",
      entity: "profile",
      entityId: userId,
      meta: { email: parsed.data.email, role: parsed.data.role, client_id: clientId },
    },
    ["/admin", "/admin/users", ...(clientId ? [`/admin/clients/${clientId}`] : [])],
  );
}

const UserUpdateSchema = z
  .object({
    id: uuid,
    full_name: z.string().trim().max(160),
    phone_e164: z.union([
      z.literal(""),
      z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "Use an E.164 phone number, such as +971501234567."),
    ]),
    role: z.enum(["admin", "client"]),
    client_id: z.string(),
    is_active: z.boolean(),
  })
  .refine((data) => data.role === "admin" || uuid.safeParse(data.client_id).success, {
    message: "Choose a client for a client user.",
  });

export async function updateUserAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/users");
  const parsed = UserUpdateSchema.safeParse({
    id: value(formData, "id"),
    full_name: value(formData, "full_name"),
    phone_e164: value(formData, "phone_e164"),
    role: value(formData, "role"),
    client_id: value(formData, "client_id"),
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) fail(returnTo, firstError(parsed.error));
  if (parsed.data.id === actor.id && (!parsed.data.is_active || parsed.data.role !== "admin")) {
    fail(returnTo, "You cannot remove your own admin access.");
  }

  const clientId = parsed.data.role === "client" ? parsed.data.client_id : null;
  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .update({
      full_name: nullableText(parsed.data.full_name),
      phone_e164: nullableText(parsed.data.phone_e164),
      role: parsed.data.role,
      client_id: clientId,
      is_active: parsed.data.is_active,
    })
    .eq("id", parsed.data.id)
    .select("email")
    .single();
  if (error || !profile) databaseFail(returnTo, "Updating the user", error?.message);

  await complete(
    actor.id,
    returnTo,
    "User updated.",
    {
      action: "user.updated",
      entity: "profile",
      entityId: parsed.data.id,
      meta: {
        email: profile.email,
        role: parsed.data.role,
        client_id: clientId,
        is_active: parsed.data.is_active,
      },
    },
    ["/admin", "/admin/users", ...(clientId ? [`/admin/clients/${clientId}`] : [])],
  );
}

export async function deleteUserAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/users");
  const id = value(formData, "id");
  const idResult = uuid.safeParse(id);
  if (!idResult.success) fail(returnTo, firstError(idResult.error));
  if (id === actor.id) fail(returnTo, "You cannot delete your own account.");

  const admin = createAdminClient();
  const { data: profile, error: loadError } = await admin
    .from("profiles")
    .select("email, role, client_id")
    .eq("id", id)
    .single();
  if (loadError || !profile) databaseFail(returnTo, "Loading the user", loadError?.message);

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) databaseFail(returnTo, "Deleting the user", error.message);

  await complete(
    actor.id,
    returnTo,
    "User deleted.",
    {
      action: "user.deleted",
      entity: "profile",
      entityId: id,
      meta: { email: profile.email, role: profile.role, client_id: profile.client_id },
    },
    ["/admin", "/admin/users", ...(profile.client_id ? [`/admin/clients/${profile.client_id}`] : [])],
  );
}
