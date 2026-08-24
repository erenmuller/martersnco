"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createRequest,
  type CreateRequestState,
} from "@/app/portal/requests/actions";

const initialState: CreateRequestState = { status: "idle" };

function RequestButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Filing request…" : "File request"}
    </button>
  );
}

export default function PortalRequestForm() {
  const [state, action] = useActionState(createRequest, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "ok") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={action} noValidate>
      {state.message && (
        <p
          className={`notice ${state.status === "ok" ? "notice-ok" : "notice-error"}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      )}

      <div className="field">
        <label htmlFor="request-subject" className="field-label">
          Subject
        </label>
        <input
          id="request-subject"
          name="subject"
          className="input"
          required
          minLength={3}
          maxLength={200}
          placeholder="A short summary of what you need"
          aria-invalid={Boolean(state.fieldErrors?.subject)}
          aria-describedby={
            state.fieldErrors?.subject ? "request-subject-error" : undefined
          }
        />
        {state.fieldErrors?.subject && (
          <p
            id="request-subject-error"
            className="field-hint text-burgundy"
            role="alert"
          >
            {state.fieldErrors.subject}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="request-priority" className="field-label">
          Priority
        </label>
        <select
          id="request-priority"
          name="priority"
          className="select"
          defaultValue="normal"
          aria-invalid={Boolean(state.fieldErrors?.priority)}
          aria-describedby={
            state.fieldErrors?.priority ? "request-priority-error" : "priority-hint"
          }
        >
          <option value="low">Low — no immediate impact</option>
          <option value="normal">Normal — needs attention</option>
          <option value="high">High — blocking important work</option>
        </select>
        {state.fieldErrors?.priority ? (
          <p
            id="request-priority-error"
            className="field-hint text-burgundy"
            role="alert"
          >
            {state.fieldErrors.priority}
          </p>
        ) : (
          <p id="priority-hint" className="field-hint">
            Choose high only when important work cannot continue.
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="request-body" className="field-label">
          Description
        </label>
        <textarea
          id="request-body"
          name="body"
          className="textarea"
          required
          maxLength={5000}
          placeholder="Include the affected process, what happened, and any timing we should know about."
          aria-invalid={Boolean(state.fieldErrors?.body)}
          aria-describedby={
            state.fieldErrors?.body ? "request-body-error" : "request-body-hint"
          }
        />
        {state.fieldErrors?.body ? (
          <p
            id="request-body-error"
            className="field-hint text-burgundy"
            role="alert"
          >
            {state.fieldErrors.body}
          </p>
        ) : (
          <p id="request-body-hint" className="field-hint">
            Maximum 5000 characters. Do not include passwords or access keys.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <RequestButton />
        <p className="text-[0.8125rem] text-ink-45">
          The request is visible to your organisation and Marters &amp; Co.
        </p>
      </div>
    </form>
  );
}
