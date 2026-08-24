import type { Metadata } from "next";
import PortalPageHeader from "@/components/PortalPageHeader";
import PortalProfileForms from "@/components/PortalProfileForms";
import { requireClient } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const profile = await requireClient();

  return (
    <>
      <PortalPageHeader
        eyebrow="Account"
        title="Profile"
        description="Manage the name shown in the portal and the password used to sign in."
      />

      <section className="card mb-6" aria-labelledby="account-details-heading">
        <h2 id="account-details-heading" className="sr-only">
          Account details
        </h2>
        <dl className="grid gap-6 sm:grid-cols-3">
          <div>
            <dt className="eyebrow mb-2">Email</dt>
            <dd className="break-all text-[0.875rem] text-ink-70">
              {profile.email}
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-2">Account type</dt>
            <dd className="text-[0.875rem] capitalize text-ink-70">
              {profile.role}
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-2">Member since</dt>
            <dd className="mono text-[0.8125rem] text-ink-70">
              {formatDate(profile.created_at)}
            </dd>
          </div>
        </dl>
      </section>

      <PortalProfileForms currentName={profile.full_name ?? ""} />
    </>
  );
}
