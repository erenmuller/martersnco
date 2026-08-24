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
  expired: "That password-reset link is invalid or has expired. Request a new one.",
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
      <span className="eyebrow eyebrow-pine mb-3">Client portal</span>
      <h1 id="login-heading" className="display-m text-ink">
        Welcome back.
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
