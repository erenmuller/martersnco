"use client";

import { useEffect } from "react";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[portal]", error);
  }, [error]);

  return (
    <section className="card max-w-[38rem]" aria-labelledby="portal-error-heading">
      <span className="eyebrow mb-3 text-burgundy">Portal unavailable</span>
      <h1 id="portal-error-heading" className="display-m text-ink">
        We could not load this page.
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
        Your account data has not been changed. Try loading the page again; if
        the problem continues, contact Marters &amp; Co.
      </p>
      <button type="button" className="btn btn-primary mt-6" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
