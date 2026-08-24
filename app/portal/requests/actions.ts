"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireClient } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const RequestSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters.")
    .max(200, "Keep the subject under 200 characters."),
  body: z
    .string()
    .trim()
    .min(1, "Describe what you need help with.")
    .max(5000, "Keep the description under 5000 characters."),
  priority: z.enum(["low", "normal", "high"], {
    errorMap: () => ({ message: "Choose a valid priority." }),
  }),
});

type RequestField = keyof z.infer<typeof RequestSchema>;

export type CreateRequestState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Partial<Record<RequestField, string>>;
};

export async function createRequest(
  _previous: CreateRequestState,
  formData: FormData,
): Promise<CreateRequestState> {
  const parsed = RequestSchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<RequestField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as RequestField;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors,
    };
  }

  const profile = await requireClient();
  const supabase = await createClient();
  const { error } = await supabase.from("requests").insert({
    client_id: profile.client_id,
    created_by: profile.id,
    subject: parsed.data.subject,
    body: parsed.data.body,
    priority: parsed.data.priority,
  });

  if (error) {
    console.error("[createRequest]", error.message);
    return {
      status: "error",
      message:
        "Your request could not be filed. Please try again or email Marters & Co.",
    };
  }

  revalidatePath("/portal");
  revalidatePath("/portal/requests");
  return {
    status: "ok",
    message: "Your request has been filed. We will update its status here.",
  };
}
