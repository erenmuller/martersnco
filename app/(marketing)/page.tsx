import type { Metadata } from "next";
import Link from "next/link";
import ProcessTrace from "@/components/ProcessTrace";
import JsonLd from "@/components/JsonLd";
import { serviceGroups, phases, principles } from "@/lib/content";
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
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="page section section-flush pb-14 pt-16 md:pb-16 md:pt-24">
        <div className="max-w-[54rem]">
          <span className="eyebrow eyebrow-pine rise" style={{ animationDelay: "0ms" }}>
            DIFC licensed · Dubai · Established {site.founded}
          </span>

          <h1
            className="display-xl rise mt-6"
            style={{ animationDelay: "70ms" }}
          >
            Automation that survives contact with your business.
          </h1>

          <p className="lede rise mt-7" style={{ animationDelay: "150ms" }}>
            A boutique implementation partner for small and mid-sized companies.
            We measure how work actually moves through your business, build the
            automation around what we find, and train the people who will run
            it.
          </p>

          <div
            className="rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5"
            style={{ animationDelay: "230ms" }}
          >
            <Link href="/contact" className="btn btn-primary">
              Book an assessment
            </Link>
            <Link href="/approach" className="link-rule">
              How we work
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Signature: the trace                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="page pb-16 pt-0 md:pb-24">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">What we{" "}find</span>
          </div>
          <div>
            <p className="prose-block mb-10 max-w-[52ch] text-[1.0625rem]">
              Every engagement starts the same way — we follow one real job from
              end to end and time it. This is what that produces. Two numbers
              matter and they are not the same: <strong>touch time</strong> is
              what your staff are paid for, <strong>elapsed time</strong> is
              what your supplier waits through.
            </p>
            <ProcessTrace />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Services                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">Services</span>
          </div>

          <div>
            <h2 className="display-l max-w-[20ch]">
              Five things, done properly.
            </h2>

            <ul className="mt-10 list-none border-t border-rule p-0">
              {serviceGroups.map((group) => (
                <li key={group.slug} className="border-b border-rule">
                  <Link
                    href={`/services#${group.slug}`}
                    className="group grid grid-cols-1 items-baseline gap-2 py-6 transition-colors sm:grid-cols-[1fr_auto] sm:gap-8"
                  >
                    <div>
                      <h3 className="display-s text-ink transition-colors group-hover:text-pine">
                        {group.title}
                      </h3>
                      <p className="mt-2 max-w-[58ch] text-[0.9375rem] leading-relaxed text-ink-70">
                        {group.intro}
                      </p>
                    </div>
                    <span
                      className="mono shrink-0 text-[0.6875rem] uppercase tracking-[0.1em] text-ink-45 transition-colors group-hover:text-pine"
                      aria-hidden="true"
                    >
                      {group.services.length} services →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Approach — genuinely sequential, so the markers carry duration.   */}
      {/* ---------------------------------------------------------------- */}
      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">Approach</span>
          </div>

          <div>
            <h2 className="display-l max-w-[24ch]">
              We measure first. Everything else follows from that.
            </h2>

            <ol className="mt-10 grid list-none gap-px border border-rule bg-rule p-0 sm:grid-cols-2 lg:grid-cols-4">
              {phases.map((phase) => (
                <li key={phase.title} className="flex flex-col bg-bone p-5">
                  <span className="mono text-[0.6875rem] uppercase tracking-[0.12em] text-pine">
                    {phase.marker}
                  </span>
                  <h3 className="display-s mt-3 text-ink">{phase.title}</h3>
                  <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-ink-70">
                    {phase.body}
                  </p>
                  <span className="mono mt-5 border-t border-rule pt-3 text-[0.6875rem] text-ink-45">
                    {phase.output}
                  </span>
                </li>
              ))}
            </ol>

            <Link href="/approach" className="link-rule mt-8 inline-flex">
              The full method
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The honest bit                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">The firm</span>
          </div>

          <div>
            <h2 className="display-l max-w-[22ch]">
              We opened in {site.founded}. Here is what that means.
            </h2>

            <p className="prose-block mt-6 max-w-[58ch] text-[1.0625rem]">
              We are a new firm and would rather say so than imply a track
              record we have not earned yet. What we can offer instead is a
              first engagement that is small, fixed in price, and useful on its
              own: the process audit is a finished piece of work whether or not
              you build anything with us afterwards.
            </p>

            <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {principles.map((p) => (
                <div key={p.title}>
                  <dt className="border-t border-ink pt-3 text-[0.9375rem] font-semibold leading-snug text-ink">
                    {p.title}
                  </dt>
                  <dd className="m-0 mt-2 text-[0.9375rem] leading-relaxed text-ink-70">
                    {p.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Close                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-rule bg-ink text-bone">
        <div className="page py-16 md:py-24">
          <div className="max-w-[46rem]">
            <span
              className="eyebrow"
              style={{ color: "rgba(245,243,237,0.55)" }}
            >
              Start here
            </span>
            <h2
              className="display-l mt-5"
              style={{ color: "var(--color-bone)" }}
            >
              Send us one process that annoys you.
            </h2>
            <p
              className="mt-5 max-w-[52ch] text-[1.0625rem] leading-relaxed"
              style={{ color: "rgba(245,243,237,0.72)" }}
            >
              Describe it in a paragraph. We will reply with what we would
              measure, roughly what an audit of it would cost, and whether we
              think it is worth doing at all.
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
                Book an assessment
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
