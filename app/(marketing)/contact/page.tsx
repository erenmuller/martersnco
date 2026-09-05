import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./ContactForm";
import Arrow from "@/components/Arrow";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Let’s talk about your business",
  description:
    "Start a conversation with Marters & Co. Tell us what you’d like to improve and we’ll help you find a practical way forward. Your first conversation is free.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="contact-page page">
        <Link href="/" className="contact-back">
          ← Back to the firm
        </Link>
        <div className="enquiry-spread">
          <div className="enquiry-intro">
            <span className="studio-label">
              <span className="status-dot" /> A good place to begin
            </span>
            <h1>
              Let’s talk
              <br />
              about <span>you.</span>
            </h1>
            <p>
              You know your business. We know how to put AI to work. Let’s find
              out what we could make better, together.
            </p>
            <div className="contact-expectations">
              <h2>Here’s what happens next</h2>
              <ol>
                <li>
                  <span>01</span>
                  <p>
                    <strong>A personal reply</strong>Within one working day,
                    from someone who will be involved in your work.
                  </p>
                </li>
                <li>
                  <span>02</span>
                  <p>
                    <strong>A useful first conversation</strong>A free call to
                    understand your business and see whether we’re a good fit.
                  </p>
                </li>
                <li>
                  <span>03</span>
                  <p>
                    <strong>A clear next step</strong>If there’s an opportunity,
                    we’ll outline a Discovery Audit with a fixed scope and fee.
                  </p>
                </li>
              </ol>
            </div>
            <a href={`mailto:${site.email}`} className="text-link">
              {site.email} <Arrow diagonal />
            </a>
            {site.phoneE164 && site.phoneDisplay && (
              <a className="contact-phone" href={`tel:${site.phoneE164}`}>
                {site.phoneDisplay}
              </a>
            )}
          </div>
          <ContactForm />
        </div>
        <div className="contact-bottom">
          <span>Dubai International Financial Centre · UAE &amp; GCC</span>
          <p>
            Already working with us?{" "}
            <Link href="/login">
              Visit your client portal <span aria-hidden="true">↗</span>
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
