"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { hasSupabaseConfiguration } from "../auth-shared";

/**
 * Setting a password for the first time.
 *
 * Separate from /reset-password on purpose. The two flows do the same thing
 * to auth.users but they are not the same event: recovery ends by signing the
 * user out so they prove the new password, whereas someone opening an
 * invitation should land in the portal they were invited to.
 */

const PasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Use at least 10 characters.")
      .max(72, "Use no more than 72 characters."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords do not match.",
  });

type PasswordField = "password" | "confirmPassword";

export type WelcomeState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<PasswordField, string>>;
};

export async function setInitialPassword(
  _previous: WelcomeState,
  formData: FormData,
): Promise<WelcomeState> {
  const parsed = PasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<PasswordField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if ((field === "password" || field === "confirmPassword") && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors,
    };
  }

  if (!hasSupabaseConfiguration()) {
    return {
      status: "error",
      message: "Client access is not configured yet. Please contact Marters & Co.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message:
        "This invitation link is invalid or has expired. Ask Marters & Co. to send a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return {
      status: "error",
      message:
        "We could not set that password. Ask Marters & Co. for a fresh invitation link and try again.",
    };
  }

  // The session from the invitation link is already valid, so send them
  // straight to the area they were given access to rather than asking them to
  // sign in with a password they set ten seconds ago.
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, client_id")
    .eq("id", user.id)
    .single();
  const profile = profileData as Pick<Profile, "role" | "client_id"> | null;

  if (profile?.role === "admin") redirect("/admin");
  if (profile?.role === "client" && profile.client_id) redirect("/portal");

  // Provisioned but not yet attached to an organisation. The password is set;
  // the sign-in page explains the rest.
  redirect("/login?error=unlinked");
}
