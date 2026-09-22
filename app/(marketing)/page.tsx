import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Arrow from "@/components/Arrow";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";
import { deliveryServices } from "@/lib/marketing-services";
import DiscoveryPath from "./_components/DiscoveryPath";
import ContactForm from "./contact/ContactForm";
import styles from "./home.module.css";

export const metadata: Metadata = pageMetadata({
  title: "AI consultancy & automation in Dubai",
  description: site.description,
  path: "/",
});

const steps = [
  { title: "Discover", body: "We study your daily work and identify the changes worth making.", outcome: "A costed plan, in priority order." },
  { title: "Build", body: "We build one workflow and test it alongside your current process.", outcome: "Working software, checked with your team." },
  { title: "Embed", body: "We train your staff, document the system and measure the results.", outcome: "You own the software and accounts." },
];

export default function HomePage() {
  return (
    <div className={styles.home}>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", "@id": site.url + "/#website", name: site.name, alternateName: ["Marters and Co", "Marters & Co"], url: site.url, inLanguage: "en-AE", publisher: { "@id": site.url + "/#organisation" } }} />
      <section className={styles.hero} aria-labelledby="home-heading">
        <div className={`page ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><span className={styles.dot} /> AI & automation · Dubai</span>
            <h1 id="home-heading">AI discovery<br /><span>specialists.</span></h1>
            <p>Bring AI into your business with confidence. We help you find where it adds value, understand the risks and put it to work with the right safeguards.</p>
            <div className={styles.actions}>
              <a href="#start-a-conversation" className="btn btn-primary">Find your starting point <Arrow diagonal /></a>
              <a href="#what-we-do" className={styles.quietLink}>What we do <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <Link href="/approach" className={styles.featuredWork}>
            <span className={styles.eyebrow}>A considered approach to AI</span>
            <h2>Clarity before<br />commitment.</h2>
            <p>Start with your business: the way your team works, the data you handle and the decisions that need a human.</p>
            <div className={styles.featuredResult}><strong>A clear next step.</strong><span>What to pursue, what to protect and what to leave alone.</span></div>
            <span className={styles.cardLink}>How we approach AI <Arrow diagonal /></span>
          </Link>
        </div>
        <div className={`page ${styles.credentials}`}>
          <span>Boutique AI consultancy</span>
          <div><span>DIFC licensed</span><span>Dubai · UAE & GCC</span></div>
        </div>
      </section>

      <section className={`page ${styles.section}`} id="what-we-do" aria-labelledby="services-heading">
        <div className={styles.sectionHeading}>
          <div><span className={styles.eyebrow}>01 / What we do</span><h2 id="services-heading">Make everyday work simpler.</h2></div>
        </div>
        <DiscoveryPath />
        <div className={styles.serviceGrid}>
          {deliveryServices.map((service) => (
            <Link className={styles.serviceCard} href={`/services#${service.id}`} key={service.title}>
              <div className={styles.serviceBody}>
                <h3>{service.title}</h3><p>{service.shortDescription}</p>
                <span className={styles.cardLink}>Learn more <Arrow diagonal /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.journey} id="discovery-audit" aria-labelledby="journey-heading">
        <div className={`page ${styles.section}`}>
          <div className={styles.sectionHeading}>
            <div><span className={styles.eyebrow}>02 / How we work</span><h2 id="journey-heading">Three stages. One team.</h2></div>
            <p>The people you meet are the people who build your system.</p>
          </div>
          <ol className={styles.steps}>
            {steps.map((step, i) => (
              <li key={step.title}>
                <div className={styles.stepTop}><span>0{i + 1}</span></div>
                <h3>{step.title}</h3><p>{step.body}</p>
                <div className={styles.outcome}>{step.outcome}</div>
              </li>
            ))}
          </ol>
          <div className={styles.discoveryNote}>
            <p><strong>Start with a Discovery Audit.</strong><span>2–3 weeks. Fixed scope, fixed fee. No obligation to continue.</span></p>
            <Link href="/services#identify">Explore the audit <Arrow diagonal /></Link>
          </div>
        </div>
      </section>

      <section className={styles.contactSection} id="start-a-conversation" aria-labelledby="contact-heading">
        <div className={`page ${styles.contactGrid}`}>
          <div className={styles.contactCopy}>
            <span className={styles.eyebrow}>03 / Let’s talk</span>
            <h2 id="contact-heading">Where could AI<br />help your business?</h2>
            <p>Share what you’d like to improve, an idea you’re exploring or a concern about getting started. We’ll help you make sense of the next step.</p>
            <div className={styles.contactPromise}><p>The first conversation is free.<br />We reply within one working day.</p></div>
            <a href={`mailto:${site.email}`} className={styles.quietLink}>{site.email} <Arrow diagonal /></a>
          </div>
          <ContactForm source="home" />
        </div>
      </section>
    </div>
  );
}
