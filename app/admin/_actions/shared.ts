import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminNoticeUrl, writeAdminAudit } from "@/lib/admin";
import { isIsoDate } from "@/lib/billing";

/* --------------------------------------------------------------------------
   Field primitives shared by every admin form schema.
   -------------------------------------------------------------------------- */

export const uuid = z.string().uuid("Choose a valid record.");

export const optionalDate = z
  .string()
  .refine((value) => value === "" || isIsoDate(value), "Use a valid date.");

export const requiredDate = z
  .string()
  .refine(isIsoDate, "Choose a valid date.");

/**
 * Money arrives from the form in major units and is stored in minor units, so
 * nothing downstream has to reason about float rounding.
 */
export const majorAmount = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a non-negative amount with at most two decimals.")
  .transform((amount) => Math.round(Number(amount) * 100))
  .refine(
    (amountMinor) => amountMinor <= 2_147_483_647,
    "Amount cannot exceed 21,474,836.47 in major currency units.",
  );

export const currencyCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Use a three-letter currency code.");

/* --------------------------------------------------------------------------
   Enum tuples. These mirror the database enums; keep them in step.
   -------------------------------------------------------------------------- */

export const CLIENT_STATUSES = ["prospect", "active", "paused", "closed"] as const;
export const SERVICE_CATEGORIES = [
  "process_identification",
  "automation_implementation",
  "workflow_program",
  "enterprise_build",
  "enablement",
] as const;
export const ENGAGEMENT_STATUSES = ["scoped", "active", "paused", "completed"] as const;
export const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "cancelled",
  "expired",
] as const;
export const BILLING_PERIODS = ["monthly", "quarterly", "annual"] as const;
export const PAYMENT_STATES = ["unpaid", "paid"] as const;
export const DOCUMENT_KINDS = ["process_map", "proposal", "report", "invoice", "other"] as const;
export const REQUEST_STATUSES = ["open", "in_progress", "blocked", "resolved"] as const;
export const REQUEST_PRIORITIES = ["low", "normal", "high"] as const;
export const QUOTE_STATUSES = ["none", "free", "quoted", "accepted", "declined"] as const;
export const NEWSLETTER_STATUSES = ["draft", "scheduled", "sent"] as const;

/* --------------------------------------------------------------------------
   Form reading and failure paths.
   -------------------------------------------------------------------------- */

export function value(formData: FormData, key: string): string {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry : "";
}

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Check the form and try again.";
}

export function fail(path: string, message: string): never {
  redirect(adminNoticeUrl(path, "error", message));
}

export function databaseFail(path: string, operation: string, message?: string): never {
  fail(path, `${operation} failed${message ? `: ${message}` : "."}`);
}

/**
 * The single exit for a successful mutation: write the audit row, revalidate
 * every affected route, then bounce back with a notice. An audit write that
 * fails is surfaced rather than swallowed — the change already landed, and an
 * unrecorded admin mutation is worth stopping for.
 */
export async function complete(
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
