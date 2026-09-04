"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  submitProcessLead,
  type LeadState,
} from "./contact/actions";

const initialState: LeadState = { status: "idle" };

const examples = [
  "Monitoring a shared inbox",
  "Entering sales orders",
  "Reconciling invoices",
  "Replying on WhatsApp",
] as const;

function PaperPlane({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 13.2 27 3.4l-8.8 23.2-4.5-8.1-7 5.6 2.5-9.4L3 13.2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
      />
      <path
        d="m9.2 14.7 12.6-7.1-8.1 10.9"
        stroke="var(--color-pine-deep)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PromptSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="prompt-submit"
      disabled={pending}
      aria-label={pending ? "Sending your process" : "Discover this for me"}
    >
      <span>{pending ? "Sending…" : "Discover this for me"}</span>
      <PaperPlane className={pending ? "prompt-button-plane is-sending" : "prompt-button-plane"} />
    </button>
  );
}

export default function ProcessDiscoveryPrompt() {
  const [state, formAction] = useActionState(
    submitProcessLead,
    initialState,
  );
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const detailsVisible = message.trim().length > 0 || state.status === "error";

  if (state.status === "ok") {
    return (
      <div className="process-prompt process-prompt-sent" role="status">
        <div>
          <span className="process-prompt-kicker">Message received</span>
          <h2>Your process is on its way.</h2>
          <p>
            We will read it properly and reply within one working day with a
            useful question or two.
          </p>
        </div>

        <div className="plane-stage" aria-hidden="true">
          <span className="plane-trail plane-trail-one" />
          <span className="plane-trail plane-trail-two" />
          <PaperPlane className="launched-plane" />
        </div>
      </div>
    );
  }

  const applyExample = (example: string) => {
    setMessage(example + ": ");
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  return (
    <div className="process-prompt">
      <div className="process-prompt-title">
        <span className="process-prompt-kicker">A 60-second starting point</span>
        <h2>Which process does your team repeat far too often?</h2>
        <p>
          Tell us what happens and how often. We will help you work out whether
          AI, automation or a simpler process change is worth exploring.
        </p>
      </div>

      <form action={formAction} noValidate>
        {state.status === "error" && state.message && (
          <p className="prompt-error" role="alert">
            {state.message}
          </p>
        )}

        <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
          <label htmlFor="prompt-website">Website</label>
          <input
            id="prompt-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <label className="sr-only" htmlFor="prompt-message">
          The process your team repeats too often
        </label>
        <textarea
          ref={textareaRef}
          id="prompt-message"
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          minLength={20}
          maxLength={4000}
          placeholder="For example: Every morning someone checks three inboxes, copies new orders into the ERP and posts an update to WhatsApp…"
          aria-invalid={!!state.fieldErrors?.message}
          aria-describedby={
            state.fieldErrors?.message
              ? "prompt-message-error"
              : "prompt-message-hint"
          }
        />

        <div className="prompt-under-input">
          <div className="prompt-examples" aria-label="Example processes">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => applyExample(example)}
              >
                {example}
              </button>
            ))}
          </div>
          <span id="prompt-message-hint">
            A sentence or two is plenty.
          </span>
        </div>

        {state.fieldErrors?.message && (
          <p id="prompt-message-error" className="prompt-field-error">
            {state.fieldErrors.message}
          </p>
        )}

        <div
          className="prompt-contact-fields"
          data-visible={detailsVisible ? "true" : "false"}
          aria-hidden={!detailsVisible}
        >
          <p className="prompt-contact-intro">
            Great—where should we send our thoughts?
          </p>
          <div className="prompt-contact-grid">
            <div>
              <label htmlFor="prompt-name">Your name</label>
              <input
                id="prompt-name"
                name="name"
                required
                maxLength={120}
                autoComplete="name"
                tabIndex={detailsVisible ? 0 : -1}
                aria-invalid={!!state.fieldErrors?.name}
              />
              {state.fieldErrors?.name && (
                <p className="prompt-field-error">{state.fieldErrors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="prompt-email">Work email</label>
              <input
                id="prompt-email"
                name="email"
                type="email"
                required
                maxLength={200}
                autoComplete="email"
                tabIndex={detailsVisible ? 0 : -1}
                aria-invalid={!!state.fieldErrors?.email}
              />
              {state.fieldErrors?.email && (
                <p className="prompt-field-error">{state.fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="prompt-company">
                Company <span>(optional)</span>
              </label>
              <input
                id="prompt-company"
                name="company"
                maxLength={160}
                autoComplete="organization"
                tabIndex={detailsVisible ? 0 : -1}
              />
            </div>
          </div>

          <div className="prompt-send-row">
            <PromptSubmitButton />
            <p>
              We only use these details to reply. No mailing list or automated
              sequence.
            </p>
          </div>
        </div>
      </form>

      <div className="process-prompt-footer">
        <Link href="/contact">Prefer to talk? Book a discovery call</Link>
        <a href="#discovery-audit">What happens in the audit</a>
      </div>
    </div>
  );
}
