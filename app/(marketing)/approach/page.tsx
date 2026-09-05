import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { phases, faqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Approach",
  description:
    "How Marters & Co. runs an engagement: measure the process, prove one workflow in parallel, build the rest in return order, then hand over ownership with the source.",
  alternates: { canonical: "/approach" },
};

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

      <section className="page section section-flush pt-14 md:pt-20">
        <div className="max-w-[52rem]">
          <h1 className="display-xl max-w-[18ch]">
            Thoughtful from the first conversation.
          </h1>
          <p className="lede mt-7">
            We get close to your business, prove the value in real work, and
            help your team make it their own. Each step gives you the clarity
            and confidence to take the next.
          </p>
        </div>
      </section>

      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">Sequence</span>
          </div>

          <div>
            <ol className="m-0 list-none border-t border-ink p-0">
              {phases.map((phase) => (
                <li
                  key={phase.title}
                  className="grid gap-3 border-b border-rule py-7 md:grid-cols-[5.5rem_minmax(0,1fr)_11rem] md:gap-8"
                >
                  <span className="mono pt-1.5 text-[0.8125rem] text-pine">
                    {phase.marker}
                  </span>

                  <div>
                    <h2 className="display-m text-ink">{phase.title}</h2>
                    <p className="mt-3 max-w-[52ch] text-[1rem] leading-relaxed text-ink-70">
                      {phase.body}
                    </p>
                  </div>

                  <div className="pt-1.5 md:text-right">
                    <span className="text-[0.8125rem] leading-snug text-ink-70">
                      {phase.output}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">Parallel running</span>
          </div>
          <div>
            <h2 className="display-l max-w-[22ch]">
              The step most implementations skip.
            </h2>
            <div className="prose-block mt-6 text-[1.0625rem]">
              <p>
                When a new automated process is ready, we do not switch the old
                one off. Both run, on the same real work, until their outputs
                reconcile for a full cycle — a month of invoices, a quarter of
                onboardings, whatever the natural period is.
              </p>
              <p>
                It costs a few weeks and it is the single reason rollouts do not
                get quietly reversed. A team that has watched the new system
                agree with the old one, every day, for a month, trusts it. A
                team handed a cutover on a Monday does not, and goes back to the
                spreadsheet the first time something looks odd.
              </p>
              <p>
                <strong>
                  If the two do not reconcile, the automation is wrong and we
                  fix it before anything is switched off.
                </strong>{" "}
                That is the whole point of running them together.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">Questions</span>
          </div>

          <div>
            <h2 className="display-l max-w-[20ch]">
              Things clients ask before signing.
            </h2>

            <dl className="mt-10 m-0 border-t border-rule">
              {faqs.map((f) => (
                <div key={f.q} className="border-b border-rule py-6">
                  <dt className="display-s max-w-[40ch] text-ink">{f.q}</dt>
                  <dd className="m-0 mt-3 max-w-[62ch] text-[0.9375rem] leading-relaxed text-ink-70">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>

            <Link href="/contact" className="btn btn-primary mt-10">
              Ask us something else
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
