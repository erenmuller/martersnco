"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Wordmark from "./Wordmark";
import { nav } from "@/lib/site";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the panel on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Lock the page behind the open panel.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-rule bg-bone/92 backdrop-blur-[6px]">
        <div className="page flex h-[4.25rem] items-center justify-between gap-6">
          <Wordmark />

          <nav
            aria-label="Primary"
            className="hidden items-center gap-8 md:flex"
          >
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`border-b py-0.5 text-[0.9375rem] transition-colors ${
                    active
                      ? "border-pine text-pine"
                      : "border-transparent text-ink-70 hover:border-rule-strong hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="btn btn-quiet btn-sm">
              Client login
            </Link>
            <Link href="/contact" className="btn btn-primary btn-sm">
              Book an assessment
            </Link>
          </div>

          <button
            type="button"
            className="-mr-2 flex h-10 w-10 items-center justify-center md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-[9px] w-[22px]">
              <span
                className="absolute left-0 block h-px w-full bg-ink transition-transform duration-200"
                style={{
                  top: open ? "4px" : 0,
                  transform: open ? "rotate(45deg)" : "none",
                }}
              />
              <span
                className="absolute left-0 block h-px w-full bg-ink transition-transform duration-200"
                style={{
                  bottom: open ? "4px" : 0,
                  transform: open ? "rotate(-45deg)" : "none",
                }}
              />
            </span>
          </button>
        </div>
      </header>

      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 bottom-0 top-[4.25rem] z-40 overflow-y-auto border-t border-rule bg-bone md:hidden"
        >
          <nav aria-label="Primary" className="page flex flex-col py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="display-s border-b border-rule py-4 text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="display-s border-b border-rule py-4 text-ink"
            >
              Client login
            </Link>
            <Link href="/contact" className="btn btn-primary mt-6">
              Book an assessment
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
