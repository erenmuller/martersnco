import type { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <section className="card p-6 sm:p-8" aria-labelledby="forgot-heading">
      <span className="eyebrow eyebrow-pine mb-3">Account recovery</span>
      <h1 id="forgot-heading" className="display-m text-ink">
        Reset your password.
      </h1>
      <p className="mb-7 mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
        Enter the email address attached to your client account. We will send a
        secure reset link if the account exists.
      </p>
      <ForgotPasswordForm />
    </section>
  );
}
