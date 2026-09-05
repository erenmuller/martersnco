"use server";

import { z } from "zod";
import { adminReturnPath, nullableText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  SERVICE_CATEGORIES,
  complete,
  databaseFail,
  fail,
  firstError,
  uuid,
  value,
} from "./shared";

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
