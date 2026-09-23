"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { submitDiscoveryLead, type LeadState } from "@/app/(marketing)/contact/actions";
import Arrow from "./Arrow";
import styles from "./discovery-audit-flow.module.css";

const goals = ["Give my team time back", "Connect our systems", "Explore where AI could help", "Find the right starting point"];
const sizes = ["Just me", "2–10 people", "11–50 people", "51–200 people", "201+ people"];
const headings = ["What would you like to improve?", "How big is your team?", "What slows you down?", "Where can we reach you?"];
const descriptions = [
  "Choose your main priority. We’ll explore the possibilities together.",
  "A little context helps us shape an audit around your business.",
  "Think of a task you repeat, a manual handover, or a system that gets in the way.",
  "We’ll reply within one working day to discuss your discovery audit.",
];
const initial: LeadState = { status: "idle" };

export default function DiscoveryAuditFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [team, setTeam] = useState("");
  const [draft, setDraft] = useState({ message: "", name: "", email: "", company: "" });
  const [error, setError] = useState("");
  const [state, action, pending] = useActionState(submitDiscoveryLead, initial);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const scrollY = window.scrollY;
    const previous = { position: document.body.style.position, top: document.body.style.top, width: document.body.style.width };
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    dialog.showModal();
    headingRef.current?.focus();
    return () => {
      dialog.close();
      Object.assign(document.body.style, previous);
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      contentRef.current?.scrollTo({ top: 0 });
      headingRef.current?.focus();
    }
  }, [step, open, state]);

  function next() {
    if ((step === 0 && !goal) || (step === 1 && !team)) {
      setError(step === 0 ? "Choose a priority to continue." : "Choose your team size to continue.");
      return;
    }
    setError("");
    setStep(step + 1);
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.sheet}
      aria-labelledby={`${id}-heading`}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className={styles.panel}>
        <div className={styles.handle} aria-hidden="true" />
        <header className={styles.header}>
          <span>Discovery audit</span>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close discovery audit">×</button>
        </header>
        {state.status === "ok" ? (
          <div className={styles.success} role="status">
            <span className={styles.successMark} aria-hidden="true">✓</span>
            <p className={styles.eyebrow}>Your next step is in motion</p>
            <h2 id={`${id}-heading`} ref={headingRef} tabIndex={-1}>Thank you.<br />We’re listening.</h2>
            <p>Your enquiry has reached us. We’ll review what you’ve shared and reply within one working day to arrange a first conversation.</p>
            <div className={styles.note}>Together, we’ll clarify where an audit could help and what it would involve.</div>
            <button className={styles.primary} type="button" onClick={onClose}>Back to exploring <Arrow /></button>
          </div>
        ) : (
          <form
            ref={formRef}
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              if (pending) return;
              if (step < 3) { next(); return; }
              if (!formRef.current?.reportValidity()) return;
              const data = new FormData(formRef.current);
              data.set("employees", team);
              data.set("message", `Discovery audit\nPriority: ${goal}\nTeam: ${team}\n\nWorkflow / context: ${draft.message.trim() || "I’d like help identifying where to start."}`);
              startTransition(() => action(data));
            }}
          >
            <div className={styles.progress}>
              <div className={styles.progressLabel}><span>Step {step + 1} of 4</span><span>{step === 3 ? "One last introduction" : "About 2 minutes"}</span></div>
              <div className={styles.track} role="progressbar" aria-label="Discovery audit progress" aria-valuemin={0} aria-valuemax={4} aria-valuenow={step + 1}>
                {[0, 1, 2, 3].map((part) => <span key={part} data-complete={part <= step} />)}
              </div>
            </div>
            <div className={styles.content} ref={contentRef}>
              <div key={step} className={styles.step}>
                <h2 id={`${id}-heading`} ref={headingRef} tabIndex={-1}>{headings[step]}</h2>
                <p className={styles.description}>{descriptions[step]}</p>
                {step < 2 && (
                  <fieldset className={styles.options} aria-describedby={error ? `${id}-error` : undefined}>
                    <legend className="sr-only">{headings[step]}</legend>
                    {(step === 0 ? goals : sizes).map((option) => (
                      <label key={option} className={styles.option}>
                        <input type="radio" name={step === 0 ? "priority" : "team"} value={option} checked={(step === 0 ? goal : team) === option} onChange={() => { (step === 0 ? setGoal : setTeam)(option); setError(""); }} />
                        <span>{option}</span><span className={styles.radio} aria-hidden="true" />
                      </label>
                    ))}
                  </fieldset>
                )}
                {step === 2 && (
                  <div className={styles.fields}>
                    <label htmlFor={`${id}-message`}>A little about your day <span>(optional)</span></label>
                    <textarea id={`${id}-message`} rows={5} maxLength={3000} value={draft.message} onChange={(event) => setDraft({ ...draft, message: event.target.value })} placeholder="We copy orders from emails into a spreadsheet, then chase updates across three different tools…" />
                    <p className={styles.hint}>A sentence or two is plenty. Not sure yet? You can skip this.</p>
                    <div className={styles.note}>You don’t need a technical brief. Finding the right opportunities is part of the audit.</div>
                  </div>
                )}
                {step === 3 && (
                  <div className={styles.fields}>
                    <div className={styles.summary}><span>Your starting point</span><p>{goal} · {team}</p></div>
                    {(["name", "email", "company"] as const).map((key) => (
                      <div key={key}>
                        <label htmlFor={`${id}-${key}`}>{key === "name" ? "Your name" : key === "email" ? "Email address" : "Company"}{key === "company" && <span> (optional)</span>}</label>
                        <input id={`${id}-${key}`} name={key} type={key === "email" ? "email" : "text"} autoComplete={key === "company" ? "organization" : key} required={key !== "company"} maxLength={key === "name" ? 120 : key === "email" ? 200 : 160} value={draft[key]} disabled={pending} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} aria-invalid={!!state.fieldErrors?.[key]} aria-describedby={state.fieldErrors?.[key] ? `${id}-${key}-error` : undefined} />
                        {state.fieldErrors?.[key] && <p className={styles.error} id={`${id}-${key}-error`}>{state.fieldErrors[key]}</p>}
                      </div>
                    ))}
                    <p className={styles.hint}>Your details are only used to respond to this enquiry. No mailing lists.</p>
                  </div>
                )}
                {error && <p className={styles.error} id={`${id}-error`} role="alert">{error}</p>}
                {step === 3 && state.status === "error" && <p className={styles.error} role="alert">{state.message}</p>}
              </div>
            </div>
            <div className={styles.honeypot} aria-hidden="true"><label htmlFor={`${id}-website`}>Website</label><input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" /></div>
            <footer className={styles.footer}>
              <div className={styles.actions}>
                {step > 0 && <button className={styles.back} type="button" disabled={pending} onClick={() => { setError(""); setStep(step - 1); }}>← Back</button>}
                <button className={styles.primary} type="submit" disabled={pending}>{pending ? "Sending…" : step === 3 ? "Request my audit" : step === 2 && !draft.message.trim() ? "Skip for now" : "Continue"}<Arrow /></button>
              </div>
              <p>{step === 3 ? "An enquiry, with no commitment to proceed." : "A clearer starting point for your business."}</p>
            </footer>
          </form>
        )}
      </div>
    </dialog>
  );
}
