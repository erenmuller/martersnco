"use server";

import { z } from "zod";
import { adminReturnPath, nullableText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { derivedRenewal } from "@/lib/billing";
import {
  BILLING_PERIODS,
  PAYMENT_STATES,
  SUBSCRIPTION_STATUSES,
  complete,
  currencyCode,
  databaseFail,
  fail,
  firstError,
  majorAmount,
  optionalDate,
  requiredDate,
  uuid,
  value,
} from "./shared";

/**
 * The renewal date is derived from the start date and the billing period, so a
 * monthly plan needs nothing but a start date. `renews_on` stays a real column
 * rather than a computed one: an admin can override it for a plan that renews
 * off-cycle, and the stored date is what the client's portal shows.
 */
const SubscriptionSchema = z
  .object({
    client_id: uuid,
    plan_name: z.string().trim().min(2, "Enter a plan name.").max(200),
    status: z.enum(SUBSCRIPTION_STATUSES),
    billing_period: z.enum(BILLING_PERIODS),
    amount: majorAmount,
    currency: currencyCode,
    started_on: requiredDate,
    renews_on: optionalDate,
    payment_status: z.enum(PAYMENT_STATES),
    notes: z.string().trim().max(5000),
  })
  .refine((data) => !data.renews_on || data.renews_on >= data.started_on, {
    message: "The renewal date cannot be before the start date.",
    path: ["renews_on"],
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
    payment_status: value(formData, "payment_status") || "unpaid",
    notes: value(formData, "notes"),
  };
}

/** `paid_on` exists exactly when the row is paid — the database enforces the pair. */
function paidOnFor(status: "unpaid" | "paid", existing: string | null): string | null {
  if (status !== "paid") return null;
  return existing ?? new Date().toISOString().slice(0, 10);
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
      renews_on: derivedRenewal(
        parsed.data.started_on,
        parsed.data.billing_period,
        nullableText(parsed.data.renews_on),
      ),
      cancelled_at: parsed.data.status === "cancelled" ? new Date().toISOString() : null,
      payment_status: parsed.data.payment_status,
      paid_on: paidOnFor(parsed.data.payment_status, null),
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
    .select("cancelled_at, payment_status, paid_on")
    .eq("id", id)
    .single();
  if (loadError || !existing) databaseFail(returnTo, "Loading the subscription", loadError?.message);

  // An edit that leaves the payment alone must not restamp the date it was settled.
  const keepPaidOn = existing.payment_status === "paid" ? (existing.paid_on as string | null) : null;

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
      renews_on: derivedRenewal(
        parsed.data.started_on,
        parsed.data.billing_period,
        nullableText(parsed.data.renews_on),
      ),
      cancelled_at:
        parsed.data.status === "cancelled"
          ? existing.cancelled_at ?? new Date().toISOString()
          : null,
      payment_status: parsed.data.payment_status,
      paid_on: paidOnFor(parsed.data.payment_status, keepPaidOn),
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

/**
 * The one-click toggle in the register. Kept separate from the full edit form
 * so marking a period paid is a single, auditable act.
 */
export async function setSubscriptionPaymentAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/subscriptions");
  const parsed = z
    .object({ id: uuid, payment_status: z.enum(PAYMENT_STATES) })
    .safeParse({
      id: value(formData, "id"),
      payment_status: value(formData, "payment_status"),
    });
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const supabase = await createClient();
  const { data: existing, error: loadError } = await supabase
    .from("subscriptions")
    .select("client_id, plan_name, paid_on")
    .eq("id", parsed.data.id)
    .single();
  if (loadError || !existing) databaseFail(returnTo, "Loading the subscription", loadError?.message);

  const { data: updated, error } = await supabase
    .from("subscriptions")
    .update({
      payment_status: parsed.data.payment_status,
      paid_on: paidOnFor(parsed.data.payment_status, null),
    })
    .eq("id", parsed.data.id)
    .select("id")
    .single();
  if (error || !updated) databaseFail(returnTo, "Updating the payment status", error?.message);

  await complete(
    actor.id,
    returnTo,
    parsed.data.payment_status === "paid"
      ? "Marked paid for this period."
      : "Marked unpaid for this period.",
    {
      action: parsed.data.payment_status === "paid" ? "subscription.paid" : "subscription.unpaid",
      entity: "subscription",
      entityId: parsed.data.id,
      meta: { client_id: existing.client_id, plan_name: existing.plan_name },
    },
    ["/admin", "/admin/subscriptions", `/admin/clients/${existing.client_id}`],
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
