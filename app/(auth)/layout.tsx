import type { Metadata } from "next";
import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Client access",
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-bone">
      <a href="#auth-main" className="skip-link">
        Skip to form
      </a>

      <header className="border-b border-rule">
        <div className="page flex h-[4.25rem] items-center justify-between gap-5">
          <Wordmark />
          <Link
            href="/"
            className="text-[0.875rem] text-ink-70 transition-colors hover:text-pine"
          >
            Back to site
          </Link>
        </div>
      </header>

      <main
        id="auth-main"
        className="page flex flex-1 items-start justify-center py-12 sm:items-center sm:py-16"
      >
        <div className="w-full max-w-[29rem]">{children}</div>
      </main>

      <footer className="border-t border-rule py-5">
        <div className="page flex flex-wrap justify-between gap-3 text-[0.75rem] text-ink-45">
          <span className="mono">Private client access</span>
          <a href={`mailto:${site.email}`} className="hover:text-pine">
            {site.email}
          </a>
        </div>
      </footer>
    </div>
  );
}
