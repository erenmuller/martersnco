import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import {
  serviceGroups,
  journey,
  commitments,
  inspectionSpec,
  work,
  reading,
  readingTotals,
} from "@/lib/content";
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

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteSchema} />

      {/* ---------------------------------------------------------------- */}
      {/* Hero — the firm sells a measurement, so the hero is one. The bar  */}
      {/* is a real inspection result, not an illustration of the idea.     */}
      {/* ---------------------------------------------------------------- */}
      <section className="page section section-flush pb-16 pt-14 md:pb-20 md:pt-[4.5rem]">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-14">
          <div>
            <p className="text-[0.875rem] text-ink-45">
              Licensed in the Dubai International Financial Centre
            </p>

            <h1 className="display-xl mt-5">
              We look inside your business before we automate any of it.
            </h1>

            <p className="lede mt-6">
              Every engagement starts with an inspection: we follow real work
              through your company and time it. Only then do we say where AI
              and automation belong — and where they do not.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link href="/contact" className="btn btn-primary">
                Book a free inspection
              </Link>
              <Link href="/approach" className="link-rule">
                How we work
              </Link>
            </div>

            <div className="offer mt-11">
              <span className="offer-tag">No fee</span>
              <p className="offer-text m-0">
                The inspection and the AI potential audit cost nothing. We are
                a new firm, and we would rather show you the work than describe
                it.
              </p>
            </div>
          </div>

          {/* The reading. Cell widths come from the measured minutes, so the
              picture cannot drift out of step with the totals below it. */}
          <figure className="reading m-0 lg:self-center">
            <figcaption className="reading-head">
              <span className="reading-title">{reading.process}</span>
              <span className="reading-note">
                Illustrative — {readingTotals.steps} steps,{" "}
                {readingTotals.handoffs} handoffs
              </span>
            </figcaption>

            <div className="reading-body">
              <div
                className="bar"
                role="img"
                aria-label={`One supplier invoice measured end to end: ${readingTotals.touchLabel} of touch time inside ${readingTotals.elapsedLabel} of elapsed time.`}
              >
                {reading.steps.map((step, index) => (
                  <span
                    key={step.label}
                    className="bar-cell"
                    data-kind={step.kind}
                    title={`${step.label} — ${step.minutes} min`}
                    style={{
                      flex: `${step.minutes} 0 0%`,
                      animationDelay: `${180 + index * 55}ms`,
                    }}
                  />
                ))}
              </div>

              <div className="bar-scale" aria-hidden="true">
                <span>Invoice arrives</span>
                <span>Approved, {readingTotals.elapsedLabel} later</span>
              </div>

              <p className="bar-key m-0" aria-hidden="true">
                <span>
                  <i data-kind="touch" />
                  Someone is working on it
                </span>
                <span>
                  <i data-kind="wait" />
                  It is sitting in a queue
                </span>
              </p>

              <dl className="reading-totals">
                <div>
                  <dd className="reading-figure m-0">
                    {readingTotals.touchLabel}
                  </dd>
                  <dt className="reading-key">
                    Touch time — what your staff are paid for
                  </dt>
                </div>
                <div>
                  <dd className="reading-figure m-0" data-quiet="true">
                    {readingTotals.elapsedLabel}
                  </dd>
                  <dt className="reading-key">
                    Elapsed time — what your supplier waits through
                  </dt>
                </div>
              </dl>

              <p className="mt-5 border-t border-rule pt-4 text-[0.875rem] leading-relaxed text-ink-70">
                {readingTotals.waitingShare}% of that is waiting. The longest
                single wait is{" "}
                <span className="mono text-ink">
                  {readingTotals.longestWaitLabel}
                </span>{" "}
                in the approver queue — and no automation can shorten it until
                someone has measured it.
              </p>
            </div>
          </figure>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The inspection — stated as a record card.                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">The inspection</span>
          </div>
          <div>
            <h2 className="display-l max-w-[20ch]">
              Two weeks. One process. Every step timed.
            </h2>
            <p className="lede mt-5">You leave with three things.</p>

            <dl className="spec mt-9">
              {inspectionSpec.map((row) => (
                <div
                  key={row.key}
                  className="spec-row"
                  data-accent={row.accent ? "true" : undefined}
                >
                  <dt className="spec-key">{row.key}</dt>
                  <dd className="spec-value">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Selected work — the proof, as a ledger.                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">Selected work</span>
          </div>

          <div>
            <h2 className="display-l max-w-[24ch]">
              Seven builds, and what each one gave back.
            </h2>
            <p className="prose-block mt-6 max-w-[56ch]">
              The same method every time: measure the process, automate what
              repeats, leave the judgement calls with your people.
            </p>

            <ul className="mt-10 list-none border-t border-ink p-0">
              {work.map((item) => (
                <li key={item.ref} className="work-row">
                  <div>
                    <h3 className="display-s">{item.title}</h3>
                    <p className="mt-1.5 max-w-[58ch] text-[0.9375rem] leading-relaxed text-ink-70">
                      {item.body}
                    </p>
                  </div>
                  <div className="work-return">
                    <span className="work-figure">{item.figure}</span>
                    <span className="work-unit">{item.unit}</span>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-6 max-w-[58ch] text-[0.8125rem] leading-relaxed text-ink-45">
              Roughly 300 staff hours returned each month across these seven.
              Client names withheld by agreement.
            </p>
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
                      <h3 className="display-s">{stage.title}</h3>
                      <p className="mt-1.5 max-w-[56ch] text-[0.9375rem] leading-relaxed text-ink-70">
                        {stage.body}
                      </p>
                    </div>
                    <span className="stage-output">{stage.output}</span>
                  </li>
                );
              })}
            </ol>

            <Link href="/approach" className="link-rule mt-9 inline-block">
              The full method
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

            <dl className="mt-10 grid gap-x-12 gap-y-9 sm:grid-cols-2">
              {commitments.map((c) => (
                <div key={c.title} className="border-t border-ink pt-4">
                  <dt className="display-m">{c.title}</dt>
                  <dd className="m-0 mt-3 max-w-[42ch] text-[0.9375rem] leading-relaxed text-ink-70">
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

            <ul className="mt-10 list-none border-t border-ink p-0">
              {serviceGroups.map((group) => (
                <li key={group.slug} className="border-b border-rule">
                  <Link
                    href={`/services#${group.slug}`}
                    className="group flex items-baseline justify-between gap-6 py-4 transition-colors"
                  >
                    <span className="display-s transition-colors group-hover:text-pine">
                      {group.title}
                    </span>
                    <span className="shrink-0 text-[0.8125rem] text-ink-45 transition-colors group-hover:text-pine">
                      {group.services.length} services
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Close — the one dark plate on the page.                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="plate border-t border-rule">
        <div className="page py-16 md:py-24">
          <div className="max-w-[44rem]">
            <h2 className="display-l">
              Send us one process that annoys you.
            </h2>
            <p className="mt-5 max-w-[52ch] leading-relaxed text-[rgba(226,232,226,0.74)]">
              Describe it in a paragraph. We will reply with what we would
              measure, what the inspection would cover, and whether we think
              there is anything worth automating in it at all.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
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
              <a href={`mailto:${site.email}`} className="link-rule">
                {site.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
