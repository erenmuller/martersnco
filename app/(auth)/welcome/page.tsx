import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import WelcomeForm from "./WelcomeForm";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfiguration } from "../auth-shared";
import { site } from "@/lib/site";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = {
  title: "Set your password",
  robots: { index: false, follow: false },
};

/**
 * Never prerender this. The page is entirely a function of the session the
 * invitation link just established, and the configuration check below runs
 * before any dynamic API — so without this the route builds into a static
 * 307 to /login and every invited user is bounced.
 */
export const dynamic = "force-dynamic";

/**
 * Reached only through an invitation link, which /auth/callback has already
 * exchanged for a session. Anyone arriving without one is sent to sign in,
 * because there is nothing here for them to do.
 */
export default async function WelcomePage() {
  if (!hasSupabaseConfiguration()) redirect("/login?error=unconfigured");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=expired");

  const { data } = await supabase
    .from("profiles")
    .select("full_name, role, client:clients(name)")
    .eq("id", user.id)
    .single();
  const profile = data as
    | (Pick<Profile, "full_name" | "role"> & { client: { name: string } | null })
    | null;

  const firstName = profile?.full_name?.trim().split(/\s+/)[0];
  const organisation = profile?.client?.name;
  const isAdmin = profile?.role === "admin";

  return (
    <section className="card p-6 sm:p-8" aria-labelledby="welcome-heading">
      <h1 id="welcome-heading" className="display-l">
        {firstName ? `Welcome, ${firstName}` : "Welcome"}
      </h1>

      <p className="mb-7 mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
        {isAdmin
          ? `Your administrator account for ${site.name} is ready. Choose a password to finish setting it up.`
          : `Your client portal${
              organisation ? ` for ${organisation}` : ""
            } is ready. Choose a password to finish setting it up.`}
      </p>

      <WelcomeForm />

      <p className="mt-6 border-t border-rule pt-5 text-[0.8125rem] leading-relaxed text-ink-45">
        Signed in as{" "}
        <span className="text-ink-70">{user.email}</span>. Not you?{" "}
        <Link href="/signout" className="link-rule">
          Sign out
        </Link>
        .
      </p>
    </section>
  );
}
