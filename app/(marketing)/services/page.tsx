import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { serviceGroups } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Process identification, automation implementation, AI workflow programmes, custom software and infrastructure builds, and team enablement for SMEs in the UAE.",
  alternates: { canonical: "/services" },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Marters & Co. services",
  itemListElement: serviceGroups.flatMap((g, gi) =>
    g.services.map((s, si) => ({
      "@type": "ListItem",
      position: gi * 10 + si + 1,
      item: {
        "@type": "Service",
        name: s.name,
        description: s.lede,
        serviceType: g.title,
        provider: { "@id": `${site.url}/#organisation` },
        areaServed: { "@type": "Country", name: "United Arab Emirates" },
      },
    })),
  ),
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={schema} />

      <section className="page section section-flush pt-14 md:pt-20">
        <div className="max-w-[50rem]">
          <span className="eyebrow eyebrow-pine">Services</span>
          <h1 className="display-xl mt-6">What we actually do.</h1>
          <p className="lede mt-7">
            Five groups of work. Most clients start with the first and decide
            about the rest once they have seen the numbers.
          </p>
        </div>

        {/* Contents — useful on a long page, and it doubles as a summary. */}
        <nav aria-label="On this page" className="mt-12 border-t border-rule">
          <ol className="m-0 flex list-none flex-wrap gap-x-8 gap-y-2 p-0 pt-4">
            {serviceGroups.map((g) => (
              <li key={g.slug}>
                <a
                  href={`#${g.slug}`}
                  className="mono text-[0.6875rem] uppercase tracking-[0.11em] text-ink-45 transition-colors hover:text-pine"
                >
                  {g.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      {serviceGroups.map((group) => (
        <section
          key={group.slug}
          id={group.slug}
          className="page section scroll-mt-24"
        >
          <div className="rail">
            <div className="rail-label">
              <span className="eyebrow">{group.slug}</span>
            </div>

            <div>
              <h2 className="display-l max-w-[22ch]">{group.title}</h2>
              <p className="prose-block mt-5 max-w-[58ch] text-[1.0625rem]">
                {group.intro}
              </p>

              <div className="mt-12 grid gap-px bg-rule md:grid-cols-2">
                {group.services.map((s) => (
                  <article
                    key={s.code}
                    className="flex flex-col bg-bone p-6 md:p-7"
                  >
                    <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3">
                      <span className="mono text-[0.6875rem] tracking-[0.11em] text-pine">
                        {s.code}
                      </span>
                      <span className="mono text-[0.6875rem] text-ink-45">
                        {s.duration}
                      </span>
                    </div>

                    <h3 className="display-s mt-5 text-ink">{s.name}</h3>
                    <p className="mt-2 text-[0.9375rem] font-medium leading-snug text-ink">
                      {s.lede}
                    </p>
                    <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-70">
                      {s.detail}
                    </p>

                    <div className="mt-6 border-t border-rule pt-4">
                      <span className="eyebrow mb-2.5">You receive</span>
                      <ul className="m-0 list-none space-y-1.5 p-0">
                        {s.deliverables.map((d) => (
                          <li
                            key={d}
                            className="flex gap-2.5 text-[0.875rem] leading-snug text-ink-70"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-[0.42rem] block h-px w-3 shrink-0 bg-rule-strong"
                            />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">Next</span>
          </div>
          <div>
            <h2 className="display-m max-w-[24ch]">
              Not sure which of these you need?
            </h2>
            <p className="prose-block mt-4 max-w-[52ch]">
              That is what the assessment is for. Describe one process that
              frustrates you and we will tell you where it sits.
            </p>
            <Link href="/contact" className="btn btn-primary mt-7">
              Book a free inspection
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
