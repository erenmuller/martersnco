"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  requestPasswordReset,
  type ForgotPasswordState,
} from "./actions";

const initialState: ForgotPasswordState = { status: "idle" };

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Sending…" : "Send reset link"}
    </button>
  );
}

export default function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initialState);

  if (state.status === "ok") {
    return (
      <div role="status">
        <p className="notice notice-ok">
          If that address has an account, a password-reset link is on its way.
        </p>
        <p className="text-[0.875rem] leading-relaxed text-ink-70">
          Check your spam folder as well. The link is time-limited and can only
          be used once.
        </p>
        <Link href="/login" className="btn btn-secondary mt-6 w-full">
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} noValidate>
      {state.status === "error" && state.message && (
        <p className="notice notice-error" role="alert">
          {state.message}
        </p>
      )}

      <div className="field">
        <label htmlFor="email" className="field-label">
          Account email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          required
          maxLength={200}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={Boolean(state.fieldError)}
          aria-describedby={state.fieldError ? "email-error" : undefined}
        />
        {state.fieldError && (
          <p id="email-error" className="field-hint text-burgundy" role="alert">
            {state.fieldError}
          </p>
        )}
      </div>

      <div className="mt-6">
        <SendButton />
      </div>
      <p className="mt-5 text-center text-[0.8125rem] text-ink-45">
        Remembered it?{" "}
        <Link href="/login" className="link-rule">
          Sign in
        </Link>
      </p>
    </form>
  );
}
