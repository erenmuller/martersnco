"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { setInitialPassword, type WelcomeState } from "./actions";

const initialState: WelcomeState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Setting your password…" : "Set password and continue"}
    </button>
  );
}

export default function WelcomeForm() {
  const [state, action] = useActionState(setInitialPassword, initialState);

  return (
    <form action={action} noValidate>
      {state.status === "error" && state.message && (
        <p className="notice notice-error" role="alert">
          {state.message}
        </p>
      )}

      <div className="field">
        <label htmlFor="password" className="field-label">
          Choose a password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          required
          minLength={10}
          maxLength={72}
          autoComplete="new-password"
          autoFocus
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby="password-hint"
        />
        <p
          id="password-hint"
          className={`field-hint ${state.fieldErrors?.password ? "text-burgundy" : ""}`}
        >
          {state.fieldErrors?.password ??
            "At least 10 characters. Use one you do not use anywhere else."}
        </p>
      </div>

      <div className="field">
        <label htmlFor="confirmPassword" className="field-label">
          Type it again
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          className="input"
          required
          minLength={10}
          maxLength={72}
          autoComplete="new-password"
          aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
          aria-describedby={
            state.fieldErrors?.confirmPassword ? "confirm-password-error" : undefined
          }
        />
        {state.fieldErrors?.confirmPassword && (
          <p id="confirm-password-error" className="field-hint text-burgundy" role="alert">
            {state.fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <div className="mt-6">
        <SubmitButton />
      </div>
    </form>
  );
}
