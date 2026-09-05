"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAdminAudit } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail } from "./shared";

export async function adminSignOutAction() {
  const actor = await requireAdmin();
  const supabase = await createClient();
  try {
    await writeAdminAudit(actor.id, "session.signed_out", "profile", actor.id);
  } catch (error) {
    console.error("[admin:audit]", error);
  }
  const { error } = await supabase.auth.signOut();
  if (error) fail("/admin", `Signing out failed: ${error.message}`);
  revalidatePath("/admin", "layout");
  redirect("/login");
}
