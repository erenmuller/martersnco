import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Arrow from "@/components/Arrow";
import { site } from "@/lib/site";
import SelectedWork from "./SelectedWork";
import ContactForm from "./contact/ContactForm";
import WorkflowDemo from "./WorkflowDemo";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Boutique AI consultancy & implementation in Dubai",
  description: site.description,
  alternates: { canonical: "/" },
};

const services = [
  {
    title: "“There must be a better way.”",
    label: "Find your starting point",
    body: "Too much admin, too many ideas? We find where AI can make a useful difference and give you a clear plan.",
    link: "/services#identify",
    cta: "Explore AI discovery",
    colour: "peach",
    art: "discover",
  },
  {
    title: "“Can these tools just talk?”",
    label: "Make the everyday easier",
    body: "We connect your systems and build AI workflows and custom software around the way your business works.",
    link: "/services#implement",
    cta: "Explore implementation",
    colour: "lavender",
    art: "connect",
  },
  {
    title: "“Help us actually use AI.”",
    label: "Bring your people with you",
    body: "Practical workshops, thoughtful handovers and ongoing support. Give your team the confidence to make it their own.",
    link: "/services#people",
    cta: "Explore team enablement",
    colour: "yellow",
    art: "people",
  },
];
const steps = [
  {
    title: "First, we listen.",
    body: "We follow the work, meet your people and find the friction. A fixed-fee Discovery Audit turns the possibilities into a practical business case.",
    outcome: "A prioritised roadmap, yours to keep.",
    icon: "↗",
  },
  {
    title: "Then, we build together.",
    body: "We start with a useful workflow, connect it to your tools and test it with your team. You see the progress and help shape the details.",
    outcome: "Working software, tested in your business.",
    icon: "✳",
  },
  {
    title: "And we stay close.",
    body: "We train your people, document how it works and measure the difference. You own the source, the accounts and the knowledge.",
    outcome: "A confident team. Full ownership.",
    icon: "✓",
  },
];

