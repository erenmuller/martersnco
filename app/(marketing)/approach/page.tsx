import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Arrow from "@/components/Arrow";
import { faqs } from "@/lib/content";
import {
  NextConversation,
  PageIntro,
  SectionTitle,
} from "../_components/Editorial";
import s from "../_components/editorial.module.css";

export const metadata: Metadata = {
  title: "Approach",
  description:
    "How Marters & Co. runs an engagement: measure the process, prove one workflow in parallel, build the rest in return order, then hand over ownership with the source.",
  alternates: { canonical: "/approach" },
};
const phases = [
  {
    title: "Understand.",
    timing: "Discovery Audit · 2–3 weeks",
    body: "We sit with your team and follow real work from beginning to end. Together, we find where time is lost, assess the opportunities and agree what is worth pursuing.",
    output: "A measured process map, business case and prioritised roadmap.",
  },
  {
    title: "Prove.",
    timing: "One focused workflow",
    body: "We start with a useful, manageable change. You see it working with real inputs, and we compare the results with your current process before asking anyone to rely on it.",
    output: "A working first workflow, with the results checked.",
  },
  {
    title: "Build.",
    timing: "An agreed implementation plan",
    body: "We deliver the remaining work in order of value. Your team sees progress, tests the details and helps shape the system as it takes form.",
    output: "Tested workflows, ready for everyday use.",
  },
  {
    title: "Make it yours.",
    timing: "Handover & optional ongoing care",
    body: "We train the people using the system and document how it works. Source code, accounts and access are yours. We can stay on to monitor, support and improve it with you.",
    output: "A confident team, clear documentation and full ownership.",
  },
];
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function ApproachPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <PageIntro
        label="How we work / A considered approach"
        title={
          <>
            Good work starts
            <br />
            <span>with listening.</span>
          </>
        }
        visual={
          <aside className={s.conversationNote}>
            <span className="studio-label">Before the project</span>
            <h2>
              A conversation.
              <br />A little clarity.
            </h2>
            <p>
              Tell us how things work today and what you’d like to change. We’ll
              help you decide whether a Discovery Audit is the right next step.
            </p>
            <div>
              <span className="status-dot" />
              The first conversation is free.
            </div>
          </aside>
        }
        links={
          <>
            <Link href="/contact" className="btn btn-primary">
              Start a conversation <Arrow />
            </Link>
            <a href="#the-process" className="text-link">
              Follow the process <span aria-hidden="true">↓</span>
            </a>
          </>
        }
      >
        We get close to your business, prove the value in real work, and help
        your team make it their own. You know what’s happening, why it matters
        and what comes next.
      </PageIntro>
      <div className="page">
        <nav className={s.jumpNav} aria-label="Approach sections">
          <span>One team, from the first conversation onwards.</span>
          <div>
            <a href="#the-process">
              <span>01</span> The process
            </a>
            <a href="#in-practice">
              <span>02</span> In practice
            </a>
            <a href="#questions">
              <span>03</span> Questions
            </a>
          </div>
        </nav>
      </div>

      <section className="page studio-section" id="the-process">
        <SectionTitle
          label="01 / Your path through an engagement"
          title={
            <>
              A clear next step.
              <br />
              <span>Every step of the way.</span>
            </>
          }
        >
          Start with a fixed-fee Discovery Audit. Decide on implementation once
          the opportunities, costs and expected return are clear.
        </SectionTitle>
        <ol className={s.phases}>
          {phases.map((phase, i) => (
            <li className={s.phase} key={phase.title}>
              <div className={s.phaseTitle}>
                <span>0{i + 1}</span>
                <h3>{phase.title}</h3>
              </div>
              <div className={s.phaseBody}>
                <span>{phase.timing}</span>
                <p>{phase.body}</p>
              </div>
              <div className={s.phaseOutcome}>
                <span>What you leave with</span>
                {phase.output}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className={s.darkSection}
        id="in-practice"
        style={{ scrollMarginTop: "6rem" }}
      >
        <div className={`page studio-section ${s.split}`}>
          <div className={s.sectionCopy}>
            <span className="studio-label">02 / Confidence before change</span>
            <h2>
              See it work.
              <br />
              <span>Then make the switch.</span>
            </h2>
            <p>
              We run the new workflow alongside your current process, using the
              same real work. Your team can compare the results and understand
              the differences.
            </p>
            <p>
              We keep both running for a full working cycle. If the outputs
              don’t reconcile, we investigate and fix the new system before
              anything is switched off.
            </p>
          </div>
          <figure className={s.parallelVisual}>
            <figcaption>IN PRACTICE / Running in parallel</figcaption>
            <div className={s.parallelTracks}>
              {["Current process", "New workflow"].map((label) => (
                <div key={label}>
                  <span>{label}</span>
                  <div className={s.track} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              ))}
            </div>
            <div className={s.parallelResult}>
              <strong>Same work. Results checked together.</strong>
              <p>
                A cycle might be a month of invoices or a complete onboarding
                period. We agree what proof looks like for your business.
              </p>
            </div>
          </figure>
        </div>
      </section>

      <section className="page studio-section" id="questions">
        <div className={s.split}>
          <div className={s.sectionCopy}>
            <span className="studio-label">03 / Before we begin</span>
            <h2>
              A few things
              <br />
              <span>you might be wondering.</span>
            </h2>
            <p>
              Costs, systems, data and what it means to work with a small firm.
              Here’s how we think about them.
            </p>
            <Link href="/contact" className="text-link">
              Ask us something else <Arrow diagonal />
            </Link>
          </div>
          <div>
            {faqs.map((f) => (
              <details className={s.faq} key={f.q}>
                <summary>
                  {f.q}
                  <span className={s.plus} aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <NextConversation
        title={
          <>
            Let’s understand
            <br />
            your working day.
          </>
        }
      >
        Tell us where things feel harder than they should. We’ll listen, ask a
        few questions and help you find a sensible next step.
      </NextConversation>
    </>
  );
}
