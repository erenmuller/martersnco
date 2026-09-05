import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Arrow from "@/components/Arrow";
import { site } from "@/lib/site";
import IntelligenceVisual from "./IntelligenceVisual";
import SelectedWork from "./SelectedWork";
import ContactForm from "./contact/ContactForm";

export const metadata: Metadata = {
  title: "Boutique AI consultancy & implementation in Dubai",
  description: site.description,
  alternates: { canonical: "/" },
};

const capabilities = [
  {
    number: "01",
    title: "Find your opportunity.",
    label: "AI strategy & discovery",
    body: "A fresh perspective on how your business works. We find the friction, assess where AI can help, and build a clear business case.",
    link: "/services#identify",
    tags: "Process discovery / AI roadmaps / Business cases",
  },
  {
    number: "02",
    title: "Make it work for you.",
    label: "Tailored implementation",
    body: "Thoughtful AI, automation and custom software, built around your people and the tools they already use.",
    link: "/services#implement",
    tags: "AI workflows / Automation / Custom software",
  },
  {
    number: "03",
    title: "Make it second nature.",
    label: "Adoption & ongoing care",
    body: "The handover is a beginning. We help your team build confidence, measure the difference, and keep improving as you grow.",
    link: "/services#people",
    tags: "Team enablement / Support / Optimisation",
  },
];

const signs = [
  [
    "The system doesn’t match how your team works",
    "Old workarounds crept back in, and the tool sits unused more often than not.",
  ],
  [
    "No one can explain what was built, or why",
    "Little documentation, and the person who built it has since moved on.",
  ],
  [
    "You don’t hold the keys",
    "The code, accounts or infrastructure were never handed over, so nothing can change without going back to them.",
  ],
];

