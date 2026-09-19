import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Arrow from "@/components/Arrow";
import { marketingServices } from "@/lib/marketing-services";
import { site } from "@/lib/site";
import { NextConversation } from "../_components/Editorial";
import styles from "./services.module.css";

export const metadata: Metadata = {
  title: "Automation, systems integration, custom software & AI",
  description: "Discovery audits, automation, systems integration, custom software and AI tools, plus staff training and practical AI workshops. Based in Dubai.",
  alternates: { canonical: "/services" },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Marters & Co. services",
  itemListElement: marketingServices.map((service, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Service",
      name: service.title,
      description: service.description,
      provider: { "@id": site.url + "/#organisation" },
      areaServed: { "@type": "Country", name: "United Arab Emirates" },
    },
  })),
};

export default function ServicesPage() {
  return (
    <div className={styles.services}>
      <JsonLd data={schema} />
      <section className={`page ${styles.intro}`} aria-labelledby="services-heading">
        <span className="studio-label">Our services</span>
        <h1 id="services-heading">Less manual work.<br />Better connected systems.</h1>
        <p>Start with a Discovery Audit. We identify what to improve, build the systems and train your team.</p>
      </section>

      <section className={`page ${styles.serviceList}`} aria-label="What we do">
        {marketingServices.map((service, index) => (
          <article id={service.id} className={styles.service} key={service.id}>
            <span className={styles.number}>0{index + 1}</span>
            <h2>{service.title}</h2>
            <div>
              <p>{service.description}</p>
              <p className={styles.examples}><span>{service.id === "identify" ? "What you receive" : "Examples"}</span>{service.examples}</p>
              {"terms" in service && (
                <>
                  <p className={styles.auditTerms}>{service.terms}</p>
                  <Link href="/contact" className="text-link">Discuss an audit <Arrow diagonal /></Link>
                </>
              )}
            </div>
          </article>
        ))}
        <p className={styles.buildNote}>We work with the tools you already use and test each system with your team before the switch.</p>
      </section>

      <section id="programme" className={`page ${styles.support}`} aria-labelledby="support-heading">
        <h2 id="support-heading">Ongoing support</h2>
        <div>
          <p>Optional monthly support covers monitoring, fixes and improvements to the systems we build.</p>
          <p className={styles.pricing}>Builds are quoted per project or workflow. Ongoing support has an agreed monthly fee.</p>
        </div>
      </section>
      <NextConversation title="Tell us what takes too much time.">
        A repeated task or a system that needs improving is enough to start.
      </NextConversation>
    </div>
  );
}
