"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/**
 * Reads the tokens Supabase left in the URL fragment and turns them into a
 * cookie session the server can see, then continues to the password form.
 *
 * Runs once. If there is nothing usable in the fragment the link was already
 * used, has expired, or was never valid — all of which the user fixes the same
 * way, by asking for another one.
 */
export default function CompleteSignIn({ next }: { next: string }) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const hash = window.location.hash.replace(/^#/, "");
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        // Supabase reports its own failures in the fragment too.
        const described = params.get("error_description") ?? params.get("error");
        if (described) console.error("[auth:complete]", described);
        if (!cancelled) setFailed(true);
        return;
      }

      const { error } = await createClient().auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (cancelled) return;

      if (error) {
        console.error("[auth:complete]", error.message);
        setFailed(true);
        return;
      }

      // Drop the tokens out of the address bar before moving on.
      window.history.replaceState(null, "", window.location.pathname);
      const destination =
        params.get("type") === "invite" && next === "/reset-password"
          ? "/welcome"
          : next;
      router.replace(destination);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [next, router]);

  if (!failed) {
    return (
      <p className="field-hint mt-5" role="status">
        Checking your link…
      </p>
    );
  }

  return (
    <div className="mt-5">
      <p className="notice notice-error" role="alert">
        This link is invalid or has already been used. Links can only be opened
        once, and some email scanners open them before you do.
      </p>
      <Link href="/forgot-password" className="btn btn-primary mt-2">
        Send me a new link
      </Link>
    </div>
  );
}
