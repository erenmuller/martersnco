import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { site } from "@/lib/site";
import ProcessDiscoveryPrompt from "./ProcessDiscoveryPrompt";

export const metadata: Metadata = {
  title: "AI & automation consultancy for SMEs",
  description:
    "Find where AI and automation can save staff time, reduce manual errors and improve how work gets done. Start with a practical Discovery Audit from Marters & Co.",
  alternates: { canonical: "/" },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
  publisher: { "@id": site.url + "/#organisation" },
};

const auditDeliverables = [
  {
    number: "01",
    title: "A map of the work",
    body: "The real steps, handoffs, systems, delays and failure points in the processes we review.",
  },
  {
    number: "02",
    title: "A ranked opportunity list",
    body: "Where automation, AI or a simpler process change could make a measurable difference.",
  },
  {
    number: "03",
    title: "The business case",
    body: "Estimated hours returned, errors avoided, implementation effort and risk for each opportunity.",
  },
  {
    number: "04",
    title: "A practical roadmap",
    body: "What to do first, what can wait and what should not be automated at all.",
  },
];

const signals = [
  "The same information is copied between systems",
  "Reports take hours to assemble every week or month",
  "Important work lives in inboxes, spreadsheets or WhatsApp",
  "Errors are found late and corrected by hand",
  "Your team is busy, but too much time goes to admin",
];

const buildTypes = [
  {
    title: "Workflow automation",
    body: "Connect the tools you already use and remove repetitive data entry, checking, routing and reporting.",
    examples: "Finance · Operations · Sales · HR",
  },
  {
    title: "AI-assisted operations",
    body: "Use AI where information needs to be read, classified, summarised or turned into a useful first draft.",
    examples: "Documents · Email · Support · Knowledge",
  },
  {
    title: "Custom internal software",
    body: "Build focused tools around the way your company works when off-the-shelf products do not fit.",
    examples: "Portals · Dashboards · Planning · Integrations",
  },
];

