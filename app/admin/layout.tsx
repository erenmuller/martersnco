import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import Wordmark from "@/components/Wordmark";
import AdminSubmitButton from "@/components/AdminSubmitButton";
import { adminSignOutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <>
      <a href="#admin-main" className="skip-link">
        Skip to admin content
      </a>
      <header className="border-b border-rule bg-bone">
        <div className="page flex min-h-[4.5rem] flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex items-baseline gap-3">
            <Wordmark />
            <span className="eyebrow eyebrow-pine">Admin</span>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div className="hidden sm:block">
              <p className="text-[0.8125rem] font-medium text-ink">
                {profile.full_name || profile.email}
              </p>
              {profile.full_name ? (
                <p className="mono text-[0.625rem] text-ink-45">{profile.email}</p>
              ) : null}
            </div>
            <Link href="/" className="btn btn-quiet btn-sm">
              Public site
            </Link>
            <form action={adminSignOutAction}>
              <AdminSubmitButton tone="secondary" pendingLabel="Signing out…" className="btn-sm">
                Sign out
              </AdminSubmitButton>
            </form>
          </div>
        </div>
        <AdminNav />
      </header>
      <main id="admin-main" className="page py-8 md:py-12">
        {children}
      </main>
    </>
  );
}
