"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  updateFullName,
  updateProfilePassword,
  type NameState,
  type ProfilePasswordState,
} from "@/app/portal/profile/actions";

const initialNameState: NameState = { status: "idle" };
const initialPasswordState: ProfilePasswordState = { status: "idle" };

function SaveNameButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Saving…" : "Save name"}
    </button>
  );
}

function SavePasswordButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Updating…" : "Update password"}
    </button>
  );
}

function Notice({
  status,
  message,
}: {
  status: "idle" | "ok" | "error";
  message?: string;
}) {
  if (!message) return null;
  return (
    <p
      className={`notice ${status === "ok" ? "notice-ok" : "notice-error"}`}
      role={status === "error" ? "alert" : "status"}
    >
      {message}
    </p>
  );
}

export default function PortalProfileForms({
  currentName,
}: {
  currentName: string;
}) {
  const [nameState, nameAction] = useActionState(
    updateFullName,
    initialNameState,
  );
  const [passwordState, passwordAction] = useActionState(
    updateProfilePassword,
    initialPasswordState,
  );
  const passwordFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (passwordState.status === "ok") passwordFormRef.current?.reset();
  }, [passwordState.status]);

  return (
    <div className="grid items-start gap-6 md:grid-cols-2">
      <section className="card" aria-labelledby="name-heading">
        <span className="eyebrow eyebrow-pine mb-2">Identity</span>
        <h2 id="name-heading" className="display-s mb-5 text-ink">
          Full name
        </h2>
        <form action={nameAction} noValidate>
          <Notice status={nameState.status} message={nameState.message} />
          <div className="field">
            <label htmlFor="fullName" className="field-label">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              className="input"
              required
              minLength={2}
              maxLength={120}
              defaultValue={currentName}
              autoComplete="name"
              aria-invalid={Boolean(nameState.fieldError)}
              aria-describedby={nameState.fieldError ? "full-name-error" : undefined}
            />
            {nameState.fieldError && (
              <p
                id="full-name-error"
                className="field-hint text-burgundy"
                role="alert"
              >
                {nameState.fieldError}
              </p>
            )}
          </div>
          <div className="mt-6">
            <SaveNameButton />
          </div>
        </form>
      </section>

      <section className="card" aria-labelledby="password-heading">
        <span className="eyebrow eyebrow-pine mb-2">Security</span>
        <h2 id="password-heading" className="display-s mb-5 text-ink">
          Password
        </h2>
        <form ref={passwordFormRef} action={passwordAction} noValidate>
          <Notice
            status={passwordState.status}
            message={passwordState.message}
          />
          <div className="field">
            <label htmlFor="profile-password" className="field-label">
              New password
            </label>
            <input
              id="profile-password"
              name="password"
              type="password"
              className="input"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              aria-invalid={Boolean(passwordState.fieldErrors?.password)}
              aria-describedby="profile-password-hint"
            />
            <p
              id="profile-password-hint"
              className={`field-hint ${passwordState.fieldErrors?.password ? "text-burgundy" : ""}`}
            >
              {passwordState.fieldErrors?.password ?? "At least 8 characters."}
            </p>
          </div>
          <div className="field">
            <label htmlFor="profile-password-confirm" className="field-label">
              Confirm new password
            </label>
            <input
              id="profile-password-confirm"
              name="confirmPassword"
              type="password"
              className="input"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              aria-invalid={Boolean(
                passwordState.fieldErrors?.confirmPassword,
              )}
              aria-describedby={
                passwordState.fieldErrors?.confirmPassword
                  ? "profile-password-confirm-error"
                  : undefined
              }
            />
            {passwordState.fieldErrors?.confirmPassword && (
              <p
                id="profile-password-confirm-error"
                className="field-hint text-burgundy"
                role="alert"
              >
                {passwordState.fieldErrors.confirmPassword}
              </p>
            )}
          </div>
          <div className="mt-6">
            <SavePasswordButton />
          </div>
        </form>
      </section>
    </div>
  );
}