const caseStudies = [
  {
    ref: "01",
    area: "Finance",
    title: "Sales reconciliation",
    before:
      "The accounts team manually matched every sale to its invoice and investigated differences one by one.",
    build:
      "An automated reconciliation workflow that matches clean transactions and sends only exceptions for review.",
    figure: "100h",
    unit: "returned each month",
  },
  {
    ref: "02",
    area: "Planning",
    title: "Purchase forecasting",
    before:
      "Purchase decisions relied on manually assembled sales files and repeated spreadsheet work.",
    build:
      "A planning tool that turns daily sales data into forecasts and recommended purchase quantities.",
    figure: "100–150h",
    unit: "returned each month",
  },
  {
    ref: "03",
    area: "Operations",
    title: "Marketplace orders into ERP",
    before:
      "Orders from several marketplaces were re-keyed into the ERP, creating delays and avoidable input errors.",
    build:
      "A direct workflow that validates, prices, codes and posts each order into the ERP automatically.",
    figure: "40–50h",
    unit: "returned each month",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteSchema} />

      <section className="home-hero section-flush">
        <div className="page py-14 md:py-20 lg:py-24">
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:gap-16">
            <div>
              <span className="eyebrow eyebrow-pine">
                AI &amp; automation consultancy for SMEs
              </span>

              <h1 className="display-xl mt-6 max-w-[13ch]">
                Find the work AI should do{" "}
                <span className="text-pine">before you pay to build it.</span>
              </h1>

              <p className="lede mt-7 max-w-[58ch]">
                We help small and mid-sized businesses find where AI and
                automation can save staff time, reduce manual errors and make
                the working day run better. When the case is strong, we build
                the software too.
              </p>

              <div className="mt-9">
                <ProcessDiscoveryPrompt />
              </div>

              <p className="mt-7 text-[0.8125rem] leading-relaxed text-ink-45">
                Dubai-based · DIFC licensed · Working with SMEs across the UAE
                and GCC
              </p>
            </div>

            <aside
              className="audit-card lg:mt-10"
              aria-label="Discovery Audit overview"
            >
              <div className="audit-card-head">
                <span className="audit-kicker">Start here</span>
                <span className="audit-duration">2–3 weeks</span>
                <h2 className="mt-8 font-display text-[clamp(1.85rem,3vw,2.45rem)] leading-[1.08] tracking-[-0.018em] text-white">
                  The Discovery Audit
                </h2>
                <p className="mt-4 max-w-[38ch] text-[0.9375rem] leading-relaxed text-white/70">
                  A clear, commercially grounded plan for where AI and
                  automation belong in your business.
                </p>
              </div>

              <dl className="audit-card-list">
                <div>
                  <dt>We study</dt>
                  <dd>Real workflows, tools, handoffs and pain points</dd>
                </div>
                <div>
                  <dt>We measure</dt>
                  <dd>Staff time, volume, error rate, delay and risk</dd>
                </div>
                <div>
                  <dt>You receive</dt>
                  <dd>A prioritised roadmap and business case</dd>
                </div>
              </dl>

              <p className="audit-card-note">
                Fixed scope. Fixed fee. Yours to keep—with no obligation to
                build with us.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="outcome-band" aria-label="The outcomes we target">
        <div className="page">
          <dl className="grid md:grid-cols-3">
            <div>
              <dt>Hours back</dt>
              <dd>Less repetitive admin. More capacity for useful work.</dd>
            </div>
            <div>
              <dt>Fewer errors</dt>
              <dd>Less re-keying, missed information and manual checking.</dd>
            </div>
            <div>
              <dt>Clear priorities</dt>
              <dd>A business case for what to build—and what to leave alone.</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="page section">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-20">
          <div>
            <span className="eyebrow">A better starting point</span>
            <h2 className="display-l mt-6 max-w-[18ch]">
              AI is not the strategy. Better work is.
            </h2>
            <p className="prose-block mt-6 max-w-[50ch]">
              Most SMEs do not need an “AI transformation.” They need to know
              which recurring work is costing the team time, where mistakes
              enter the process and which improvements are worth paying for.
            </p>
          </div>

          <ol className="decision-path m-0 list-none p-0">
            <li>
              <span>01</span>
              <div>
                <h3>Find the friction</h3>
                <p>
                  We speak with the people doing the work and follow the real
                  process—not the version in a policy document.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Size the opportunity</h3>
                <p>
                  We quantify frequency, time, error rate, complexity and risk
                  so each idea has a credible business case.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Choose the right response</h3>
                <p>
                  Sometimes the answer is automation. Sometimes it is AI, a
                  process fix—or leaving a judgement call with a person.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section id="discovery-audit" className="discovery-section scroll-mt-24">
        <div className="page py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.62fr)] lg:gap-20">
            <div>
              <span className="eyebrow">Our primary engagement</span>
              <h2 className="display-l mt-6 max-w-[21ch]">
                Your practical AI roadmap, based on how work actually gets
                done.
              </h2>
              <p className="mt-6 max-w-[58ch] text-[1.0625rem] leading-relaxed text-ink-70">
                The Discovery Audit is a focused piece of consulting, not a
                generic workshop. We examine a small number of high-friction
                workflows and turn what we find into decisions your leadership
                team can act on.
              </p>

              <ol className="audit-deliverables mt-11 grid list-none gap-px p-0 sm:grid-cols-2">
                {auditDeliverables.map((item) => (
                  <li key={item.number}>
                    <span>{item.number}</span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </li>
                ))}
              </ol>
            </div>

            <aside className="fit-card">
              <span className="eyebrow eyebrow-pine">It may be time if…</span>
              <ul className="m-0 mt-6 list-none p-0">
                {signals.map((signal) => (
                  <li key={signal}>
                    <span aria-hidden="true">✓</span>
                    {signal}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="btn btn-primary mt-8 w-full">
                Discuss a Discovery Audit
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="page section">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
          <div>
            <span className="eyebrow">When the case is clear</span>
            <h2 className="display-l mt-6 max-w-[17ch]">
              From roadmap to working software.
            </h2>
            <p className="prose-block mt-6 max-w-[48ch]">
              The audit stands on its own. If you ask us to implement it, the
              same people who studied the process design and build the solution
              with your team.
            </p>
            <Link href="/services" className="link-rule mt-7">
              Explore our build capabilities
            </Link>
          </div>

          <div className="build-list">
            {buildTypes.map((item) => (
              <article key={item.title}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
                <span>{item.examples}</span>
              </article>
            ))}
            <p className="ownership-note">
              You own the source, accounts and documentation. We can support
              what we build, but nothing switches off if you leave.
            </p>
          </div>
        </div>
      </section>

      <section className="case-section">
        <div className="page py-16 md:py-24">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12">
            <div>
              <span className="eyebrow">Selected outcomes</span>
              <h2 className="display-l mt-6 max-w-[20ch]">
                Less manual work. Results you can count.
              </h2>
            </div>
            <p className="max-w-[35rem] text-[0.9375rem] leading-relaxed text-ink-70 md:pb-1">
              A few examples of systems delivered by our team. Client names
              are withheld by agreement; the problem, build and measured
              result are not.
            </p>
          </div>

          <div className="case-grid mt-12">
            {caseStudies.map((study) => (
              <article key={study.ref} className="case-card">
                <div className="case-card-head">
                  <span>{study.ref}</span>
                  <span>{study.area}</span>
                </div>
                <h3>{study.title}</h3>

                <dl>
                  <div>
                    <dt>Before</dt>
                    <dd>{study.before}</dd>
                  </div>
                  <div>
                    <dt>What we built</dt>
                    <dd>{study.build}</dd>
                  </div>
                </dl>

                <div className="case-result">
                  <strong>{study.figure}</strong>
                  <span>{study.unit}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="portfolio-result">
            <span>Across seven delivered workflows</span>
            <strong>≈300 staff hours returned every month</strong>
          </div>
        </div>
      </section>

      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">How we work</span>
          </div>
          <div>
            <h2 className="display-l max-w-[21ch]">
              Small team. Straight answers. Measured results.
            </h2>
            <div className="mt-10 grid gap-px bg-rule md:grid-cols-3">
              <article className="bg-bone p-6 md:p-7">
                <span className="mono text-[0.75rem] text-pine">01 / AUDIT</span>
                <h3 className="display-s mt-5">Find the right work</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
                  Map the process, quantify the opportunity and agree what
                  success will mean before a build begins.
                </p>
              </article>
              <article className="bg-bone p-6 md:p-7">
                <span className="mono text-[0.75rem] text-pine">02 / BUILD</span>
                <h3 className="display-s mt-5">Prove it in real work</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
                  Run the new workflow beside the old one until the outputs
                  agree and the team trusts it.
                </p>
              </article>
              <article className="bg-bone p-6 md:p-7">
                <span className="mono text-[0.75rem] text-pine">03 / MEASURE</span>
                <h3 className="display-s mt-5">Count what changed</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
                  Re-measure the same process after launch: hours returned,
                  errors reduced and work completed faster.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="plate border-t border-rule">
        <div className="page py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-16">
            <div>
              <span className="eyebrow">A useful first conversation</span>
              <h2 className="display-l mt-6 max-w-[20ch]">
                Tell us which part of the business feels harder than it should.
              </h2>
              <p className="mt-5 max-w-[54ch] leading-relaxed text-[rgba(226,232,226,0.74)]">
                You do not need to arrive with an AI idea. Bring us a process
                that is slow, repetitive or error-prone and we will help you
                decide whether it is worth investigating.
              </p>
            </div>
            <div className="md:text-right">
              <Link
                href="/contact"
                className="btn"
                style={{
                  background: "var(--color-bone)",
                  color: "var(--color-ink)",
                  borderColor: "var(--color-bone)",
                }}
              >
                Book a free discovery call
              </Link>
              <a
                href={"mailto:" + site.email}
                className="mt-4 block text-[0.8125rem] text-white/60 hover:text-white"
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
