import AdminNotice from "@/components/AdminNotice";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminSubmitButton from "@/components/AdminSubmitButton";
import Badge from "@/components/Badge";
import {
  deleteUserAction,
  inviteUserAction,
  resendInviteAction,
  updateUserAction,
} from "@/app/admin/_actions/users";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Client, Profile } from "@/lib/types";

type SearchParams = Promise<{
  client?: string;
  notice?: string | string[];
  error?: string | string[];
}>;

type ProfileWithClient = Profile & { client: Pick<Client, "id" | "name"> | null };

export default async function UsersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const currentAdmin = await requireAdmin();
  const supabase = await createClient();
  const clientsResult = await supabase.from("clients").select("id, name").order("name");
  const clients = (clientsResult.data ?? []) as Pick<Client, "id" | "name">[];
  const clientFilter = clients.some((client) => client.id === params.client) ? params.client! : "";

  let request = supabase
    .from("profiles")
    .select("*, client:clients(id, name)")
    .order("created_at", { ascending: false });
  if (clientFilter) request = request.eq("client_id", clientFilter);
  const profilesResult = await request;
  const profiles = (profilesResult.data ?? []) as unknown as ProfileWithClient[];
  const loadError = clientsResult.error?.message ?? profilesResult.error?.message;

  return (
    <>
      <AdminPageHeader
        eyebrow="Operations"
        title="Users"
        description="Invite admin or client users, assign client access, and deactivate accounts without deleting their history."
        action={
          <a href="#invite-user" className="btn btn-primary">
            Invite a user
          </a>
        }
      />
      <AdminNotice notice={params.notice} error={params.error} />
      {loadError ? (
        <p className="notice notice-error" role="alert">
          Users could not be loaded: {loadError}
        </p>
      ) : null}

      <section id="invite-user" className="card scroll-mt-6">
        <details>
          <summary className="cursor-pointer font-medium">Send an invitation</summary>
          <form action={inviteUserAction} className="mt-6">
            <input type="hidden" name="returnTo" value="/admin/users" />
            <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-4">
              <label className="field">
                <span className="field-label">Email</span>
                <input className="input" name="email" type="email" required maxLength={200} autoComplete="off" />
              </label>
              <label className="field">
                <span className="field-label">Full name</span>
                <input className="input" name="full_name" maxLength={160} autoComplete="off" />
              </label>
              <label className="field">
                <span className="field-label">Role</span>
                <select className="select" name="role" defaultValue="client">
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="field">
                <span className="field-label">Client assignment</span>
                <select className="select" name="client_id" defaultValue={clientFilter}>
                  <option value="">None (admins only)</option>
                  {clients.map((client) => (
                    <option value={client.id} key={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="notice notice-info">
              The invitation email is sent by this application, not by Supabase — see EMAIL_PROVIDER in the README.
              Client users require a client assignment; admin invitations ignore the client field. Role and client
              access are assigned server-side after the auth user is created.
            </p>
            <AdminSubmitButton pendingLabel="Sending invitation…">Send invitation</AdminSubmitButton>
          </form>
        </details>
      </section>

      <section className="mt-10" aria-labelledby="user-list-title">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="user-list-title" className="display-s">
              User register
            </h2>
            <p className="mono mt-1 text-[0.6875rem] text-ink-45">{profiles.length} users</p>
          </div>
          <form method="get" className="flex gap-2">
            <label>
              <span className="sr-only">Filter users by client</span>
              <select className="select min-w-[14rem]" name="client" defaultValue={clientFilter}>
                <option value="">All users</option>
                {clients.map((client) => (
                  <option value={client.id} key={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn btn-secondary">
              Filter
            </button>
          </form>
        </div>

        {profiles.length ? (
          <div className="space-y-3">
            {profiles.map((profile) => (
              <details className="card" key={profile.id}>
                <summary className="cursor-pointer list-none">
                  <span className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                    <span>
                      <strong className="block text-[0.9375rem]">
                        {profile.full_name || profile.email}
                        {profile.id === currentAdmin.id ? " (you)" : ""}
                      </strong>
                      <span className="mt-1 block text-[0.8125rem] text-ink-45">
                        {profile.email} · {profile.role === "admin" ? "Administrator" : profile.client?.name ?? "Unassigned client user"}
                      </span>
                    </span>
                    <Badge tone={profile.role === "admin" ? "pending" : "neutral"}>{profile.role}</Badge>
                    <Badge tone={profile.is_active ? "ok" : "alert"}>
                      {profile.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </span>
                </summary>

                <form action={updateUserAction} className="mt-6 border-t border-rule pt-6">
                  <input type="hidden" name="id" value={profile.id} />
                  <input type="hidden" name="returnTo" value="/admin/users" />
                  <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="field">
                      <span className="field-label">Email (managed by Auth)</span>
                      <input className="input" value={profile.email} disabled readOnly />
                    </label>
                    <label className="field">
                      <span className="field-label">Full name</span>
                      <input className="input" name="full_name" defaultValue={profile.full_name ?? ""} maxLength={160} />
                    </label>
                    <label className="field">
                      <span className="field-label">Phone (E.164)</span>
                      <input
                        className="input mono"
                        name="phone_e164"
                        type="tel"
                        defaultValue={profile.phone_e164 ?? ""}
                        placeholder="+971501234567"
                      />
                    </label>
                    <label className="field">
                      <span className="field-label">Role</span>
                      <select className="select" name="role" defaultValue={profile.role}>
                        <option value="client">Client</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>
                    <label className="field sm:col-span-2">
                      <span className="field-label">Client assignment</span>
                      <select className="select" name="client_id" defaultValue={profile.client_id ?? ""}>
                        <option value="">None (admins only)</option>
                        {clients.map((client) => (
                          <option value={client.id} key={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field flex items-center gap-3 pt-6">
                      <input
                        className="h-4 w-4 accent-pine"
                        type="checkbox"
                        name="is_active"
                        defaultChecked={profile.is_active}
                        disabled={profile.id === currentAdmin.id}
                      />
                      {profile.id === currentAdmin.id ? (
                        <input type="hidden" name="is_active" value="on" />
                      ) : null}
                      <span className="text-[0.875rem]">Account active</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <AdminSubmitButton>Save user</AdminSubmitButton>
                    <span className="mono text-[0.6875rem] text-ink-45">
                      Added {formatDate(profile.created_at)} · WhatsApp {profile.whatsapp_verified_at ? `verified ${formatDateTime(profile.whatsapp_verified_at)}` : "not verified"}
                    </span>
                  </div>
                </form>

                <form action={resendInviteAction} className="mt-5 border-t border-rule pt-5">
                  <input type="hidden" name="id" value={profile.id} />
                  <input type="hidden" name="returnTo" value="/admin/users" />
                  <div className="flex flex-wrap items-center gap-4">
                    <AdminSubmitButton tone="secondary" pendingLabel="Sending…">
                      Re-send invitation
                    </AdminSubmitButton>
                    <span className="text-[0.8125rem] text-ink-45">
                      Issues a fresh onboarding email. Refused once the account has been signed into.
                    </span>
                  </div>
                </form>

                {profile.id !== currentAdmin.id ? (
                  <form action={deleteUserAction} className="mt-5 border-t border-rule pt-5">
                    <input type="hidden" name="id" value={profile.id} />
                    <input type="hidden" name="returnTo" value="/admin/users" />
                    <AdminSubmitButton
                      tone="danger"
                      pendingLabel="Deleting…"
                      confirmMessage={`Permanently delete the auth account for ${profile.email}? Deactivation is usually safer.`}
                    >
                      Delete user
                    </AdminSubmitButton>
                  </form>
                ) : null}
              </details>
            ))}
          </div>
        ) : (
          <div className="empty">No users match this filter.</div>
        )}
      </section>
    </>
  );
}
