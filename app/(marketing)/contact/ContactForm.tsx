"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { site } from "@/lib/site";
import { submitLead, type LeadState } from "./actions";

const initial: LeadState = { status: "idle" };

const sizes = [
  "Under 20",
  "20–50",
  "50–150",
  "150–500",
  "Over 500",
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Sending…" : "Send"}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(submitLead, initial);

  if (state.status === "ok") {
    return (
      <div className="card" role="status">
        <span className="eyebrow eyebrow-pine mb-3">Received</span>
        <h2 className="display-s text-ink">Thank you — that has reached us.</h2>
        <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink-70">
          We reply to everything within one working day, usually with a
          question or two before anything else. If it is urgent, email{" "}
          <a
            href={`mailto:${site.email}`}
            className="mono text-ink underline decoration-rule-strong underline-offset-4"
          >
            {site.email}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate>
      {state.status === "error" && state.message && (
        <p className="notice notice-error" role="alert">
          {state.message}
        </p>
      )}

      {/* Honeypot — hidden from people, catches naive bots. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-x-5 sm:grid-cols-2">
        <div className="field">
          <label className="field-label" htmlFor="name">
            Your name
          </label>
          <input
            id="name"
            name="name"
            className="input"
            required
            maxLength={120}
            autoComplete="name"
            aria-invalid={!!state.fieldErrors?.name}
            aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
          />
          {state.fieldErrors?.name && (
            <p id="name-error" className="field-hint" style={{ color: "var(--color-burgundy)" }}>
              {state.fieldErrors.name}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            required
            maxLength={200}
            autoComplete="email"
            aria-invalid={!!state.fieldErrors?.email}
            aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          />
          {state.fieldErrors?.email && (
            <p id="email-error" className="field-hint" style={{ color: "var(--color-burgundy)" }}>
              {state.fieldErrors.email}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="company">
            Company <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="company"
            name="company"
            className="input"
            maxLength={160}
            autoComplete="organization"
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="employees">
            Staff <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <select id="employees" name="employees" className="select" defaultValue="">
            <option value="">Prefer not to say</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="message">
          The process that annoys you
        </label>
        <textarea
          id="message"
          name="message"
          className="textarea"
          required
          minLength={20}
          maxLength={4000}
          placeholder="What happens today, who touches it, and roughly how often it runs."
          aria-invalid={!!state.fieldErrors?.message}
          aria-describedby={
            state.fieldErrors?.message ? "message-error" : "message-hint"
          }
        />
        {state.fieldErrors?.message ? (
          <p id="message-error" className="field-hint" style={{ color: "var(--color-burgundy)" }}>
            {state.fieldErrors.message}
          </p>
        ) : (
          <p id="message-hint" className="field-hint">
            A paragraph is plenty. We will ask the rest.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-5">
        <SubmitButton />
        <p className="max-w-[34ch] text-[0.8125rem] leading-snug text-ink-45">
          We use this to reply to you and nothing else. No list, no sequence.
        </p>
      </div>
    </form>
  );
}
