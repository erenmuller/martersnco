"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import {
  hasSupabaseConfiguration,
  isAdminPath,
  isPortalPath,
  safeNextPath,
} from "../auth-shared";

const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(200)
    .email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(200),
  next: z.string().optional(),
});

type LoginField = "email" | "password";

export type LoginState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<LoginField, string>>;
};

export async function signIn(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<LoginField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (
        (field === "email" || field === "password") &&
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
        "Client access is not configured yet. Please contact Marters & Co.",
    };
  }

  const supabase = await createClient();
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (authError) {
    return {
      status: "error",
      message: "The email or password was not recognised.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData, error: profileError } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null, error: new Error("No authenticated user") };
  const profile = profileData as Profile | null;

  if (profileError || !profile || !profile.is_active) {
    await supabase.auth.signOut({ scope: "local" });
    return {
      status: "error",
      message:
        "Your account is not active. Please contact Marters & Co. for access.",
    };
  }

  if (profile.role === "client" && !profile.client_id) {
    await supabase.auth.signOut({ scope: "local" });
    return {
      status: "error",
      message:
        "Your account is not linked to an organisation yet. Please contact Marters & Co.",
    };
  }

  const requested = safeNextPath(parsed.data.next, "");
  let destination = profile.role === "admin" ? "/admin" : "/portal";

  if (profile.role === "admin" && isAdminPath(requested)) {
    destination = requested;
  }
  if (profile.role === "client" && isPortalPath(requested)) {
    destination = requested;
  }

  redirect(destination);
}
