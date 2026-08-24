"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfiguration } from "../auth-shared";

const PasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(72, "Use no more than 72 characters."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords do not match.",
  });

type PasswordField = "password" | "confirmPassword";

export type ResetPasswordState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<PasswordField, string>>;
};

export async function resetPassword(
  _previous: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = PasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<PasswordField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (
        (field === "password" || field === "confirmPassword") &&
        !fieldErrors[field]
      ) {
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
      message:
        "Password recovery is not configured yet. Please contact Marters & Co.",
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
        "This reset link is invalid or has expired. Request a new link and try again.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return {
      status: "error",
      message:
        "We could not update that password. Request a new reset link and try again.",
    };
  }

  await supabase.auth.signOut({ scope: "local" });
  redirect("/login?reset=complete");
}
