"use server";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { site } from "@/lib/site";

const LeadSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(120),
  email: z
    .string()
    .trim()
    .min(3, "We need an email to reply to.")
    .max(200)
    .email("That does not look like an email address."),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  employees: z.string().trim().max(40).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(20, "A sentence or two more, so we can give you a useful answer.")
    .max(4000, "Please keep this under 4000 characters."),
});

export type LeadState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof LeadSchema>, string>>;
};

function rateLimitDigest(value: string): string {
  // The service key is already required for this action and is a safe fallback
  // for local setup. Production may use a dedicated secret for easier rotation.
  const secret =
    process.env.CONTACT_RATE_LIMIT_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Contact rate-limit secret is not configured.");

  return createHmac("sha256", secret).update(value).digest("hex");
}

async function clientAddress(): Promise<string | null> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0];
  const value = forwarded?.trim() || requestHeaders.get("x-real-ip")?.trim();
  return value ? value.slice(0, 128) : null;
}

export async function submitLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  // Honeypot. A real person never fills a field they cannot see.
  if (formData.get("website")) {
    return { status: "ok" };
  }

  const parsed = LeadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    employees: formData.get("employees"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors: LeadState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof LeadSchema>;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors,
    };
  }

  try {
    // Service role: an anonymous visitor has no RLS grant on `leads`,
    // which is what keeps the table unreadable and unspammable from the client.
    const supabase = createAdminClient();

    // Apply both a per-address and per-email fixed window. The database stores
    // keyed digests only, never the raw address or email value.
    const address = await clientAddress();
    const checks = [
      supabase
        .rpc("consume_rate_limit", {
          p_scope: "contact:email",
          p_key_hash: rateLimitDigest(parsed.data.email.toLowerCase()),
          p_limit: 3,
          p_window_seconds: 3600,
        })
        .single(),
    ];
    if (address) {
      checks.push(
        supabase
          .rpc("consume_rate_limit", {
            p_scope: "contact:ip",
            p_key_hash: rateLimitDigest(address),
            p_limit: 10,
            p_window_seconds: 3600,
          })
          .single(),
      );
    }

    const limits = await Promise.all(checks);
    const rateError = limits.find((result) => result.error)?.error;
    if (rateError) throw rateError;
    if (
      limits.some(
        (result) =>
          (result.data as { allowed?: boolean } | null)?.allowed !== true,
      )
    ) {
      return {
        status: "error",
        message: `That form has been sent too often. Wait an hour or email ${site.email}.`,
      };
    }

    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company || null,
      employees: parsed.data.employees || null,
      message: parsed.data.message,
      source: "website:contact",
    });

    if (error) throw error;
  } catch (err) {
    console.error("[submitLead]", err);
    return {
      status: "error",
      message:
        `We could not record that. Email ${site.email} and we will pick it up there.`,
    };
  }

  return { status: "ok" };
}
