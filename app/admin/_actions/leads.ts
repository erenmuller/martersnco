"use server";

import { z } from "zod";
import { adminReturnPath } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { complete, databaseFail, fail, firstError, uuid, value } from "./shared";

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
