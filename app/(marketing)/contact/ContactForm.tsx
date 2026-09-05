"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { site } from "@/lib/site";
import Arrow from "@/components/Arrow";
import { submitLead, submitProcessLead, type LeadState } from "./actions";

const initial: LeadState = { status: "idle" };
const interests = [
  "Save my team time",
  "Put AI to work",
  "Build something bespoke",
  "Find a starting point",
];

export default function ContactForm({
  source = "contact",
}: {
  source?: "home" | "contact";
}) {
  const [state, formAction, pending] = useActionState(
    source === "home" ? submitProcessLead : submitLead,
    initial,
  );
  const [step, setStep] = useState(1);
  const [interest, setInterest] = useState("");
  const [draft, setDraft] = useState({
    message: "",
    name: "",
    email: "",
    company: "",
  });
  const [messageError, setMessageError] = useState("");
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "ok") successRef.current?.focus();
    if (state.status === "error") {
      const nextStep = state.fieldErrors?.message ? 1 : 2;
      setStep(nextStep);
      requestAnimationFrame(() => {
        const invalid = formRef.current?.querySelector<HTMLElement>(
          '[aria-invalid="true"]',
        );
        (
          invalid ??
          formRef.current?.querySelector<HTMLElement>('[role="alert"]')
        )?.focus();
      });
    }
  }, [state]);

  function continueToDetails() {
    if (draft.message.trim().length < 20) {
      setMessageError(
        "Tell us a little more — at least 20 characters is a useful starting point.",
      );
      messageRef.current?.focus();
      return;
    }
    setMessageError("");
    setStep(2);
    requestAnimationFrame(() => nameRef.current?.focus());
  }

  if (state.status === "ok") {
    return (
      <div
        className="conversation-form conversation-success"
        role="status"
        tabIndex={-1}
        ref={successRef}
      >
        <span className="success-mark" aria-hidden="true">
          ✓
        </span>
        <span className="studio-label">A good place to begin</span>
        <h2>
          Thank you.
          <br />
          We’re listening.
        </h2>
        <p>
          Your enquiry has reached us. We’ll read it and reply within one
          working day to arrange a useful first conversation.
        </p>
        <a href={`mailto:${site.email}`} className="text-link">
          {site.email} <Arrow diagonal />
        </a>
      </div>
    );
  }

  const fieldError = (key: "name" | "email" | "company") =>
    state.fieldErrors?.[key];
  const currentMessageError = messageError || state.fieldErrors?.message;

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className="conversation-form"
      onSubmit={(event) => {
        if (step === 1) {
          event.preventDefault();
          continueToDetails();
        }
      }}
    >
      <div className="conversation-progress" aria-label={`Step ${step} of 2`}>
        <span aria-current={step === 1 ? "step" : undefined}>
          <span>{step === 2 ? "✓" : "01"}</span>Your business
        </span>
        <span className="progress-line" aria-hidden="true" />
        <span
          aria-current={step === 2 ? "step" : undefined}
          data-upcoming={step === 1}
        >
          <span>02</span>Your details
        </span>
      </div>
      {state.status === "error" && state.message && (
        <p className="conversation-error" role="alert" tabIndex={-1}>
          {state.message}
        </p>
      )}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input type="hidden" name="employees" value="" />
      <input
        type="hidden"
        name="message"
        value={`${interest ? `Interest: ${interest}\n\n` : ""}${draft.message}`}
      />
      <fieldset
        disabled={pending}
        hidden={step !== 1}
        className="conversation-step"
      >
        <legend className="sr-only">Step 1: Your business</legend>
        <h3>What would you like to make better?</h3>
        <p className="conversation-description">
          You don’t need a brief. Just a place to start.
        </p>
        <div
          className="interest-options"
          role="group"
          aria-label="What you would like help with (optional)"
        >
          {interests.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={interest === item}
              onClick={() => setInterest(interest === item ? "" : item)}
            >
              {item}
              <span aria-hidden="true">{interest === item ? "✓" : "+"}</span>
            </button>
          ))}
        </div>
        <label htmlFor={`${id}-message`}>
          A little about what’s on your mind
        </label>
        <textarea
          ref={messageRef}
          id={`${id}-message`}
          value={draft.message}
          onChange={(event) => {
            setDraft({ ...draft, message: event.target.value });
            setMessageError("");
          }}
          required
          minLength={20}
          maxLength={3900}
          placeholder="We spend hours each week copying data between systems. I’d love to give that time back to the team…"
          aria-invalid={!!currentMessageError}
          aria-describedby={`${id}-message-hint`}
        />
        <p
          id={`${id}-message-hint`}
          className={
            currentMessageError
              ? "conversation-field-error"
              : "conversation-hint"
          }
          role={currentMessageError ? "alert" : undefined}
        >
          {currentMessageError ||
            "A sentence or two is plenty. We’ll work out the details together."}
        </p>
        <div className="conversation-actions">
          <span>About a minute. No commitment.</span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={continueToDetails}
          >
            Continue <Arrow />
          </button>
        </div>
      </fieldset>
      <fieldset
        disabled={pending}
        hidden={step !== 2}
        className="conversation-step"
      >
        <legend className="sr-only">Step 2: Your details</legend>
        <h3>And who are we speaking with?</h3>
        <p className="conversation-description">
          We’ll get back to you within one working day.
        </p>
        <div className="conversation-fields">
          {(["name", "email", "company"] as const).map((key) => (
            <div key={key}>
              <label htmlFor={`${id}-${key}`}>
                {key === "name"
                  ? "Your name"
                  : key === "email"
                    ? "Email address"
                    : "Company"}
                {key === "company" && <span> (optional)</span>}
              </label>
              <input
                ref={key === "name" ? nameRef : undefined}
                id={`${id}-${key}`}
                name={key}
                type={key === "email" ? "email" : "text"}
                required={key !== "company"}
                maxLength={key === "name" ? 120 : key === "email" ? 200 : 160}
                autoComplete={key === "company" ? "organization" : key}
                placeholder={
                  key === "name"
                    ? "Full name"
                    : key === "email"
                      ? "you@company.com"
                      : "Your business"
                }
                value={draft[key]}
                onChange={(event) =>
                  setDraft({ ...draft, [key]: event.target.value })
                }
                aria-invalid={!!fieldError(key)}
                aria-describedby={
                  fieldError(key) ? `${id}-${key}-error` : undefined
                }
              />
              {fieldError(key) && (
                <p
                  id={`${id}-${key}-error`}
                  className="conversation-field-error"
                >
                  {fieldError(key)}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="conversation-actions">
          <button
            type="button"
            className="conversation-back"
            disabled={pending}
            onClick={() => {
              setStep(1);
              requestAnimationFrame(() => messageRef.current?.focus());
            }}
          >
            ← Back
          </button>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Sending your enquiry…" : "Start the conversation"}
            <Arrow />
          </button>
        </div>
        <p className="conversation-hint privacy-note">
          Your details are only used to respond to your enquiry. No mailing
          lists.
        </p>
      </fieldset>
      <div className="conversation-form-footer">
        <span className="status-dot" /> Thoughtfully read. Personally answered.
      </div>
    </form>
  );
}
