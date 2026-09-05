import type { Metadata } from "next";
import Link from "next/link";
import Arrow from "@/components/Arrow";
import { site } from "@/lib/site";
import { NextConversation, PageIntro } from "../_components/Editorial";
import s from "../_components/editorial.module.css";

export const metadata: Metadata = {
  title: "About",
  description: `${site.legalName} is a boutique AI and automation consultancy licensed in the Dubai International Financial Centre, working with small and mid-sized businesses across the UAE and the Gulf.`,
  alternates: { canonical: "/about" },
};
const principles = [
  [
    "Direct access to the people doing the work.",
    "The team you meet is the team that scopes, builds and hands over your system. Your context stays with the people making the decisions.",
  ],
  [
    "A recommendation has to earn its place.",
    "We measure before we recommend. When a simpler process change is the better answer, that’s what we’ll advise.",
  ],
  [
    "Your systems belong to you.",
    "Source code, accounts, infrastructure and documentation are yours. You keep what we build, whether or not we continue working together.",
  ],
  [
    "A few businesses, given our full attention.",
    "We keep our client list small so we can stay close to the work and the people who depend on it.",
  ],
];
const fit = [
  [
    "A real operational problem",
    "A finance, operations or onboarding workflow that takes more time and effort than it should.",
  ],
  [
    "Someone to work alongside",
    "An internal owner who can give us a few hours a week and bring the right people into the conversation.",
  ],
  [
    "Room for an honest answer",
    "A willingness to explore what is worth changing, including where automation may not be the right fit.",
  ],
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        label="The firm / Dubai, United Arab Emirates"
        title={
          <>
            A small firm.
            <br />
            <span>On purpose.</span>
          </>
        }
        visual={
          <div className={s.firmPlate}>
            <span>Independent by design · Est. {site.founded}</span>
            <span className={s.ampersand} aria-hidden="true">
              &amp;
            </span>
            <div>
              <div className={s.firmName}>Marters &amp; Co.</div>
              <p>
                A boutique AI consultancy.
                <br />
                Rooted in Dubai. Built around you.
              </p>
            </div>
          </div>
        }
        links={
          <>
            <Link href="/contact" className="btn btn-primary">
              Let’s get to know your business <Arrow />
            </Link>
            <a href="#our-commitments" className="text-link">
              What you can expect <span aria-hidden="true">↓</span>
            </a>
          </>
        }
      >
        We’re an independent AI and automation consultancy, working with growing
        businesses across the UAE and the Gulf. A small team, close to the work
        and the people behind it.
      </PageIntro>
      <div className="page">
        <div className={s.jumpNav}>
          <span>
            Marters &amp; Co. / A personal approach to useful technology
          </span>
          <div>
            <a href="#firm-details">
              DIFC licensed <Arrow diagonal />
            </a>
            <a href="#working-together">
              UAE &amp; GCC <Arrow diagonal />
            </a>
          </div>
        </div>
      </div>

      <section className={`page ${s.story}`}>
        <h2>
          Good ideas deserve
          <br />
          someone who sees
          <br />
          them through.
        </h2>
        <div>
          <p>
            Finding a use for AI is only the beginning. The real work is making
            it fit: the systems you already have, the exceptions your team knows
            by heart, and the busy day that doesn’t pause for a new tool.
          </p>
          <p>
            That’s why we bring advice and implementation together. We listen,
            build, test with your people and stay for the handover. The same
            team, carrying your context from the first conversation into the
            everyday details.
          </p>
        </div>
      </section>

      <section
        className="boutique-section"
        id="our-commitments"
        style={{ scrollMarginTop: "6rem" }}
      >
        <div className="page boutique-spread">
          <div className="boutique-intro">
            <span className="studio-label">01 / What you can expect</span>
            <h2>
              Small enough
              <br />
              to stay close.
              <br />
              <span>By design.</span>
            </h2>
            <Link href="/approach" className="text-link">
              See how we work <Arrow diagonal />
            </Link>
          </div>
          <div className="boutique-principles">
            <p className="boutique-lede">
              Our size shapes the way we work. These are the commitments that
              come with it.
            </p>
            {principles.map(([title, body], i) => (
              <article key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page studio-section" id="firm-details">
        <div className={s.split}>
          <div className={s.sectionCopy}>
            <span className="studio-label">02 / Rooted in Dubai</span>
            <h2>
              A local presence.
              <br />
              <span>A named partner.</span>
            </h2>
            <p>
              Established in {site.founded}, {site.legalName} is registered with
              the {site.difc.registry}. We work with small and mid-sized
              businesses across the UAE and the wider Gulf.
            </p>
            <p>
              Our firm details are here so you know who you’re working with,
              from the outset.
            </p>
          </div>
          <dl className={s.firmFacts}>
            {[
              ["Registered name", site.legalName],
              ["Commercial licence", site.difc.licenceDisplay],
              ["Registrar", site.difc.registry],
              ["Based in", "Dubai International Financial Centre"],
              ["Established", site.founded],
              ["Working across", "United Arab Emirates & the GCC"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        className={s.softSection}
        id="working-together"
        style={{ scrollMarginTop: "6rem" }}
      >
        <div className={`page studio-section ${s.split}`}>
          <div className={s.sectionCopy}>
            <span className="studio-label">03 / Working together</span>
            <h2>
              The right fit
              <br />
              <span>starts with shared intent.</span>
            </h2>
            <p>
              We work best with businesses that want to improve the working day
              and are ready to involve the people who know it best.
            </p>
            <p>
              You don’t need an AI strategy or a technical brief. A process
              you’d like to make better is a good place to begin.
            </p>
          </div>
          <ul className={s.fitList}>
            {fit.map(([title, body], i) => (
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
      <NextConversation
        title={
          <>
            Your business is personal.
            <br />
            Let’s start there.
          </>
        }
      >
        Tell us a little about your team and what you’re working through. You’ll
        speak with the people who would do the work.
      </NextConversation>
    </>
  );
}
