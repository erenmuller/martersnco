"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin:error-boundary]", error);
  }, [error]);

  return (
    <section className="card mx-auto max-w-[42rem]" role="alert">
      <span className="eyebrow" style={{ color: "var(--color-burgundy)" }}>
        Admin error
      </span>
      <h1 className="display-m mt-3">This view could not be loaded.</h1>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-70">
        No change has been retried automatically. Try the request again; if it repeats, check the server log
        {error.digest ? ` using reference ${error.digest}` : ""}.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
        <a href="/admin" className="btn btn-secondary">
          Admin overview
        </a>
      </div>
    </section>
  );
}
