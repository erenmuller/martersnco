"use server";

import { z } from "zod";
import { adminReturnPath, nullableText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  QUOTE_STATUSES,
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  complete,
  currencyCode,
  databaseFail,
  fail,
  firstError,
  majorAmount,
  uuid,
  value,
} from "./shared";

/** Quote states that must carry a price. `free` and `none` must not. */
const PRICED_QUOTES = ["quoted", "accepted", "declined"] as const;

function isPriced(status: string): boolean {
  return (PRICED_QUOTES as readonly string[]).includes(status);
}

const RequestTriageSchema = z
  .object({
    id: uuid,
    status: z.enum(REQUEST_STATUSES),
    priority: z.enum(REQUEST_PRIORITIES),
    admin_notes: z.string().trim().max(5000),
    quote_status: z.enum(QUOTE_STATUSES),
    // Validated conditionally below: a waived request has no amount to parse.
    quote_amount: z.string().trim(),
    quote_currency: currencyCode,
    quote_note: z.string().trim().max(2000),
  })
  .superRefine((data, ctx) => {
    if (!isPriced(data.quote_status)) return;
    const amount = majorAmount.safeParse(data.quote_amount);
    if (!amount.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quote_amount"],
        message: "Enter the quoted amount, or choose “No charge”.",
      });
    }
  });

export async function triageRequestAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/requests");
  const parsed = RequestTriageSchema.safeParse({
    id: value(formData, "id"),
    status: value(formData, "status"),
    priority: value(formData, "priority"),
    admin_notes: value(formData, "admin_notes"),
    quote_status: value(formData, "quote_status") || "none",
    quote_amount: value(formData, "quote_amount"),
    quote_currency: value(formData, "quote_currency") || "AED",
    quote_note: value(formData, "quote_note"),
  });
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data: request, error: loadError } = await supabase
    .from("requests")
    .select("client_id, subject, quote_status, quoted_at")
    .eq("id", parsed.data.id)
    .single();
  if (loadError || !request) databaseFail(returnTo, "Loading the request", loadError?.message);

  const quoted = parsed.data.quote_status !== "none";
  const amountMinor = isPriced(parsed.data.quote_status)
    ? majorAmount.parse(parsed.data.quote_amount)
    : null;

  // The quote is dated once, when it first leaves "not quoted".
  const quotedAt = quoted
    ? ((request.quoted_at as string | null) ?? new Date().toISOString())
    : null;

  const { data: updated, error } = await supabase
    .from("requests")
    .update({
      status: parsed.data.status,
      priority: parsed.data.priority,
      admin_notes: nullableText(parsed.data.admin_notes),
      quote_status: parsed.data.quote_status,
      quote_amount_minor: amountMinor,
      quote_currency: parsed.data.quote_currency,
      quote_note: quoted ? nullableText(parsed.data.quote_note) : null,
      quoted_at: quotedAt,
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
        quote_status: parsed.data.quote_status,
        quote_amount_minor: amountMinor,
      },
    },
    ["/admin", "/admin/requests", "/portal/requests", `/admin/clients/${request.client_id}`],
  );
}
