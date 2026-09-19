import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Arrow from "@/components/Arrow";
import { faqs } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import {
  NextConversation,
  PageIntro,
  SectionTitle,
} from "../_components/Editorial";
import s from "../_components/editorial.module.css";

export const metadata: Metadata = pageMetadata({
  title: "How we work — Discover, build, embed",
  description:
    "How an automation project with Marters & Co. runs: a fixed-fee Discovery Audit, one workflow built and tested alongside your current process, then training and full handover.",
  path: "/approach",
});
const phases = [
  {
    title: "Discover.",
    timing: "Discovery Audit · 2–3 weeks",
    body: "We observe daily work, speak to your staff and assess where automation will help.",
    output: "A process map, business case and prioritised plan.",
  },
  {
    title: "Build.",
    timing: "One workflow at a time",
    body: "We connect the new system to your tools and run it alongside the old process until the results match.",
    output: "Working software, tested with your team.",
  },
  {
    title: "Embed.",
    timing: "Handover & optional support",
    body: "We train your staff, write simple instructions and measure the results. You own the software and accounts.",
    output: "A confident team. Full ownership.",
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
            Three stages.
            <br />
            <span>One team.</span>
          </>
        }
        visual={
          <aside className={s.conversationNote}>
            <span className="studio-label">Before the project</span>
            <h2>
              Start with a conversation.
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
        The people you meet in the first conversation are the people who build your system.
      </PageIntro>
      <div className="page">
        <nav className={s.jumpNav} aria-label="Approach sections">
          <span>One team, from the first conversation onwards.</span>
          <div>
            <a href="#the-process">
              <span>01</span> The process
            </a>
            <a href="#questions">
              <span>02</span> Questions
            </a>
          </div>
        </nav>
      </div>

      <section className="page studio-section" id="the-process">
        <SectionTitle
          label="01 / Your path through an engagement"
          title={
            <>
              Discover. Build. Embed.

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

      <section className="page studio-section" id="questions">
        <div className={s.split}>
          <div className={s.sectionCopy}>
            <span className="studio-label">03 / Before we begin</span>
            <h2>
              Common questions.
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
        Tell us which task takes the most time. No brief needed.
      </NextConversation>
    </>
  );
}
