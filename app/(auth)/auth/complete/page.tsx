import type { Metadata } from "next";
import CompleteSignIn from "./CompleteSignIn";
import { safeNextPath } from "../../auth-shared";

export const metadata: Metadata = {
  title: "Opening your link",
  robots: { index: false, follow: false },
};

/**
 * Fragment fallback for email links.
 *
 * Supabase projects on the implicit flow return the session in the URL
 * fragment (`#access_token=…`), which never reaches the server. /auth/callback
 * forwards here when it sees no server-readable parameters; the browser keeps
 * the fragment across that redirect, so this page can finish the job.
 */
export default async function AuthCompletePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.next;
  const next = safeNextPath(
    Array.isArray(raw) ? raw[0] : raw,
    "/reset-password",
  );

  return (
    <section className="card p-6 sm:p-8" aria-labelledby="complete-heading">
      <h1 id="complete-heading" className="display-l">
        Opening your link
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
        One moment while we check it.
      </p>
      <CompleteSignIn next={next} />
    </section>
  );
}
