"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/engagements", label: "Engagements" },
  { href: "/portal/subscriptions", label: "Subscriptions" },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/requests", label: "Requests" },
  { href: "/portal/profile", label: "Profile" },
] as const;

export default function PortalNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Client portal" className="overflow-x-auto">
      <div className="page flex min-w-max items-center gap-1">
        {items.map((item) => {
          const active =
            item.href === "/portal"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`border-b-2 px-3 py-3 text-[0.8125rem] font-medium transition-colors sm:px-4 ${
                active
                  ? "border-pine text-pine"
                  : "border-transparent text-ink-70 hover:border-rule-strong hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