export default function HomePage() {
  return (
    <div className={styles.home}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: site.url,
          publisher: { "@id": site.url + "/#organisation" },
        }}
      />
      <section className={styles.hero} aria-labelledby="home-heading">
        <div className={`page ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <span className={styles.dot} /> Your AI & automation partner ·
              Dubai
            </span>
            <h1 id="home-heading">
              Less busywork.
              <br />
              More{" "}
              <span>
                possibility.
                <svg viewBox="0 0 420 20" fill="none" aria-hidden="true">
                  <path
                    d="M4 14C106 1 292 1 415 10M28 18C156 8 281 9 379 15"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p>
              Give your people time for the work that matters. We help growing
              businesses put AI and automation to work — with clear advice,
              tailored builds and a human touch.
            </p>
            <div className={styles.actions}>
              <a href="#start-a-conversation" className="btn btn-primary">
                Let’s find your opportunity <Arrow diagonal />
              </a>
              <a href="#what-we-do" className={styles.quietLink}>
                Find your starting point <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className={styles.heroNote}>
              <span aria-hidden="true">✳</span> Small team. Direct access. Built
              around you.
            </div>
          </div>
          <WorkflowDemo />
        </div>
        <div className={`page ${styles.credentials}`}>
          <span>Good technology starts with understanding people.</span>
          <div>
            <span>✓ DIFC licensed</span>
            <span>Dubai · UAE & GCC</span>
            <span>Independent by design</span>
          </div>
        </div>
      </section>

      <section
        className={`page ${styles.section}`}
        id="what-we-do"
        aria-labelledby="services-heading"
      >
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>01 / Sound familiar?</span>
            <h2 id="services-heading">
              A little less friction.
              <br />
              <span>A whole lot of potential.</span>
            </h2>
          </div>
          <p>
            You don’t need to have AI figured out.
            <br />
            Start with what you’d like to make better.
          </p>
        </div>
        <div className={styles.serviceGrid}>
          {services.map((service, i) => (
            <Link
              className={styles.serviceCard}
              data-colour={service.colour}
              href={service.link}
              key={service.link}
            >
              <div
                className={styles.serviceArt}
                data-art={service.art}
                aria-hidden="true"
              >
                {i === 0 ? (
                  <>
                    <span className={styles.paperNote}>Spreadsheets</span>
                    <span className={styles.paperNote}>Follow-ups</span>
                    <span className={styles.paperNote}>
                      One clear plan <span>↗</span>
                    </span>
                    <span className={styles.artSpark}>✳</span>
                  </>
                ) : i === 1 ? (
                  <>
                    <span className={styles.toolTile}>Your tools</span>
                    <span className={styles.connectLine} />
                    <span className={styles.hub}>✳</span>
                    <span className={styles.connectLine} />
                    <span className={styles.toolTile}>
                      In sync <span>✓</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className={styles.chatBubble}>
                      Could AI help with this?
                    </span>
                    <span className={styles.chatBubble}>
                      Let’s try it together. <span>✳</span>
                    </span>
                    <span className={styles.peopleDots}>
                      <i />
                      <i />
                      <i />
                    </span>
                  </>
                )}
              </div>
              <div className={styles.serviceBody}>
                <span className={styles.cardLabel}>{service.label}</span>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
                <span className={styles.cardLink}>
                  {service.cta}
                  <Arrow diagonal />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className={styles.secondOpinion} id="second-opinion">
          <span aria-hidden="true">↳</span>
          <p>
            <strong>Already tried AI, but it’s not quite working?</strong> Let’s
            take a fresh look at what you have.
          </p>
          <a href="#start-a-conversation">
            Get a second opinion <Arrow diagonal />
          </a>
        </div>
      </section>

      <section
        className={styles.workSection}
        id="our-work"
        aria-labelledby="work-heading"
      >
        <div className={`page ${styles.section}`}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>
                02 / A difference you can see
              </span>
              <h2 id="work-heading">
                Real work.
                <br />
                <span>Better working days.</span>
              </h2>
            </div>
            <p>
              A few systems delivered by our team. Real workflows, practical
              outcomes. Client names are private by agreement.
            </p>
          </div>
          <SelectedWork />
          <div className={styles.workLink}>
            <span>Wondering what this could look like for your team?</span>
            <Link href="/past-work" className={styles.quietLink}>
              Explore all 10 examples <Arrow diagonal />
            </Link>
          </div>
        </div>
      </section>

      <section
        className={styles.journey}
        id="discovery-audit"
        aria-labelledby="journey-heading"
      >
        <div className={`page ${styles.section}`}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>
                03 / People first. All the way through.
              </span>
              <h2 id="journey-heading">
                Big on possibility.
                <br />
                <span>Personal by design.</span>
              </h2>
            </div>
            <p>
              The people you meet are the people who build. A small team,
              working closely with yours from the first conversation onwards.
            </p>
          </div>
          <ol className={styles.steps}>
            {steps.map((step, i) => (
              <li key={step.title}>
                <div className={styles.stepTop}>
                  <span className={styles.stepIcon} aria-hidden="true">
                    {step.icon}
                  </span>
                  <span>0{i + 1}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <div className={styles.outcome}>
                  <span aria-hidden="true">↳</span>
                  {step.outcome}
                </div>
              </li>
            ))}
          </ol>
          <div className={styles.discoveryNote}>
            <p>
              <strong>A clear first step: the Discovery Audit.</strong>
              <span>
                2–3 weeks. Fixed scope, fixed fee. No obligation to build with
                us.
              </span>
            </p>
            <Link href="/approach">
              See how we work <Arrow diagonal />
            </Link>
          </div>
        </div>
      </section>

      <section
        className={`page ${styles.faqSection}`}
        aria-labelledby="faq-heading"
      >
        <div>
          <span className={styles.eyebrow}>
            A few things you might be wondering
          </span>
          <h2 id="faq-heading">Let’s make it clearer.</h2>
          <Link href="/about" className={styles.quietLink}>
            Get to know the firm <Arrow diagonal />
          </Link>
        </div>
        <div className={styles.faqList}>
          <details>
            <summary>
              Do we need to know what we want to build?
              <span aria-hidden="true">+</span>
            </summary>
            <p>
              No. Start with a task that takes too long, a problem you keep
              running into, or an idea. We’ll help you decide where to focus and
              whether AI is the right fit.
            </p>
          </details>
          <details>
            <summary>
              Can you work with the tools we already use?
              <span aria-hidden="true">+</span>
            </summary>
            <p>
              That’s where we start. We assess your existing systems and how
              your team uses them, then recommend the integrations or changes
              that make practical sense.
            </p>
          </details>
          <details>
            <summary>
              What if we’ve already invested in AI?
              <span aria-hidden="true">+</span>
            </summary>
            <p>
              We can review what’s there, listen to your team and give you an
              honest second opinion. Sometimes a few thoughtful changes are all
              it takes; if more is needed, we’ll explain why.
            </p>
          </details>
        </div>
      </section>

      <section
        className={styles.contactSection}
        id="start-a-conversation"
        aria-labelledby="contact-heading"
      >
        <div className={`page ${styles.contactGrid}`}>
          <div className={styles.contactCopy}>
            <span className={styles.contactSpark} aria-hidden="true">
              ✳
            </span>
            <span className={styles.eyebrow}>
              04 / Your next chapter starts here
            </span>
            <h2 id="contact-heading">
              What would make
              <br />
              your day <span>better?</span>
            </h2>
            <p>
              A time-consuming process. An idea you haven’t explored. A sense
              that things could work better. We’d love to hear it.
            </p>
            <div className={styles.contactPromise}>
              <span aria-hidden="true">↗</span>
              <p>
                <strong>A conversation, with a person.</strong>
                <br />
                The first conversation is free.
                <br />
                We’ll reply within one working day.
              </p>
            </div>
            <a href={`mailto:${site.email}`} className={styles.quietLink}>
              Prefer email? Say hello <Arrow diagonal />
            </a>
          </div>
          <ContactForm source="home" />
        </div>
      </section>
    </div>
  );
}
