import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a free discovery call",
  description:
    "Tell us where work feels repetitive, slow or error-prone. We will help you decide whether a Discovery Audit is the right next step.",
  alternates: { canonical: "/contact" },
};

const expectations = [
  {
    marker: "1 day",
    title: "A reply from a person",
    body: "Not a scheduling link. Usually a couple of questions about volume and who touches the process.",
  },
  {
    marker: "45 min",
    title: "A call, if it looks like a fit",
    body: "We will tell you on this call if we think you should not spend money on this.",
  },
  {
    marker: "2 days",
    title: "A written scope and a fixed price",
    body: "For the audit only. We do not quote implementation before measuring, because that number would be invented.",
  },
];

export default function ContactPage() {
  return (
    <section className="page section section-flush pb-20 pt-14 md:pt-20">
      <div className="max-w-[52rem]">
        <h1 className="display-xl">Start with a useful conversation.</h1>
        <p className="lede mt-7">
          Tell us which part of the business feels slow, repetitive or
          error-prone. We will help you decide whether there is a real
          opportunity—and whether a Discovery Audit is the right next step.
        </p>
      </div>

      <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-16">
        <div>
          <ContactForm />
        </div>

        <aside className="lg:border-l lg:border-rule lg:pl-10">
          <span className="eyebrow mb-5">What happens next</span>

          <ol className="m-0 list-none border-t border-rule p-0">
            {expectations.map((e) => (
              <li key={e.title} className="border-b border-rule py-4">
                <span className="mono text-[0.8125rem] text-pine">
                  {e.marker}
                </span>
                <h2 className="mt-2 text-[0.9375rem] font-semibold leading-snug text-ink">
                  {e.title}
                </h2>
                <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-70">
                  {e.body}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-8">
            <span className="eyebrow mb-3">Direct</span>
            <address className="text-[0.875rem] not-italic leading-relaxed text-ink-70">
              <a
                href={`mailto:${site.email}`}
                className="text-ink underline decoration-rule-strong underline-offset-4 transition-colors hover:text-pine"
              >
                {site.email}
              </a>
              {site.phoneE164 && site.phoneDisplay && (
                <>
                  <br />
                  <a
                    href={`tel:${site.phoneE164}`}
                    className="transition-colors hover:text-pine"
                  >
                    {site.phoneDisplay}
                  </a>
                </>
              )}
              <br />
              <br />
              {site.address.line1}
              <br />
              {site.address.locality}, {site.address.countryName}
            </address>
          </div>

          <p className="mt-8 border-t border-rule pt-4 text-[0.8125rem] leading-relaxed text-ink-45">
            Existing client? Use the{" "}
            <a
              href="/login"
              className="text-ink underline decoration-rule-strong underline-offset-4 hover:text-pine"
            >
              client portal
            </a>{" "}
            to raise a request against your engagement.
          </p>
        </aside>
      </div>
    </section>
  );
}
