"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  traceBefore,
  traceAfter,
  touchTime,
  elapsedTime,
  formatMinutes,
  type TraceStep,
} from "@/lib/content";

const beforeElapsed = elapsedTime(traceBefore);
const afterElapsed = elapsedTime(traceAfter);
const beforeTouch = touchTime(traceBefore);
const afterTouch = touchTime(traceAfter);

/** Both rows share one time axis, so the lengths are honestly comparable. */
const afterScale = (afterElapsed / beforeElapsed) * 100;

interface RowProps {
  label: string;
  steps: TraceStep[];
  widthPct: number;
  touch: number;
  elapsed: number;
  handoffs: number;
  revealed: boolean;
  delayMs: number;
  onInspect: (step: TraceStep | null) => void;
}

function TraceRow({
  label,
  steps,
  widthPct,
  touch,
  elapsed,
  handoffs,
  revealed,
  delayMs,
  onInspect,
}: RowProps) {
  return (
    <div className="trace-row">
      <div className="trace-head">
        <span className="eyebrow" style={{ color: "var(--color-ink)" }}>
          {label}
        </span>
        <span className="mono text-[0.6875rem] text-ink-45">
          {steps.length} steps · {handoffs}{" "}
          {handoffs === 1 ? "handoff" : "handoffs"}
        </span>
      </div>

      <div
        className="trace-bar"
        style={{
          width: `${widthPct}%`,
          minWidth: widthPct < 12 ? "3.5rem" : undefined,
          clipPath: revealed ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
          transition: "clip-path 900ms cubic-bezier(0.22, 0.61, 0.36, 1)",
          transitionDelay: `${delayMs}ms`,
        }}
      >
        {steps.map((step, i) => (
          <button
            key={i}
            type="button"
            className="trace-step"
            data-kind={step.kind}
            style={{ flexGrow: step.minutes, flexBasis: 0 }}
            onMouseEnter={() => onInspect(step)}
            onMouseLeave={() => onInspect(null)}
            onFocus={() => onInspect(step)}
            onBlur={() => onInspect(null)}
            aria-label={`${step.label} — ${formatMinutes(step.minutes)}`}
          />
        ))}
      </div>

      <div
        className="trace-scale"
        style={{
          width: `${widthPct}%`,
          minWidth: "min(11rem, 100%)",
          maxWidth: "100%",
        }}
      >
        <span>
          touch <strong className="text-ink font-medium">{formatMinutes(touch)}</strong>
        </span>
        <span>
          elapsed{" "}
          <strong className="text-ink font-medium">{formatMinutes(elapsed)}</strong>
        </span>
      </div>
    </div>
  );
}

export default function ProcessTrace() {
  const [revealed, setRevealed] = useState(false);
  const [active, setActive] = useState<TraceStep | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const captionId = useId();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const saved = beforeTouch - afterTouch;

  return (
    <figure ref={ref} className="m-0">
      <figcaption className="mb-5 flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-3">
        <span className="eyebrow eyebrow-pine">
          Supplier invoice · arrival to paid
        </span>
        <span className="mono text-[0.6875rem] text-ink-45">Illustrative</span>
      </figcaption>

      <div className="trace">
        <TraceRow
          label="Today"
          steps={traceBefore}
          widthPct={100}
          touch={beforeTouch}
          elapsed={beforeElapsed}
          handoffs={4}
          revealed={revealed}
          delayMs={120}
          onInspect={setActive}
        />
        <TraceRow
          label="After"
          steps={traceAfter}
          widthPct={afterScale}
          touch={afterTouch}
          elapsed={afterElapsed}
          handoffs={1}
          revealed={revealed}
          delayMs={620}
          onInspect={setActive}
        />
      </div>

      {/* Caption region — updates on hover or keyboard focus of any step. */}
      <p
        id={captionId}
        aria-live="polite"
        className="mono mt-5 min-h-[2.4rem] border-t border-rule pt-3 text-[0.75rem] leading-relaxed text-ink-70"
      >
        {active ? (
          <>
            <span className="text-ink">{formatMinutes(active.minutes)}</span>
            {"  "}
            {active.label}
          </>
        ) : (
          <>
            <span className="text-ink">{formatMinutes(saved)} of staff time</span>{" "}
            returned per invoice. At 120 invoices a month, that is{" "}
            <span className="text-ink">
              {Math.round((saved * 120) / 60)} hours
            </span>{" "}
            back.
          </>
        )}
      </p>

      <div className="trace-legend mt-4">
        <span>
          <i
            className="trace-key"
            data-kind="human"
            style={{ background: "var(--color-step)" }}
          />
          person
        </span>
        <span>
          <i
            className="trace-key"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg, transparent 0 4px, var(--color-rule) 4px 5px)",
            }}
          />
          waiting
        </span>
        <span>
          <i
            className="trace-key"
            style={{
              background: "var(--color-pine)",
              borderColor: "var(--color-pine)",
            }}
          />
          automated
        </span>
        <span>
          <i className="trace-key" style={{ borderColor: "var(--color-ink)" }} />
          person, kept on purpose
        </span>
      </div>

      <details className="group mt-6 border-t border-rule pt-4">
        <summary className="mono cursor-pointer list-none text-[0.6875rem] uppercase tracking-[0.12em] text-ink-45 transition-colors hover:text-ink">
          <span className="group-open:hidden">＋ Every step, itemised</span>
          <span className="hidden group-open:inline">− Close</span>
        </summary>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {[
            { title: "Today", steps: traceBefore },
            { title: "After", steps: traceAfter },
          ].map(({ title, steps }) => (
            <div key={title}>
              <span className="eyebrow mb-2">{title}</span>
              <ol className="m-0 list-none p-0">
                {steps.map((s, i) => (
                  <li
                    key={i}
                    className="flex justify-between gap-3 border-b border-rule py-1.5 text-[0.8125rem] last:border-0"
                  >
                    <span className="text-ink-70">{s.label}</span>
                    <span
                      className="mono shrink-0 text-ink-45"
                      style={{
                        color:
                          s.kind === "auto" ? "var(--color-pine)" : undefined,
                      }}
                    >
                      {formatMinutes(s.minutes)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </details>
    </figure>
  );
}
