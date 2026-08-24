"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action] = useActionState(signIn, initialState);

  return (
    <form action={action} noValidate>
      <input type="hidden" name="next" value={nextPath} />

      {state.status === "error" && state.message && (
        <p className="notice notice-error" role="alert">
          {state.message}
        </p>
      )}

      <div className="field">
        <label htmlFor="email" className="field-label">
          Email address
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
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
        {state.fieldErrors?.email && (
          <p
            id="email-error"
            className="field-hint text-burgundy"
            role="alert"
          >
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div className="field">
        <div className="mb-[0.45rem] flex items-baseline justify-between gap-4">
          <label htmlFor="password" className="field-label mb-0">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-[0.8125rem] text-ink-70 underline decoration-rule-strong underline-offset-4 hover:text-pine"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          required
          maxLength={200}
          autoComplete="current-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
        />
        {state.fieldErrors?.password && (
          <p
            id="password-error"
            className="field-hint text-burgundy"
            role="alert"
          >
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      <div className="mt-6">
        <LoginButton />
      </div>
    </form>
  );
}
