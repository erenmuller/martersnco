"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import { hasSupabaseConfiguration } from "../auth-shared";

const EmailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .max(200)
  .email("Enter a valid email address.");

export type ForgotPasswordState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldError?: string;
};

async function originForCallback(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const requestOrigin = (await headers()).get("origin");
  if (requestOrigin) {
    try {
      const parsed = new URL(requestOrigin);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.origin;
      }
    } catch {
      // Use the canonical site URL below.
    }
  }

  return site.url;
}

/**
 * The callback URL, with the destination already attached.
 *
 * Supabase's stock recovery template bounces through /auth/v1/verify and
 * arrives back carrying only `code` — no `type` — so the callback cannot tell
 * a recovery from anything else. Pinning `next` here means the destination
 * survives whichever shape comes back.
 */
async function callbackUrl(): Promise<string> {
  const url = new URL("/auth/callback", await originForCallback());
  url.searchParams.set("next", "/reset-password");
  return url.toString();
}

export async function requestPasswordReset(
  _previous: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = EmailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted field.",
      fieldError: parsed.error.issues[0]?.message,
    };
  }

  if (!hasSupabaseConfiguration()) {
    return {
      status: "error",
      message:
        "Password recovery is not configured yet. Please contact Marters & Co.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: await callbackUrl(),
  });

  // Avoid disclosing whether an address belongs to an account. Operational
  // failures are logged so they can still be diagnosed by the site owner.
  if (error) console.error("[requestPasswordReset]", error.message);

  return { status: "ok" };
}
