import type { Metadata } from "next";
import Link from "next/link";
import { principles } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${site.legalName} is a boutique AI and automation consultancy licensed in the Dubai International Financial Centre, working with small and mid-sized businesses across the UAE and the Gulf.`,
  alternates: { canonical: "/about" },
};

const fitFor = [
  "20–500 staff, with processes that grew rather than were designed",
  "A finance, operations or onboarding workflow that everyone complains about",
  "Someone internal who can give us a few hours a week",
  "A willingness to be told a process is not worth automating",
];

const notFor = [
  "Buying a demo to show a board",
  "Replacing a team this quarter to hit a number",
  "A fixed implementation quote before anything has been measured",
  "Work we would have to subcontract to deliver",
];

export default function AboutPage() {
  return (
    <>
      <section className="page section section-flush pt-14 md:pt-20">
        <div className="max-w-[52rem]">
          <span className="eyebrow eyebrow-pine">About</span>
          <h1 className="display-xl mt-6">
            A small firm, on purpose.
          </h1>
          <p className="lede mt-7">
            {site.legalName} is an AI and automation implementation partner
            licensed in the Dubai International Financial Centre. We work with a
            few businesses at a time, and the people who scope your work are the
            people who build it.
          </p>
        </div>
      </section>

      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">Why we exist</span>
          </div>
          <div className="prose-block max-w-[58ch] text-[1.0625rem]">
            <p>
              There is no shortage of firms selling AI to Gulf businesses right
              now. Very few of them will be in the room when the thing they sold
              has to survive a Tuesday — a supplier who changes their invoice
              format, a staff member who leaves, a process that turns out to
              have four undocumented exceptions.
            </p>
            <p>
              We started Marters &amp; Co. because the gap in the market is not
              strategy. It is implementation, and then staying. The advice is
              mostly free and mostly correct; the difficulty is doing the work
              properly, in a real business, with the people who already have a
              job.
            </p>
            <p>
              So we do the unglamorous half. We measure processes, build the
              systems, sit with the staff who will use them, and write down how
              it works in language they use. Then we hand it over.
            </p>
          </div>
        </div>
      </section>

      {/* Licence — the concrete credential a new firm can point at. */}
      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">Licence</span>
          </div>

          <div>
            <h2 className="display-l max-w-[22ch]">
              Registered in the DIFC.
            </h2>
            <p className="prose-block mt-5 max-w-[56ch] text-[1.0625rem]">
              The Dubai International Financial Centre operates its own
              common-law jurisdiction, courts and registrar. Holding a licence
              there means the firm you are contracting with is a real, named,
              inspectable entity, and that any dispute is heard in the DIFC
              Courts under English-language common law.
            </p>
            <p className="prose-block mt-4 max-w-[56ch]">
              For a firm as new as ours, that is a more useful thing to show you
              than a logo wall.
            </p>

            <dl className="mono mt-10 grid gap-px border border-rule bg-rule text-[0.8125rem] sm:grid-cols-2">
              {[
                ["Registered name", site.legalName],
                ["Commercial licence", site.difc.licenceDisplay],
                ["Registrar", site.difc.registry],
                ["Jurisdiction", "DIFC, Dubai, United Arab Emirates"],
                ["Established", site.founded],
                ["Governing law", "DIFC common law"],
              ].map(([label, value]) => (
                <div key={label} className="bg-bone p-4">
                  <dt className="eyebrow mb-1.5">{label}</dt>
                  <dd className="m-0 text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">How we operate</span>
          </div>
          <div>
            <h2 className="display-l max-w-[20ch]">Four commitments.</h2>
            <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {principles.map((p) => (
                <div key={p.title}>
                  <dt className="border-t border-ink pt-3 text-[0.9375rem] font-semibold leading-snug text-ink">
                    {p.title}
                  </dt>
                  <dd className="m-0 mt-2 text-[0.9375rem] leading-relaxed text-ink-70">
                    {p.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="page section">
        <div className="rail">
          <div className="rail-label">
            <span className="eyebrow">Fit</span>
          </div>

          <div>
            <h2 className="display-l max-w-[24ch]">
              We are a good fit for some businesses and a poor one for others.
            </h2>

            <div className="mt-10 grid gap-px bg-rule sm:grid-cols-2">
              <div className="bg-bone p-6">
                <span className="eyebrow eyebrow-pine mb-4">
                  Works well when
                </span>
                <ul className="m-0 list-none space-y-3 p-0">
                  {fitFor.map((t) => (
                    <li
                      key={t}
                      className="flex gap-3 text-[0.9375rem] leading-snug text-ink-70"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.45rem] block h-px w-3 shrink-0"
                        style={{ background: "var(--color-pine)" }}
                      />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-bone p-6">
                <span
                  className="eyebrow mb-4"
                  style={{ color: "var(--color-burgundy)" }}
                >
                  Not what we do
                </span>
                <ul className="m-0 list-none space-y-3 p-0">
                  {notFor.map((t) => (
                    <li
                      key={t}
                      className="flex gap-3 text-[0.9375rem] leading-snug text-ink-70"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.45rem] block h-px w-3 shrink-0"
                        style={{ background: "var(--color-burgundy)" }}
                      />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link href="/contact" className="btn btn-primary mt-10">
              Book a free inspection
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
