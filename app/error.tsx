"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app:error]", error);
  }, [error]);

  return (
    <main className="page flex min-h-[70vh] items-center py-20">
      <div className="max-w-[42rem]">
        <span className="eyebrow" style={{ color: "var(--color-burgundy)" }}>
          Something went wrong
        </span>
        <h1 className="display-l mt-5">This page could not be loaded.</h1>
        <p className="lede mt-5">
          Try the request once more. If it keeps failing, contact us and include
          the reference shown below.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <button type="button" className="btn btn-primary" onClick={reset}>
            Try again
          </button>
          {error.digest && (
            <span className="mono text-[0.75rem] text-ink-45">
              Reference {error.digest}
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
