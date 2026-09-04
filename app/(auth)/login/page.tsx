import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import { safeNextPath } from "../auth-shared";

export const metadata: Metadata = { title: "Client login" };

const errorMessages: Record<string, string> = {
  inactive:
    "Your account is not active. Please contact Marters & Co. for access.",
  unlinked:
    "Your account is not linked to an organisation yet. Please contact Marters & Co.",
  unconfigured:
    "Client access is not configured yet. Please contact Marters & Co.",
  auth: "We could not complete that sign-in. Please try again.",
  expired:
    "That link is invalid or has already been used. Ask for a new one below, or contact Marters & Co. if it was an invitation.",
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(first(params.next), "/portal");
  const error = first(params.error);
  const resetComplete = first(params.reset) === "complete";

  return (
    <section className="card p-6 sm:p-8" aria-labelledby="login-heading">
      <h1 id="login-heading" className="display-l">
        Client portal
      </h1>
      <p className="mb-7 mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
        Sign in to view your engagements, documents, subscriptions and support
        requests.
      </p>

      {error && errorMessages[error] && (
        <p className="notice notice-error" role="alert">
          {errorMessages[error]}
        </p>
      )}
      {resetComplete && (
        <p className="notice notice-ok" role="status">
          Your password has been updated. Sign in with the new password.
        </p>
      )}

      <LoginForm nextPath={nextPath} />
    </section>
  );
}
