"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireClient } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const NameSchema = z
  .string()
  .trim()
  .min(2, "Enter your full name.")
  .max(120, "Keep your name under 120 characters.");

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

export type NameState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldError?: string;
};

type PasswordField = "password" | "confirmPassword";

export type ProfilePasswordState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Partial<Record<PasswordField, string>>;
};

export async function updateFullName(
  _previous: NameState,
  formData: FormData,
): Promise<NameState> {
  const parsed = NameSchema.safeParse(formData.get("fullName"));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted field.",
      fieldError: parsed.error.issues[0]?.message,
    };
  }

  const profile = await requireClient();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data })
    .eq("id", profile.id);

  if (error) {
    console.error("[updateFullName]", error.message);
    return {
      status: "error",
      message: "Your name could not be updated. Please try again.",
    };
  }

  revalidatePath("/portal", "layout");
  return { status: "ok", message: "Your name has been updated." };
}

export async function updateProfilePassword(
  _previous: ProfilePasswordState,
  formData: FormData,
): Promise<ProfilePasswordState> {
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

  await requireClient();
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    console.error("[updateProfilePassword]", error.message);
    return {
      status: "error",
      message: "Your password could not be updated. Please try again.",
    };
  }

  return {
    status: "ok",
    message: "Your password has been updated.",
  };
}
