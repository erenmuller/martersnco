import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { serviceGroups, type ServiceCopy } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI and automation services for SMEs",
  description:
    "Start with a Discovery Audit, then turn the strongest opportunities into workflow automations, AI-assisted operations or custom internal software.",
  alternates: { canonical: "/services" },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Marters & Co. services",
  itemListElement: serviceGroups.flatMap((group, groupIndex) =>
    group.services.map((service, serviceIndex) => ({
      "@type": "ListItem",
      position: groupIndex * 10 + serviceIndex + 1,
      item: {
        "@type": "Service",
        name: service.name,
        description: service.lede,
        serviceType: group.title,
        provider: { "@id": site.url + "/#organisation" },
        areaServed: { "@type": "Country", name: "United Arab Emirates" },
      },
    })),
  ),
};

const [
  discoveryGroup,
  implementationGroup,
  programmeGroup,
  enterpriseGroup,
  peopleGroup,
] = serviceGroups;

const discoveryOutputs = [
  {
    title: "Measured process maps",
    body: "The real steps, systems, handoffs, delays and failure points.",
  },
  {
    title: "Opportunity register",
    body: "Every useful AI, automation and process-improvement candidate.",
  },
  {
    title: "Business cases",
    body: "Estimated hours returned, errors avoided, effort, cost and risk.",
  },
  {
    title: "Prioritised roadmap",
    body: "What to do first, what can wait and what should stay human.",
  },
];

const engagementPath = [
  {
    number: "01",
    title: "Discover",
    body: "Find and quantify the right opportunities.",
    href: "#identify",
  },
  {
    number: "02",
    title: "Build",
    body: "Automate, integrate or create the right tool.",
    href: "#implement",
  },
  {
    number: "03",
    title: "Embed",
    body: "Train the team, monitor and keep improving.",
    href: "#programme",
  },
];

const buildLanes = [
  {
    group: implementationGroup,
    eyebrow: "Workflow delivery",
    title: "Automations and integrations",
    intro:
      "For recurring work that crosses inboxes, spreadsheets and business systems—and should move without being re-keyed.",
  },
  {
    group: enterpriseGroup,
    eyebrow: "Purpose-built systems",
    title: "Custom software and infrastructure",
    intro:
      "For important workflows where off-the-shelf products do not fit and bending the business around them would cost more.",
  },
];

const supportLanes = [
  {
    group: programmeGroup,
    eyebrow: "Operate",
    title: "Keep the system useful",
    intro:
      "Monitoring, small improvements and a team that already understands the workflow underneath the software.",
  },
  {
    group: peopleGroup,
    eyebrow: "Adopt",
    title: "Bring your team with it",
    intro:
      "Hands-on enablement for the people using the new process and clear guidance for the leaders responsible for it.",
  },
];

