import type { Metadata } from "next";
import Link from "next/link";
import ProcessTrace from "@/components/ProcessTrace";
import JsonLd from "@/components/JsonLd";
import { serviceGroups, journey, commitments } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
  publisher: { "@id": `${site.url}/#organisation` },
};

/**
 * Placeholder motif for the hero frame — a column of measure lines in the
 * same visual language as the trace. Fixed heights so server and client
 * render the same thing.
 */
const scanBars = [
  18, 34, 27, 52, 41, 66, 38, 74, 49, 88, 57, 71, 44, 92, 63, 79, 51, 68, 36,
  59, 47, 83, 55, 40, 29,
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteSchema} />

      {/* ---------------------------------------------------------------- */}
      {/* Hero — the thesis is the inspection, so it leads.                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="page section section-flush pb-16 pt-14 md:pb-20 md:pt-20">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <span
              className="eyebrow eyebrow-pine rise"
              style={{ animationDelay: "0ms" }}
            >
              DIFC licensed · Dubai · Established {site.founded}
            </span>

            <h1 className="display-xl rise mt-6" style={{ animationDelay: "70ms" }}>
              We look inside your business before we automate any of it.
            </h1>

            <p className="lede rise mt-6" style={{ animationDelay: "150ms" }}>
              Every engagement starts with an inspection: we follow real work
              through your company and time it. Only then do we say where AI
              and automation belong — and where they do not.
            </p>

            <div
              className="rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5"
              style={{ animationDelay: "230ms" }}
            >
              <Link href="/contact" className="btn btn-primary">
                Book a free inspection
              </Link>
              <Link href="/approach" className="link-rule">
                How we work
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="offer rise mt-10" style={{ animationDelay: "310ms" }}>
              <span className="offer-tag">No fee</span>
              <p className="offer-text m-0">
                The inspection and AI potential audit cost nothing. We are a new
                firm, and we would rather show you the work than describe it.
              </p>
            </div>
          </div>

          {/* Picture slot. To use a photograph, drop the file in /public and
              replace the .scan div with:
                <Image src="/hero.jpg" alt="…" fill sizes="(max-width: 64rem) 100vw, 34rem" />
              importing Image from "next/image". Everything else stays. */}
          <figure
            className="frame rise lg:mt-1"
            style={{ animationDelay: "390ms" }}
          >
            <div className="frame-body">
              <div className="scan" aria-hidden="true">
                {scanBars.map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <figcaption className="frame-caption">
              <span>Fig. 1 — Inspection</span>
              <span>Dubai</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The inspection — the signature, and the thing we are actually     */}
      {/* selling. It sits directly under the claim that makes it.          */}
      {/* ---------------------------------------------------------------- */}
      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">The inspection</span>
          </div>
          <div>
            <h2 className="display-l max-w-[22ch]">
              This is what an inspection hands you.
            </h2>
            <p className="prose-block mb-10 mt-6 max-w-[58ch]">
              We follow one real job from end to end and time every step,
              handoff and wait. Two numbers matter and they are not the same:{" "}
              <strong>touch time</strong> is what your staff are paid for,{" "}
              <strong>elapsed time</strong> is what your customer or supplier
              waits through.
            </p>
            <ProcessTrace />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The journey — genuinely sequential, and the markers carry cost.   */}
      {/* ---------------------------------------------------------------- */}
      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">The journey</span>
          </div>

          <div>
            <h2 className="display-l max-w-[24ch]">
              Five stages. You can stop after any of them.
            </h2>

            <ol className="mt-10 list-none border-b border-rule p-0">
              {journey.map((stage) => {
                const free = stage.marker === "No fee";
                return (
                  <li key={stage.title} className="stage">
                    <span className="stage-marker" data-free={free}>
                      {stage.marker}
                    </span>
                    <div>
                      <h3 className="display-s text-ink">{stage.title}</h3>
                      <p className="mt-2 max-w-[56ch] text-[0.9375rem] leading-relaxed text-ink-70">
                        {stage.body}
                      </p>
                    </div>
                    <span className="stage-output">{stage.output}</span>
                  </li>
                );
              })}
            </ol>

            <Link href="/approach" className="link-rule mt-9 inline-flex">
              The full method
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* What we hold ourselves to                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">Our guarantee</span>
          </div>

          <div>
            <h2 className="display-l max-w-[22ch]">
              Two numbers we are willing to be held to.
            </h2>
            <p className="prose-block mt-6 max-w-[58ch]">
              A guarantee is only worth something if it is measurable, and the
              inspection is what makes these measurable. We recorded your
              starting numbers, so there is no argument later about what they
              were.
            </p>

            <dl className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
              {commitments.map((c) => (
                <div key={c.title}>
                  <span className="eyebrow eyebrow-pine">{c.figure}</span>
                  <dt className="display-s mt-3 text-ink">{c.title}</dt>
                  <dd className="m-0 mt-3 border-t border-rule pt-3 text-[0.9375rem] leading-relaxed text-ink-70">
                    {c.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* What we build — terse, because the detail lives on /services.     */}
      {/* ---------------------------------------------------------------- */}
      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">What we build</span>
          </div>

          <div>
            <h2 className="display-l max-w-[26ch]">
              Custom tools for your process, looked after by us.
            </h2>
            <p className="prose-block mt-6 max-w-[58ch]">
              Not a product you have to bend the business around. We build for
              the process we measured, keep it running, and hand you the source
              and the accounts so nothing switches off if you leave.
            </p>

            <ul className="mt-10 list-none border-t border-rule p-0">
              {serviceGroups.map((group) => (
                <li key={group.slug} className="border-b border-rule">
                  <Link
                    href={`/services#${group.slug}`}
                    className="group flex items-baseline justify-between gap-6 py-5 transition-colors"
                  >
                    <span className="display-s text-ink transition-colors group-hover:text-pine">
                      {group.title}
                    </span>
                    <span
                      className="mono shrink-0 text-[0.6875rem] uppercase tracking-[0.1em] text-ink-45 transition-colors group-hover:text-pine"
                      aria-hidden="true"
                    >
                      {group.services.length} →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Close                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-rule bg-ink text-bone">
        <div className="page py-16 md:py-24">
          <div className="max-w-[46rem]">
            <span className="eyebrow" style={{ color: "rgba(245,243,237,0.55)" }}>
              Start here
            </span>
            <h2 className="display-l mt-5" style={{ color: "var(--color-bone)" }}>
              Send us one process that annoys you.
            </h2>
            <p
              className="mt-5 max-w-[52ch] leading-relaxed"
              style={{ color: "rgba(245,243,237,0.72)" }}
            >
              Describe it in a paragraph. We will reply with what we would
              measure, what the inspection would cover, and whether we think
              there is anything worth automating in it at all.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Link
                href="/contact"
                className="btn"
                style={{
                  background: "var(--color-bone)",
                  color: "var(--color-ink)",
                  borderColor: "var(--color-bone)",
                }}
              >
                Book a free inspection
              </Link>
              <a
                href={`mailto:${site.email}`}
                className="mono text-[0.8125rem] underline decoration-1 underline-offset-4"
                style={{ color: "rgba(245,243,237,0.72)" }}
              >
                {site.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
