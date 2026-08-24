"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { resetPassword, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = { status: "idle" };

function UpdateButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Updating…" : "Set new password"}
    </button>
  );
}

export default function ResetPasswordForm() {
  const [state, action] = useActionState(resetPassword, initialState);

  return (
    <form action={action} noValidate>
      {state.status === "error" && state.message && (
        <p className="notice notice-error" role="alert">
          {state.message}
        </p>
      )}

      <div className="field">
        <label htmlFor="password" className="field-label">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby="password-hint"
        />
        <p
          id="password-hint"
          className={`field-hint ${state.fieldErrors?.password ? "text-burgundy" : ""}`}
        >
          {state.fieldErrors?.password ?? "At least 8 characters."}
        </p>
      </div>

      <div className="field">
        <label htmlFor="confirmPassword" className="field-label">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          className="input"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
          aria-describedby={
            state.fieldErrors?.confirmPassword
              ? "confirm-password-error"
              : undefined
          }
        />
        {state.fieldErrors?.confirmPassword && (
          <p
            id="confirm-password-error"
            className="field-hint text-burgundy"
            role="alert"
          >
            {state.fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <div className="mt-6">
        <UpdateButton />
      </div>
      <p className="mt-5 text-center text-[0.8125rem] text-ink-45">
        Need a fresh link?{" "}
        <Link href="/forgot-password" className="link-rule">
          Start again
        </Link>
      </p>
    </form>
  );
}