function ServiceCard({
  service,
  compact = false,
}: {
  service: ServiceCopy;
  compact?: boolean;
}) {
  return (
    <article className={compact ? "service-card service-card-compact" : "service-card"}>
      <div className="service-card-meta">
        <span>{service.code}</span>
        <span>{service.duration}</span>
      </div>

      <h3>{service.name}</h3>
      <p className="service-card-lede">{service.lede}</p>
      {!compact && <p className="service-card-detail">{service.detail}</p>}

      <ul className="service-card-deliverables">
        {service.deliverables.map((deliverable) => (
          <li key={deliverable}>{deliverable}</li>
        ))}
      </ul>
    </article>
  );
}

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={schema} />

      <section className="services-hero">
        <div className="page py-14 md:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(21rem,0.72fr)] lg:gap-20">
            <div>
              <span className="eyebrow eyebrow-pine">Services</span>
              <h1 className="display-xl mt-6 max-w-[13ch]">
                Know where to use AI. Then make it work.
              </h1>
              <p className="lede mt-7 max-w-[57ch]">
                We help SMEs find the work worth improving, make the business
                case and build the automation or software when the numbers
                support it. No transformation theatre. No technology looking
                for a problem.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <Link href="/contact" className="btn btn-primary">
                  Discuss a Discovery Audit
                </Link>
                <a href="#identify" className="link-rule">
                  Start with the audit
                </a>
              </div>
            </div>

            <nav aria-label="Service journey" className="service-sequence">
              <span className="service-sequence-label">
                One sensible sequence
              </span>
              <ol>
                {engagementPath.map((step) => (
                  <li key={step.number}>
                    <a href={step.href}>
                      <span>{step.number}</span>
                      <div>
                        <strong>{step.title}</strong>
                        <p>{step.body}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </ol>
              <p className="service-sequence-note">
                The audit is useful on its own. Continue with us only if the
                roadmap earns the investment.
              </p>
            </nav>
          </div>
        </div>
      </section>

      <section
        id="identify"
        className="discovery-service-section scroll-mt-24"
      >
        <div className="page py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
            <div>
              <span className="eyebrow">01 / Discover</span>
              <p className="mt-7 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-pine">
                Our primary engagement
              </p>
              <h2 className="display-l mt-3 max-w-[15ch]">
                The Discovery Audit
              </h2>
              <p className="mt-6 max-w-[46ch] text-[1rem] leading-relaxed text-ink-70">
                A focused review of the workflows creating the most friction
                in your business. We map how the work runs today, find where AI
                or automation could help and give you a commercially grounded
                order of action.
              </p>

              <dl className="service-terms mt-8">
                <div>
                  <dt>Typical duration</dt>
                  <dd>2–3 weeks</dd>
                </div>
                <div>
                  <dt>Commercial model</dt>
                  <dd>Fixed scope, fixed fee</dd>
                </div>
                <div>
                  <dt>Obligation to build</dt>
                  <dd>None</dd>
                </div>
              </dl>

              <Link href="/contact" className="btn btn-primary mt-9">
                Scope your Discovery Audit
              </Link>
            </div>

            <div className="discovery-service-panel">
              <div className="discovery-service-head">
                <span>What you leave with</span>
                <span>Decision-ready, not a slide deck</span>
              </div>

              <div className="discovery-output-grid">
                {discoveryOutputs.map((output, index) => (
                  <article key={output.title}>
                    <span>0{index + 1}</span>
                    <h3>{output.title}</h3>
                    <p>{output.body}</p>
                  </article>
                ))}
              </div>

              <p className="discovery-service-note">
                Every recommendation is tied to a measurable operational
                outcome: staff hours returned, avoidable errors reduced, work
                completed faster or a combination of the three.
              </p>
            </div>
          </div>

          <div className="discovery-modules">
            {discoveryGroup.services.map((service) => (
              <ServiceCard key={service.code} service={service} compact />
            ))}
          </div>
        </div>
      </section>

      <section id="implement" className="page section scroll-mt-24">
        <div className="services-section-intro">
          <div>
            <span className="eyebrow">02 / Build</span>
            <h2 className="display-l mt-6 max-w-[19ch]">
              Implementation, when the numbers support it.
            </h2>
          </div>
          <p>
            We design around the process we measured, test the new workflow
            beside the old one and put it into service with the people who will
            use it. The aim is a better operation—not simply more software.
          </p>
        </div>

        <div className="service-lanes">
          {buildLanes.map((lane) => (
            <section
              key={lane.group.slug}
              id={lane.group.slug === "implement" ? undefined : lane.group.slug}
              className="service-lane scroll-mt-24"
            >
              <div className="service-lane-intro">
                <span>{lane.eyebrow}</span>
                <h3>{lane.title}</h3>
                <p>{lane.intro}</p>
              </div>
              <div className="service-card-grid">
                {lane.group.services.map((service) => (
                  <ServiceCard key={service.code} service={service} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section id="programme" className="support-services-section scroll-mt-24">
        <div className="page py-16 md:py-24">
          <div className="services-section-intro">
            <div>
              <span className="eyebrow">03 / Embed</span>
              <h2 className="display-l mt-6 max-w-[17ch]">
                Make the change stick.
              </h2>
            </div>
            <p>
              Workflows drift, tools change and teams need confidence in the
              systems they inherit. We stay close enough to keep the operation
              healthy, without making you dependent on us.
            </p>
          </div>

          <div className="support-lanes">
            {supportLanes.map((lane) => (
              <section
                key={lane.group.slug}
                id={lane.group.slug === "programme" ? undefined : lane.group.slug}
                className="support-lane scroll-mt-24"
              >
                <div className="support-lane-head">
                  <span>{lane.eyebrow}</span>
                  <h3>{lane.title}</h3>
                  <p>{lane.intro}</p>
                </div>
                <div className="service-card-grid">
                  {lane.group.services.map((service) => (
                    <ServiceCard key={service.code} service={service} compact />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">Commercial model</span>
          </div>
          <div>
            <h2 className="display-l max-w-[19ch]">
              A clear commitment at each stage.
            </h2>
            <div className="commercial-grid mt-10">
              <article>
                <span>Discovery Audit</span>
                <h3>Fixed fee</h3>
                <p>
                  Scope and price agreed before we begin. The roadmap is yours
                  whether or not we build from it.
                </p>
              </article>
              <article>
                <span>Implementation</span>
                <h3>Quoted per workflow</h3>
                <p>
                  Costed only after discovery, when the systems, risks and
                  expected return are known.
                </p>
              </article>
              <article>
                <span>Ongoing support</span>
                <h3>Monthly, when useful</h3>
                <p>
                  A defined service for monitoring and improvements. Stop when
                  it no longer earns its place.
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
              <span className="eyebrow">Not sure what you need?</span>
              <h2 className="display-l mt-6 max-w-[20ch]">
                Bring us the operational problem, not the solution.
              </h2>
              <p className="mt-5 max-w-[54ch] leading-relaxed text-[rgba(226,232,226,0.74)]">
                Tell us where work is repetitive, slow or error-prone. We will
                help you decide whether it belongs in a Discovery Audit—and say
                plainly if it does not.
              </p>
            </div>
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
          </div>
        </div>
      </section>
    </>
  );
}
