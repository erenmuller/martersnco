"use server";

import { z } from "zod";
import { adminReturnPath, nullableText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  ENGAGEMENT_STATUSES,
  complete,
  databaseFail,
  fail,
  firstError,
  optionalDate,
  uuid,
  value,
} from "./shared";

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
