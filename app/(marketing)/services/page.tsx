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

const totalServices = serviceGroups.reduce(
  (count, group) => count + group.services.length,
  0,
);

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={schema} />

      <section className="page section section-flush pb-4 pt-14 md:pb-6 md:pt-[4.5rem]">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div>
            <h1 className="display-xl max-w-[15ch]">What we actually do.</h1>
            <p className="lede mt-7">
              Five groups of work. Most clients start with the first and decide
              about the rest once they have seen the numbers.
            </p>
          </div>

          {/* Contents. The old version set five full sentences in tracked-out
              mono capitals, which wrapped into an unreadable block. A list of
              links with their counts is what a reader actually wants. */}
          <nav aria-label="On this page" className="lg:pt-2">
            <ol className="m-0 list-none border-t border-ink p-0">
              {serviceGroups.map((group) => (
                <li key={group.slug} className="border-b border-rule">
                  <a
                    href={`#${group.slug}`}
                    className="group flex items-baseline justify-between gap-5 py-3 text-[0.9375rem] text-ink-70 transition-colors hover:text-pine"
                  >
                    <span className="text-ink transition-colors group-hover:text-pine">
                      {group.title}
                    </span>
                    <span className="mono shrink-0 text-[0.8125rem] text-ink-45">
                      {group.services.length}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[0.8125rem] text-ink-45">
              {totalServices} services in total.
            </p>
          </nav>
        </div>
      </section>

      {serviceGroups.map((group) => (
        <section
          key={group.slug}
          id={group.slug}
          className="page section scroll-mt-24"
        >
          <div>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-end lg:gap-16">
              <h2 className="display-l max-w-[22ch]">{group.title}</h2>
              <p className="max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink-70 lg:pb-1">
                {group.intro}
              </p>
            </div>

              {/* Ruled rows, not boxes. These are entries on a schedule of
                  services; a card grid gave five identical containers no
                  matter how different the entries were. */}
            <div className="mt-11">
              {group.services.map((s) => (
                <article key={s.code} className="offer-row">
                    <div>
                      <h3 className="display-m">{s.name}</h3>
                      <p className="mt-2 max-w-[54ch] text-[1rem] leading-relaxed text-ink">
                        {s.lede}
                      </p>
                      <p className="mt-3 max-w-[62ch] text-[0.9375rem] leading-relaxed text-ink-70">
                        {s.detail}
                      </p>

                      <ul className="m-0 mt-5 grid list-none gap-x-8 gap-y-1.5 p-0 sm:grid-cols-2">
                        {s.deliverables.map((d) => (
                          <li
                            key={d}
                            className="flex gap-2.5 text-[0.875rem] leading-snug text-ink-70"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-[0.45rem] block h-px w-2.5 shrink-0 bg-rule-strong"
                            />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                  <div className="offer-meta">
                    <span className="mono text-[0.8125rem] text-pine">
                      {s.code}
                    </span>
                    <span>{s.duration}</span>
                  </div>
                </article>
              ))}
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
            <h2 className="display-l max-w-[24ch]">
              Not sure which of these you need?
            </h2>
            <p className="prose-block mt-5 max-w-[52ch]">
              That is what the Discovery Audit is for. We find the opportunity,
              quantify it and give you a clear order of action.
            </p>
            <Link href="/contact" className="btn btn-primary mt-8">
              Discuss a Discovery Audit
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
