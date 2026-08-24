"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/audit", label: "Audit" },
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="overflow-x-auto border-t border-rule">
      <ul className="page m-0 flex min-w-max list-none gap-1 p-0 py-2">
        {items.map((item) => {
          const active = "exact" in item && item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block border px-3 py-1.5 text-[0.8125rem] transition-colors ${
                  active
                    ? "border-pine bg-pine-wash text-pine"
                    : "border-transparent text-ink-70 hover:border-rule-strong hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
