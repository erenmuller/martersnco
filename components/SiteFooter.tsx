import Link from "next/link";
import Wordmark from "./Wordmark";
import { site } from "@/lib/site";

const columns = [
  {
    heading: "Services",
    links: [
      { href: "/services#identify", label: "Process identification" },
      { href: "/services#implement", label: "Automation implementation" },
      { href: "/services#programme", label: "AI workflow programmes" },
      { href: "/services#enterprise", label: "Custom builds" },
      { href: "/services#people", label: "Team enablement" },
    ],
  },
  {
    heading: "Firm",
    links: [
      { href: "/approach", label: "How we work" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/login", label: "Client login" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-shade">
      <div className="page py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark href={null} />
            <p className="mt-4 max-w-[30ch] text-[0.9375rem] leading-relaxed text-ink-70">
              A boutique AI and automation implementation partner for small and
              mid-sized businesses.
            </p>

            <address className="mono mt-6 text-[0.75rem] not-italic leading-relaxed text-ink-45">
              {site.address.line1}
              <br />
              {site.address.locality}, {site.address.countryName}
              <br />
              <a
                href={`mailto:${site.email}`}
                className="text-ink-70 underline decoration-rule-strong underline-offset-4 transition-colors hover:text-pine"
              >
                {site.email}
              </a>
            </address>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <span className="eyebrow mb-4">{col.heading}</span>
              <ul className="m-0 list-none space-y-2.5 p-0">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[0.9375rem] text-ink-70 transition-colors hover:text-pine"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Licence block — the concrete credibility a new firm can show. */}
        <div className="mt-12 border-t border-rule-strong pt-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                fill="none"
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              >
                <path
                  d="M13 1.5 23 5.2v7c0 5.6-4.1 10.4-10 12.3C7.1 22.6 3 17.8 3 12.2v-7L13 1.5Z"
                  stroke="var(--color-pine)"
                  strokeWidth="1.1"
                  fill="var(--color-pine-wash)"
                />
                <path
                  d="m8.6 12.8 3 3 5.8-5.9"
                  stroke="var(--color-pine)"
                  strokeWidth="1.4"
                  strokeLinecap="square"
                />
              </svg>
              <div>
                <span className="eyebrow eyebrow-pine mb-1">
                  Licensed in the DIFC
                </span>
                <p className="mono max-w-[42ch] text-[0.75rem] leading-relaxed text-ink-70">
                  {site.legalName} is registered with the{" "}
                  {site.difc.registry}. Commercial licence{" "}
                  <span className="text-ink">{site.difc.licenceDisplay}</span>,
                  Dubai International Financial Centre.
                </p>
              </div>
            </div>

            <p className="mono text-[0.6875rem] leading-relaxed text-ink-45 sm:text-right">
              Established {site.founded}
              <br />© {new Date().getFullYear()} {site.legalName}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
