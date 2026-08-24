import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** The signed-in user's profile, or null when signed out. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
}

/**
 * Require any active signed-in user. Middleware already gates these routes;
 * this is the second check that makes each page safe on its own.
 */
export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || !profile.is_active) redirect("/login");
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/portal");
  return profile;
}

/**
 * Require a client user and return their profile plus a guaranteed client_id.
 * An admin visiting the portal is sent to the admin console instead.
 */
export async function requireClient(): Promise<Profile & { client_id: string }> {
  const profile = await requireProfile();
  if (profile.role === "admin") redirect("/admin");
  if (!profile.client_id) redirect("/login?error=unlinked");
  return profile as Profile & { client_id: string };
}
