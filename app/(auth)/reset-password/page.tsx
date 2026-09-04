import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <section className="card p-6 sm:p-8" aria-labelledby="reset-heading">
      <h1 id="reset-heading" className="display-l">
        Choose a new password
      </h1>
      <p className="mb-7 mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
        Set a password you do not use elsewhere. This page only works after
        opening a valid reset link from your email.
      </p>
      <ResetPasswordForm />
    </section>
  );
}
