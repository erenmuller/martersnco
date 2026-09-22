import type { Metadata } from "next";
import Link from "next/link";
import Arrow from "@/components/Arrow";
import { site } from "@/lib/site";
import { NextConversation, PageIntro } from "../_components/Editorial";
import s from "../_components/editorial.module.css";
import { breadcrumbs, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "About the firm — a boutique AI consultancy in Dubai",
  description: `${site.legalName} is a boutique AI and automation consultancy licensed in the Dubai International Financial Centre, working with small and mid-sized businesses across the UAE and the Gulf.`,
  path: "/about",
});
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

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbs({ name: "The firm", path: "/about" })} />
      <PageIntro
        label="The firm / Dubai, United Arab Emirates"
        title={
          <>
            An AI consultancy.
            <br />
            <span>Based in Dubai.</span>
          </>
        }
        visual={
          <div className={s.firmPlate}>
            <span>Independent by design · Est. {site.founded}</span>
            <span className={s.ampersand} aria-hidden="true">
              &amp;
            </span>
            <div>
              <div className={s.firmName}>
                Marters{" "}
                <span style={{ color: "var(--color-brass)" }}>&amp;</span> Co.
              </div>
              <span className="mt-2 block text-xs font-normal tracking-wide text-ink-45">
                Applied Intelligence Ltd.
              </span>
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
              Let’s talk <Arrow />
            </Link>
            <a href="#our-commitments" className="text-link">
              What you can expect <span aria-hidden="true">↓</span>
            </a>
          </>
        }
      >
        We help businesses across the UAE and the Gulf reduce manual work with automation, connected systems and applied AI.
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
            <a href="#firm-details">
              UAE &amp; GCC <Arrow diagonal />
            </a>
          </div>
        </div>
      </div>

      <section
        className="boutique-section"
        id="our-commitments"
        style={{ scrollMarginTop: "6rem" }}
      >
        <div className="page boutique-spread">
          <div className="boutique-intro">
            <span className="studio-label">01 / What you can expect</span>
            <h2>
              One team,
              <br />
              <span>from start to finish.</span>
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

      <NextConversation
        title={
          <>
            Tell us what’s
            <br />
            slowing you down.
          </>
        }
      >
        Tell us a little about your team and what you’re working through. You’ll
        speak with the people who would do the work.
      </NextConversation>
    </>
  );
}
