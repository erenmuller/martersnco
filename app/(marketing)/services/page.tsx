import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Arrow from "@/components/Arrow";
import { serviceGroups, type ServiceCopy } from "@/lib/content";
import { site } from "@/lib/site";
import {
  NextConversation,
  PageIntro,
  SectionTitle,
} from "../_components/Editorial";
import s from "../_components/editorial.module.css";

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
  itemListElement: serviceGroups
    .flatMap((group) => group.services.map((service) => ({ group, service })))
    .map(({ group, service }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.name,
        description: service.lede,
        serviceType: group.title,
        provider: { "@id": site.url + "/#organisation" },
        areaServed: { "@type": "Country", name: "United Arab Emirates" },
      },
    })),
};

const outputs = [
  [
    "A picture of today",
    "Your workflows mapped, with the handoffs, delays and recurring errors made visible.",
  ],
  [
    "The opportunities worth pursuing",
    "AI, automation and simpler process changes, assessed against effort and return.",
  ],
  [
    "A business case you can use",
    "Estimated time saved, cost, risk and what it would take to make each change.",
  ],
  [
    "Your next steps, in order",
    "A practical roadmap. Yours to take forward with us, in-house or with another team.",
  ],
];

function ServiceDetail({ service }: { service: ServiceCopy }) {
  return (
    <details className={s.serviceDetail}>
      <summary>
        <span>
          <strong>{service.name}</strong>
          <small>{service.lede}</small>
        </span>
        <span className={s.plus} aria-hidden="true">
          +
        </span>
      </summary>
      <div className={s.detailBody}>
        <p>{service.detail}</p>
        <ul>
          {service.deliverables.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <span className={s.duration}>Typical timing · {service.duration}</span>
      </div>
    </details>
  );
}

function ServicesVisual() {
  return (
    <figure className={s.serviceVisual}>
      <svg
        viewBox="0 0 480 360"
        fill="none"
        role="img"
        aria-label="Discover, build and embed: three connected parts of an engagement"
      >
        <circle cx="240" cy="178" r="152" fill="#e7ebdf" />
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse
            key={i}
            cx="240"
            cy="178"
            rx={113 + i * 3.5}
            ry={66 + i * 6}
            transform={`rotate(${i * 15} 240 178)`}
            stroke="#78916d"
            strokeWidth=".6"
            opacity=".55"
          />
        ))}
        <path d="M95 178H385" stroke="#78916d" strokeDasharray="3 6" />
        {[
          { x: 95, n: "01", name: "Discover" },
          { x: 240, n: "02", name: "Build" },
          { x: 385, n: "03", name: "Embed" },
        ].map((item) => (
          <g key={item.n}>
            <circle
              cx={item.x}
              cy="178"
              r="49"
              fill="#f6f5f0"
              stroke="#a8b79f"
            />
            <text
              x={item.x}
              y="169"
              textAnchor="middle"
              fill="#687568"
              fontSize="10"
              fontFamily="monospace"
            >
              {item.n}
            </text>
            <text
              x={item.x}
              y="192"
              textAnchor="middle"
              fill="#315b43"
              fontSize="15"
            >
              {item.name}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        <span>From possibility to part of your day.</span>
        <span>M&amp;Co.</span>
      </figcaption>
    </figure>
  );
}

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={schema} />
      <PageIntro
        label="Services / Built around your business"
        title={
          <>
            Find the potential.
            <br />
            <span>Make it useful.</span>
          </>
        }
        visual={<ServicesVisual />}
        links={
          <>
            <Link href="/contact" className="btn btn-primary">
              Let’s find your starting point <Arrow />
            </Link>
            <a href="#identify" className="text-link">
              Explore our services <span aria-hidden="true">↓</span>
            </a>
          </>
        }
      >
        From a fresh look at how you work to the systems that make your day
        easier. Thoughtful advice, tailored implementation and a team that stays
        close.
      </PageIntro>
      <div className="page">
        <nav className={s.jumpNav} aria-label="Service sections">
          <span>A little clarity at every stage.</span>
          <div>
            <a href="#identify">
              <span>01</span> Discover
            </a>
            <a href="#implement">
              <span>02</span> Build
            </a>
            <a href="#programme">
              <span>03</span> Embed
            </a>
          </div>
        </nav>
      </div>

      <section id="identify" className="page studio-section">
        <div className={s.split}>
          <div className={s.sectionCopy}>
            <span className="studio-label">
              01 / AI strategy &amp; discovery
            </span>
            <h2>
              A clearer picture.
              <br />
              <span>A better place to start.</span>
            </h2>
            <p>
              Our Discovery Audit follows the work through your business. We
              listen to the people doing it, find the friction, and work out
              where a change would make a meaningful difference.
            </p>
            <p>
              You leave with a business case and a prioritised roadmap,
              including what we recommend leaving alone.
            </p>
            <div className={s.terms}>
              <span>2–3 weeks</span>
              <span>Fixed scope, fixed fee</span>
              <span>No obligation to build</span>
            </div>
            <Link href="/contact" className="text-link">
              Discuss a Discovery Audit <Arrow diagonal />
            </Link>
          </div>
          <div className={s.auditSheet}>
            <div className={s.sheetHeader}>
              <span>Discovery Audit / Your takeaways</span>
              <Arrow diagonal />
            </div>
            <ol className={s.outputList}>
              {outputs.map(([title, body], i) => (
                <li key={title}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className={s.sheetNote}>
              ↳ A useful piece of work in its own right.
            </p>
          </div>
        </div>
      </section>

      <section
        className={s.softSection}
        id="implement"
        style={{ scrollMarginTop: "6rem" }}
      >
        <div className="page studio-section">
          <SectionTitle
            label="02 / Tailored implementation"
            title={
              <>
                Designed for your work.
                <br />
                <span>Built to fit right in.</span>
              </>
            }
          >
            We build around your people and the tools you already use, then test
            the new workflow alongside the current process.
          </SectionTitle>
          {[serviceGroups[1], serviceGroups[3]].map((group, i) => (
            <section
              className={s.serviceGroup}
              id={i === 1 ? "enterprise" : undefined}
              key={group.slug}
            >
              <div className={s.groupIntro}>
                <span>
                  {i === 0 ? "Connect the everyday" : "Create what’s missing"}
                </span>
                <h3>{group.title}</h3>
                <p>
                  {i === 0
                    ? "Less copying between systems. Fewer manual handoffs. Information that gets where it needs to go."
                    : "Internal tools, applications and data infrastructure shaped around the way your business actually runs."}
                </p>
              </div>
              <div>
                {group.services.map((service) => (
                  <ServiceDetail key={service.code} service={service} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section
        className={s.darkSection}
        id="programme"
        style={{ scrollMarginTop: "6rem" }}
      >
        <div className="page studio-section">
          <SectionTitle
            label="03 / Adoption & ongoing care"
            title={
              <>
                Working well today.
                <br />
                <span>Ready for what’s next.</span>
              </>
            }
          >
            The handover is a beginning. We help your team find their confidence
            and keep your systems useful as the business changes.
          </SectionTitle>
          <div className={s.supportGrid}>
            {[serviceGroups[4], serviceGroups[2]].map((group, i) => (
              <section
                key={group.slug}
                id={i === 0 ? "people" : undefined}
                className={s.supportColumn}
              >
                <h3>
                  {i === 0
                    ? "Make it second nature."
                    : "Keep making it better."}
                </h3>
                {group.services.map((service) => (
                  <ServiceDetail key={service.code} service={service} />
                ))}
              </section>
            ))}
          </div>
          <p className={s.supportNote}>
            <span aria-hidden="true">↳</span>You own the source, the accounts
            and the documentation. Ongoing support is your choice.
          </p>
        </div>
      </section>

      <section className="page studio-section">
        <SectionTitle
          label="The practical details"
          title={
            <>
              A clear commitment.
              <br />
              <span>At every stage.</span>
            </>
          }
        />
        <div className={s.commercial}>
          <article>
            <span>Discovery Audit</span>
            <h3>A fixed fee.</h3>
            <p>
              Scope and price agreed before we start. Your roadmap is useful
              whether or not we build from it.
            </p>
          </article>
          <article>
            <span>Implementation</span>
            <h3>Quoted per workflow.</h3>
            <p>
              A proposal grounded in discovery, with the work, cost and expected
              outcome made clear.
            </p>
          </article>
          <article>
            <span>Ongoing care</span>
            <h3>A monthly arrangement.</h3>
            <p>
              A defined scope for support and improvements, reviewed as your
              needs change.
            </p>
          </article>
        </div>
      </section>
      <NextConversation
        title={
          <>
            Start with what’s
            <br />
            slowing you down.
          </>
        }
      >
        A repetitive task, a disconnected system, an idea you want to explore.
        You don’t need a brief to start a conversation.
      </NextConversation>
    </>
  );
}
