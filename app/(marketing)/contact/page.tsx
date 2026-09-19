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
              <span className="status-dot" /> Let’s talk
            </span>
            <h1>
              Which task takes
              <br />
              the most <span>time?</span>
            </h1>
            <p>
              Tell us what’s slowing you down. No brief needed.
            </p>
            <div className="contact-expectations">
              <p>The first conversation is free.<br />We reply within one working day.</p>
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