const steps = [
  {
    n: "01",
    time: "Start with clarity",
    title: "Understand.",
    body: "We listen to your team and follow the work. A focused, fixed-fee Discovery Audit gives you a prioritised roadmap and a business case.",
    outcome: "Your roadmap. Yours to keep.",
  },
  {
    n: "02",
    time: "Build with intention",
    title: "Implement.",
    body: "We design around your systems, prove the first workflow, and test it alongside the current process before it becomes part of your day.",
    outcome: "Working software. Tested in your business.",
  },
  {
    n: "03",
    time: "Stay close",
    title: "Make it yours.",
    body: "We train your people, document the details, and measure the result. You own the source, the accounts and the knowledge to move forward.",
    outcome: "A confident team. Full ownership.",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: site.url,
          publisher: { "@id": site.url + "/#organisation" },
        }}
      />
      <section className="boutique-hero">
        <div className="page hero-spread">
          <div className="hero-copy">
            <span className="studio-label">
              <span className="status-dot" /> A boutique AI consultancy · Dubai
            </span>
            <h1>
              Intelligence,
              <br />
              <span>made personal.</span>
            </h1>
            <p>
              AI should feel like it belongs in your business.
              <br className="desktop-break" /> We bring the advice, the
              implementation and the care to make that happen.
            </p>
            <div className="hero-actions">
              <Link href="/contact" className="btn btn-primary">
                Let’s talk about your business <Arrow />
              </Link>
              <a href="#our-work" className="text-link">
                See what’s possible <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-footnote">
              <span className="fine-cross" aria-hidden="true">
                +
              </span>{" "}
              Small team. Direct access. Built around you.
            </div>
          </div>
          <IntelligenceVisual />
        </div>
        <div className="page">
          <div className="credentials-line">
            <span>Rooted in Dubai. Built for your business.</span>
            <div>
              <span>DIFC licensed</span>
              <span>UAE &amp; GCC</span>
              <span>Independent by design</span>
            </div>
          </div>
        </div>
      </section>

      <section className="page studio-section" id="what-we-do">
        <div className="section-heading">
          <div>
            <span className="studio-label">01 / What we do</span>
            <h2>
              Big possibilities.
              <br />
              <span>A considered approach.</span>
            </h2>
          </div>
          <p>
            From the first “could we?” to the everyday “how did we work without
            this?” We turn AI’s potential into something useful for your
            business.
          </p>
        </div>
        <div className="capability-grid">
          {capabilities.map((item) => (
            <Link href={item.link} className="capability" key={item.number}>
              <div className="capability-top">
                <span>{item.number}</span>
                <Arrow diagonal />
              </div>
              <span className="capability-label">{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <span className="capability-tags">{item.tags}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="work-section" id="our-work">
        <div className="page studio-section">
          <div className="section-heading">
            <div>
              <span className="studio-label">
                02 / Applied, not hypothetical
              </span>
              <h2>
                Good technology.
                <br />
                <span>A real difference.</span>
              </h2>
            </div>
            <p>
              A few systems delivered by our team. The details below reflect
              real workflows; client names are kept private by agreement.
            </p>
          </div>
          <SelectedWork />
        </div>
      </section>

      <section className="boutique-section">
        <div className="page boutique-spread">
          <div className="boutique-intro">
            <span className="studio-label">03 / The boutique difference</span>
            <h2>
              Your business
              <br />
              is personal.
              <br />
              <span>So is our approach.</span>
            </h2>
            <Link href="/about" className="text-link">
              Meet the way we work <Arrow diagonal />
            </Link>
          </div>
          <div className="boutique-principles">
            <p className="boutique-lede">
              A small firm, on purpose. We work with a few businesses at a time,
              giving each the attention it deserves.
            </p>
            <article>
              <span>01</span>
              <div>
                <h3>The people you meet are the people who build.</h3>
                <p>
                  Direct access to the team doing the work, from the first
                  conversation through implementation.
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Your context comes first.</h3>
                <p>
                  Your systems, your constraints, your way of working. Every
                  recommendation starts there.
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Good advice includes knowing when to stop.</h3>
                <p>
                  We make the business case before the build, and tell you when
                  a simpler change is the better answer.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="page studio-section" id="discovery-audit">
        <div className="section-heading">
          <div>
            <span className="studio-label">04 / A clear path forward</span>
            <h2>
              From a conversation
              <br />
              <span>to a better working day.</span>
            </h2>
          </div>
          <Link href="/approach" className="text-link">
            Our approach in detail <Arrow diagonal />
          </Link>
        </div>
        <ol className="engagement-steps">
          {steps.map((step) => (
            <li key={step.n}>
              <div className="step-marker">
                <span>{step.n}</span>
                <span>{step.time}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <div className="step-outcome">
                <span aria-hidden="true">↳</span>
                {step.outcome}
              </div>
            </li>
          ))}
        </ol>
        <div className="discovery-note">
          <span className="status-dot" />
          <p>
            Start with a Discovery Audit.{" "}
            <span>
              2–3 weeks. Fixed scope, fixed fee. No obligation to build with us.
            </span>
          </p>
          <Link
            href="/services#identify"
            aria-label="Explore the Discovery Audit"
          >
            <Arrow />
          </Link>
        </div>
      </section>

      <section className="page studio-section" id="second-opinion">
        <div className="split-panel">
          <div className="split-copy">
            <span className="studio-label">05 / A second opinion</span>
            <h2>
              Already tried an AI agency?
              <br />
              <span>We’ll help you finish the job.</span>
            </h2>
            <p>
              Not every AI project turns out the way it was promised. A
              stalled build, an automation nobody quite trusts, or a bill for
              work you can’t explain — it happens more often than people
              admit.
            </p>
            <p>
              We start by understanding what’s actually there: the code, the
              decisions behind it, and the gap between what was promised and
              what was delivered. Then we’re straightforward about what’s
              worth keeping, what needs rebuilding, and what it will take to
              finish properly.
            </p>
            <a href="#start-a-conversation" className="text-link">
              Get a second opinion <Arrow diagonal />
            </a>
          </div>
          <ul className="split-signs">
            {signs.map(([title, body], i) => (
              <li key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="enquiry-section" id="start-a-conversation">
        <div className="page enquiry-spread">
          <div className="enquiry-intro">
            <span className="studio-label">06 / Let’s start with you</span>
            <h2>
              Something
              <br />
              on your mind?
            </h2>
            <p>
              A time-consuming process. An idea you haven’t explored. A sense
              that things could work better. We’d love to hear it.
            </p>
            <div className="conversation-promise">
              <span className="promise-icon" aria-hidden="true">
                ↗
              </span>
              <div>
                <strong>A conversation, with a person.</strong>
                <span>
                  We’ll reply within one working day.
                  <br />
                  The first conversation is free.
                </span>
              </div>
            </div>
            <a href={`mailto:${site.email}`} className="text-link">
              Prefer email? <Arrow diagonal />
            </a>
          </div>
          <ContactForm source="home" />
        </div>
      </section>
    </>
  );
}
