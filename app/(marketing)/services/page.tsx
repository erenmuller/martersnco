import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { marketingServices, deliveryServices } from "@/lib/marketing-services";
import { site } from "@/lib/site";
import { breadcrumbs, pageMetadata } from "@/lib/metadata";
import { NextConversation } from "../_components/Editorial";
import DiscoveryPath from "../_components/DiscoveryPath";
import styles from "./services.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Automation, systems integration, custom software & AI",
  description: "Discovery audits, automation, systems integration, custom software and AI tools, plus staff training and practical AI workshops. Based in Dubai.",
  path: "/services",
});

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
      <JsonLd data={breadcrumbs({ name: "Services", path: "/services" })} />
      <section className={`page ${styles.intro}`} aria-labelledby="services-heading">
        <span className="studio-label">Our services</span>
        <h1 id="services-heading">Less manual work.<br />Better connected systems.</h1>
        <p>We recommend starting with a Discovery Audit. Its findings shape which services will make the biggest difference to your business.</p>
      </section>

      <section className={`page ${styles.serviceList}`} aria-label="What we do">
        <DiscoveryPath detailed />
        {deliveryServices.map((service) => (
          <article id={service.id} className={styles.service} key={service.id}>
            <h2>{service.title}</h2>
            <div>
              <p>{service.description}</p>
              <p className={styles.examples}><span>Examples</span>{service.examples}</p>
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
