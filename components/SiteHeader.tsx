"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Wordmark from "./Wordmark";
import Arrow from "./Arrow";
import { nav } from "@/lib/site";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 960px)");
    const closeOnDesktop = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Keep keyboard focus within the open navigation and its close control.
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (event.key !== "Tab") return;
      const links = Array.from(
        menuRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [],
      );
      const first = buttonRef.current;
      const last = links.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="studio-header">
        <div className="page studio-header-inner">
          <Wordmark />
          <nav aria-label="Primary" className="desktop-navigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="desktop-header-actions">
            <Link href="/login" className="header-login">
              Client portal <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/contact" className="btn btn-primary">
              Let’s talk <Arrow diagonal />
            </Link>
          </div>
          <button
            ref={buttonRef}
            type="button"
            className="mobile-menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span>{open ? "Close" : "Menu"}</span>
            <span className="menu-lines" data-open={open} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>
      {open && (
        <div ref={menuRef} id="mobile-nav" className="studio-mobile-nav">
          <nav aria-label="Mobile primary" className="page">
            {nav.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <span>0{index + 1}</span>
                {item.label}
                <Arrow diagonal />
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)}>
              <span>04</span>Client portal
              <Arrow diagonal />
            </Link>
            <Link
              href="/contact"
              className="btn btn-primary"
              onClick={() => setOpen(false)}
            >
              Let’s talk <Arrow />
            </Link>
            <p>
              Boutique AI consultancy.
              <br />
              Dubai, United Arab Emirates.
            </p>
          </nav>
        </div>
      )}
    </>
  );
}
