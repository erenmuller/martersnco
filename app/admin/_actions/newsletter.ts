"use server";

import { z } from "zod";
import { adminReturnPath, nullableText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  NEWSLETTER_STATUSES,
  complete,
  databaseFail,
  fail,
  firstError,
  optionalDate,
  uuid,
  value,
} from "./shared";

/**
 * Editions live in Google Docs; this table records the name and the link so the
 * console is the index of what has gone out and what is still being written.
 */
const EditionSchema = z
  .object({
    title: z.string().trim().min(2, "Name the edition.").max(200),
    doc_url: z
      .string()
      .trim()
      .max(2000, "That link is too long.")
      .url("Paste the full Google Doc link.")
      .refine((url) => url.startsWith("https://"), "The document link must start with https://"),
    status: z.enum(NEWSLETTER_STATUSES),
    sent_on: optionalDate,
    notes: z.string().trim().max(5000),
  })
  .superRefine((data, ctx) => {
    if (data.status === "sent" && !data.sent_on) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sent_on"],
        message: "A sent edition needs the date it went out.",
      });
    }
  });

function editionInput(formData: FormData) {
  return {
    title: value(formData, "title"),
    doc_url: value(formData, "doc_url"),
    status: value(formData, "status"),
    sent_on: value(formData, "sent_on"),
    notes: value(formData, "notes"),
  };
}

export async function createEditionAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/newsletter");
  const parsed = EditionSchema.safeParse(editionInput(formData));
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletter_editions")
    .insert({
      title: parsed.data.title,
      doc_url: parsed.data.doc_url,
      status: parsed.data.status,
      // The column constraint pairs `sent_on` with the sent status.
      sent_on: parsed.data.status === "sent" ? parsed.data.sent_on : null,
      notes: nullableText(parsed.data.notes),
      created_by: actor.id,
    })
    .select("id")
    .single();
  if (error || !data) databaseFail(returnTo, "Creating the edition", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Edition added.",
    {
      action: "newsletter.created",
      entity: "newsletter_edition",
      entityId: data.id,
      meta: { title: parsed.data.title, status: parsed.data.status },
    },
    ["/admin", "/admin/newsletter"],
  );
}

export async function updateEditionAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = value(formData, "id");
  const returnTo = adminReturnPath(formData, "/admin/newsletter");
  const idResult = uuid.safeParse(id);
  const parsed = EditionSchema.safeParse(editionInput(formData));
  if (!idResult.success) fail(returnTo, firstError(idResult.error));
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("newsletter_editions")
    .update({
      title: parsed.data.title,
      doc_url: parsed.data.doc_url,
      status: parsed.data.status,
      sent_on: parsed.data.status === "sent" ? parsed.data.sent_on : null,
      notes: nullableText(parsed.data.notes),
    })
    .eq("id", id)
    .select("id")
    .single();
  if (error || !updated) databaseFail(returnTo, "Updating the edition", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Edition updated.",
    {
      action: "newsletter.updated",
      entity: "newsletter_edition",
      entityId: id,
      meta: { title: parsed.data.title, status: parsed.data.status },
    },
    ["/admin", "/admin/newsletter"],
  );
}

/** One-click "it went out today", the most common state change. */
export async function markEditionSentAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = value(formData, "id");
  const returnTo = adminReturnPath(formData, "/admin/newsletter");
  const idResult = uuid.safeParse(id);
  if (!idResult.success) fail(returnTo, firstError(idResult.error));

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("newsletter_editions")
    .update({ status: "sent", sent_on: new Date().toISOString().slice(0, 10) })
    .eq("id", id)
    .select("id, title")
    .single();
  if (error || !updated) databaseFail(returnTo, "Marking the edition sent", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Edition marked sent.",
    {
      action: "newsletter.sent",
      entity: "newsletter_edition",
      entityId: id,
      meta: { title: updated.title },
    },
    ["/admin", "/admin/newsletter"],
  );
}

export async function deleteEditionAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = value(formData, "id");
  const returnTo = adminReturnPath(formData, "/admin/newsletter");
  const idResult = uuid.safeParse(id);
  if (!idResult.success) fail(returnTo, firstError(idResult.error));

  const supabase = await createClient();
  const { data: deleted, error } = await supabase
    .from("newsletter_editions")
    .delete()
    .eq("id", id)
    .select("id, title")
    .single();
  if (error || !deleted) databaseFail(returnTo, "Deleting the edition", error?.message);

  await complete(
    actor.id,
    returnTo,
    "Edition deleted.",
    {
      action: "newsletter.deleted",
      entity: "newsletter_edition",
      entityId: id,
      meta: { title: deleted.title },
    },
    ["/admin", "/admin/newsletter"],
  );
}
