/**
 * The admin console's information architecture, in one place.
 *
 * The header nav, the section sub-nav and the dashboard's section cards all
 * read from this list, so a new page appears everywhere by adding it once.
 * Plain data only — this module is imported by client components.
 */

export type AdminPage = {
  href: string;
  label: string;
  description: string;
};

export type AdminSection = {
  /** Stable key, also the section's landing route when it has children. */
  id: string;
  label: string;
  /** One line of orientation, shown on the dashboard. */
  blurb: string;
  href: string;
  pages: AdminPage[];
};

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    id: "overview",
    label: "Overview",
    blurb: "Today's queues and the numbers behind them.",
    href: "/admin",
    pages: [],
  },
  {
    id: "clients",
    label: "Client management",
    blurb: "Everyone already working with us: their accounts, billing, requests and files.",
    href: "/admin/clients",
    pages: [
      {
        href: "/admin/clients",
        label: "Clients",
        description: "Company records, contacts and the engagements attached to them.",
      },
      {
        href: "/admin/subscriptions",
        label: "Subscriptions",
        description: "Recurring plans, renewal dates and whether the period is paid.",
      },
      {
        href: "/admin/requests",
        label: "Requests",
        description: "Triage what clients file, and quote it or waive the charge.",
      },
      {
        href: "/admin/documents",
        label: "Documents",
        description: "Deliverables in each client's private storage folder.",
      },
    ],
  },
  {
    id: "acquisition",
    label: "Client acquisition",
    blurb: "Everything aimed at people who are not clients yet.",
    href: "/admin/leads",
    pages: [
      {
        href: "/admin/leads",
        label: "Leads",
        description: "Contact-form enquiries waiting to be handled.",
      },
      {
        href: "/admin/newsletter",
        label: "Newsletter",
        description: "Each edition and the Google Doc it is written in.",
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    blurb: "The catalogue, console access and the record of who changed what.",
    href: "/admin/services",
    pages: [
      {
        href: "/admin/services",
        label: "Services",
        description: "The catalogue engagements are assigned from.",
      },
      {
        href: "/admin/users",
        label: "Users",
        description: "Console and portal accounts, invites and tenant links.",
      },
      {
        href: "/admin/audit",
        label: "Audit",
        description: "Every admin mutation, newest first.",
      },
    ],
  },
];

/** The section a pathname belongs to, falling back to Overview. */
export function sectionForPath(pathname: string): AdminSection {
  const match = ADMIN_SECTIONS.find((section) =>
    section.pages.some((page) => isOnPage(pathname, page.href)),
  );
  return match ?? ADMIN_SECTIONS[0];
}

export function isOnPage(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const WORKING_SECTIONS = ADMIN_SECTIONS.filter((section) => section.pages.length > 0);
