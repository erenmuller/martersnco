import type { Metadata } from "next";
import Link from "next/link";
import PortalNav from "@/components/PortalNav";
import Wordmark from "@/components/Wordmark";
import { requireClient } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Client portal",
    template: "%s — Client portal",
  },
  robots: { index: false, follow: false },
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireClient();
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id, name, legal_name, status, industry, primary_contact_name, primary_contact_email, created_at")
    .eq("id", profile.client_id)
    .maybeSingle();
  const client = data as Client | null;

  return (
    <div className="flex min-h-dvh flex-col bg-bone">
      <a href="#portal-main" className="skip-link">
        Skip to portal content
      </a>

      <header className="border-b border-rule bg-paper">
        <div className="page flex min-h-[4.5rem] items-center justify-between gap-5 py-3">
          <div className="min-w-0">
            <Wordmark href="/portal" />
            <p className="mt-1 truncate text-[0.6875rem] text-ink-45">
              {client?.name ?? "Client portal"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link
              href="/portal/profile"
              className="hidden max-w-[14rem] truncate text-[0.8125rem] text-ink-70 hover:text-pine sm:block"
            >
              {profile.full_name || profile.email}
            </Link>
            <form action="/signout" method="post">
              <button type="submit" className="btn btn-secondary btn-sm">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="border-b border-rule bg-bone">
        <PortalNav />
      </div>

      <main id="portal-main" className="page flex-1 py-8 sm:py-12">
        {children}
      </main>

      <footer className="border-t border-rule py-5 text-[0.75rem] text-ink-45">
        <div className="page flex flex-wrap items-center justify-between gap-3">
          <span className="mono">Marters &amp; Co. / Client portal</span>
          <span>Private and confidential</span>
        </div>
      </footer>
    </div>
  );
}
