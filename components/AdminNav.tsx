"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_SECTIONS, isOnPage, sectionForPath } from "@/lib/admin-nav";

/**
 * Two tiers rather than one long row: sections first, then the pages inside the
 * section you are actually in. Nine flat tabs made every page look equally
 * important, which is what made the console hard to scan.
 */
export default function AdminNav() {
  const pathname = usePathname();
  const current = sectionForPath(pathname);
  const onOverview = pathname === "/admin";

  return (
    <div className="border-t border-rule">
      <nav aria-label="Admin sections" className="overflow-x-auto">
        <ul className="page m-0 flex min-w-max list-none gap-1 p-0 pt-2">
          {ADMIN_SECTIONS.map((section) => {
            const active = section.id === "overview" ? onOverview : !onOverview && section.id === current.id;
            return (
              <li key={section.id}>
                <Link
                  href={section.href}
                  aria-current={active ? "page" : undefined}
                  className={`block border-b-2 px-3 py-2 text-[0.8125rem] font-medium transition-colors ${
                    active
                      ? "border-pine text-pine"
                      : "border-transparent text-ink-70 hover:border-rule-strong hover:text-ink"
                  }`}
                >
                  {section.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {onOverview || current.pages.length === 0 ? (
        <div className="h-2" />
      ) : (
        <nav aria-label={current.label} className="overflow-x-auto border-t border-rule bg-shade">
          <ul className="page m-0 flex min-w-max list-none gap-1 p-0 py-1.5">
            {current.pages.map((page) => {
              const active = isOnPage(pathname, page.href);
              return (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    aria-current={active ? "page" : undefined}
                    className={`block border px-3 py-1 text-[0.8125rem] transition-colors ${
                      active
                        ? "border-pine bg-pine-wash text-pine"
                        : "border-transparent text-ink-70 hover:border-rule-strong hover:text-ink"
                    }`}
                  >
                    {page.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
