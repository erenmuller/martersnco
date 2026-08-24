import { notFound } from "next/navigation";
import Link from "next/link";
import AdminNotice from "@/components/AdminNotice";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminSubmitButton from "@/components/AdminSubmitButton";
import Badge from "@/components/Badge";
import {
  createEngagementAction,
  deleteClientAction,
  deleteEngagementAction,
  updateClientAction,
  updateEngagementAction,
} from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";
import {
  CLIENT_STATUS_LABEL,
  ENGAGEMENT_STATUS_LABEL,
  clientTone,
  engagementTone,
} from "@/lib/types";
import type { Client, ClientService, ClientStatus, EngagementStatus, Service } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string | string[]; error?: string | string[] }>;
};

type EngagementWithService = ClientService & { service: Service | null };

const clientStatuses = Object.entries(CLIENT_STATUS_LABEL) as [ClientStatus, string][];
const engagementStatuses = Object.entries(ENGAGEMENT_STATUS_LABEL) as [EngagementStatus, string][];

export default async function ClientDetailPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const supabase = createAdminClient();

  const [clientResult, engagementResult, serviceResult, profileCount, subscriptionCount, documentCount, requestCount] =
    await Promise.all([
      supabase
        .from("clients")
        .select(
          "id, name, legal_name, status, industry, primary_contact_name, primary_contact_email, notes, created_at, updated_at",
        )
        .eq("id", id)
        .single(),
      supabase
        .from("client_services")
        .select(
          "id, client_id, service_id, status, started_on, ended_on, owner_name, notes, created_at, updated_at, service:services(id, code, name, summary, category, is_active, sort_order, created_at, updated_at)",
        )
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("services")
        .select(
          "id, code, name, summary, category, is_active, sort_order, created_at, updated_at",
        )
        .eq("is_active", true)
        .order("sort_order")
        .order("name"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("client_id", id),
      supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("client_id", id),
      supabase.from("documents").select("id", { count: "exact", head: true }).eq("client_id", id),
      supabase.from("requests").select("id", { count: "exact", head: true }).eq("client_id", id),
    ]);

  if (clientResult.error?.code === "PGRST116") notFound();
  if (!clientResult.data) {
    return (
      <p className="notice notice-error" role="alert">
        Client could not be loaded: {clientResult.error?.message ?? "Unknown error"}
      </p>
    );
  }

  const client = clientResult.data as Client;
  const engagements = (engagementResult.data ?? []) as unknown as EngagementWithService[];
  const services = (serviceResult.data ?? []) as Service[];
  const related = [
    { label: "Users", count: profileCount.count, href: `/admin/users?client=${id}` },
    { label: "Subscriptions", count: subscriptionCount.count, href: `/admin/subscriptions?client=${id}` },
    { label: "Documents", count: documentCount.count, href: `/admin/documents?client=${id}` },
    { label: "Requests", count: requestCount.count, href: `/admin/requests?client=${id}` },
  ];
  const relatedError = [engagementResult, serviceResult, profileCount, subscriptionCount, documentCount, requestCount]
    .map((result) => result.error?.message)
    .find(Boolean);

  return (
    <>
      <AdminPageHeader
        eyebrow="Client"
        title={client.name}
        description={client.legal_name || "Client account and its operational work."}
        action={
          <Link href="/admin/clients" className="btn btn-secondary">
            Back to clients
          </Link>
        }
      />
      <AdminNotice notice={query.notice} error={query.error} />
      {relatedError ? (
        <p className="notice notice-error" role="alert">
          Some related data could not be loaded: {relatedError}
        </p>
      ) : null}

      <div className="grid gap-px border border-rule bg-rule sm:grid-cols-4">
        {related.map((item) => (
          <Link href={item.href} key={item.label} className="bg-paper p-4 hover:bg-shade">
            <span className="eyebrow">{item.label}</span>
            <strong className="figure-xl mt-3 block">{item.count ?? "—"}</strong>
          </Link>
        ))}
      </div>

      <section className="mt-10" aria-labelledby="client-details-title">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="client-details-title" className="display-s">
            Account details
          </h2>
          <Badge tone={clientTone(client.status)}>{CLIENT_STATUS_LABEL[client.status]}</Badge>
        </div>
        <form action={updateClientAction} className="card">
          <input type="hidden" name="id" value={client.id} />
          <input type="hidden" name="returnTo" value={`/admin/clients/${client.id}`} />
          <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-3">
            <label className="field">
              <span className="field-label">Trading name</span>
              <input className="input" name="name" defaultValue={client.name} required maxLength={160} />
            </label>
            <label className="field">
              <span className="field-label">Legal name</span>
              <input className="input" name="legal_name" defaultValue={client.legal_name ?? ""} maxLength={240} />
            </label>
            <label className="field">
              <span className="field-label">Status</span>
              <select className="select" name="status" defaultValue={client.status}>
                {clientStatuses.map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Industry</span>
              <input className="input" name="industry" defaultValue={client.industry ?? ""} maxLength={160} />
            </label>
            <label className="field">
              <span className="field-label">Primary contact</span>
              <input
                className="input"
                name="primary_contact_name"
                defaultValue={client.primary_contact_name ?? ""}
                maxLength={160}
              />
            </label>
            <label className="field">
              <span className="field-label">Contact email</span>
              <input
                className="input"
                name="primary_contact_email"
                type="email"
                defaultValue={client.primary_contact_email ?? ""}
                maxLength={200}
              />
            </label>
          </div>
          <label className="field">
            <span className="field-label">Internal notes</span>
            <textarea className="textarea" name="notes" defaultValue={client.notes ?? ""} maxLength={5000} />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <AdminSubmitButton>Save client</AdminSubmitButton>
            <span className="mono text-[0.6875rem] text-ink-45">Added {formatDate(client.created_at)}</span>
          </div>
        </form>
      </section>

      <section className="mt-12" aria-labelledby="engagements-title">
        <div className="mb-4">
          <span className="eyebrow eyebrow-pine">Work</span>
          <h2 id="engagements-title" className="display-s mt-2">
            Engagements
          </h2>
        </div>

        <div className="card">
          <details>
            <summary className="cursor-pointer font-medium">Add an engagement</summary>
            {services.length ? (
              <form action={createEngagementAction} className="mt-6">
                <input type="hidden" name="client_id" value={client.id} />
                <input type="hidden" name="returnTo" value={`/admin/clients/${client.id}`} />
                <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="field">
                    <span className="field-label">Service</span>
                    <select className="select" name="service_id" required defaultValue="">
                      <option value="" disabled>
                        Choose a service
                      </option>
                      {services.map((service) => (
                        <option value={service.id} key={service.id}>
                          {service.code} — {service.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="field-label">Status</span>
                    <select className="select" name="status" defaultValue="scoped">
                      {engagementStatuses.map(([value, label]) => (
                        <option value={value} key={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="field-label">Owner</span>
                    <input className="input" name="owner_name" maxLength={160} />
                  </label>
                  <label className="field">
                    <span className="field-label">Start date</span>
                    <input className="input" type="date" name="started_on" />
                  </label>
                  <label className="field">
                    <span className="field-label">End date</span>
                    <input className="input" type="date" name="ended_on" />
                  </label>
                </div>
                <label className="field">
                  <span className="field-label">Notes</span>
                  <textarea className="textarea" name="notes" maxLength={5000} />
                </label>
                <AdminSubmitButton pendingLabel="Adding…">Add engagement</AdminSubmitButton>
              </form>
            ) : (
              <p className="notice notice-info mt-4">
                Create or reactivate a service catalogue item before assigning work.
              </p>
            )}
          </details>
        </div>

        <div className="mt-5 space-y-3">
          {engagements.length ? (
            engagements.map((engagement) => (
              <details key={engagement.id} className="card" id={`engagement-${engagement.id}`}>
                <summary className="cursor-pointer list-none">
                  <span className="flex flex-wrap items-center justify-between gap-4">
                    <span>
                      <strong className="block text-[0.9375rem]">
                        {engagement.service?.name ?? "Deleted service"}
                      </strong>
                      <span className="mono mt-1 block text-[0.6875rem] text-ink-45">
                        {engagement.service?.code ?? "—"} · {formatDate(engagement.started_on)} to {formatDate(engagement.ended_on)}
                      </span>
                    </span>
                    <Badge tone={engagementTone(engagement.status)}>
                      {ENGAGEMENT_STATUS_LABEL[engagement.status]}
                    </Badge>
                  </span>
                </summary>
                <form action={updateEngagementAction} className="mt-6 border-t border-rule pt-6">
                  <input type="hidden" name="id" value={engagement.id} />
                  <input type="hidden" name="client_id" value={client.id} />
                  <input type="hidden" name="returnTo" value={`/admin/clients/${client.id}`} />
                  <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="field">
                      <span className="field-label">Service</span>
                      <select className="select" name="service_id" defaultValue={engagement.service_id}>
                        {services.map((service) => (
                          <option value={service.id} key={service.id}>
                            {service.code} — {service.name}{service.is_active ? "" : " (inactive)"}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span className="field-label">Status</span>
                      <select className="select" name="status" defaultValue={engagement.status}>
                        {engagementStatuses.map(([value, label]) => (
                          <option value={value} key={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span className="field-label">Owner</span>
                      <input className="input" name="owner_name" defaultValue={engagement.owner_name ?? ""} maxLength={160} />
                    </label>
                    <label className="field">
                      <span className="field-label">Start date</span>
                      <input className="input" type="date" name="started_on" defaultValue={engagement.started_on ?? ""} />
                    </label>
                    <label className="field">
                      <span className="field-label">End date</span>
                      <input className="input" type="date" name="ended_on" defaultValue={engagement.ended_on ?? ""} />
                    </label>
                  </div>
                  <label className="field">
                    <span className="field-label">Notes</span>
                    <textarea className="textarea" name="notes" defaultValue={engagement.notes ?? ""} maxLength={5000} />
                  </label>
                  <AdminSubmitButton>Save engagement</AdminSubmitButton>
                </form>
                <form action={deleteEngagementAction} className="mt-5 border-t border-rule pt-5">
                  <input type="hidden" name="id" value={engagement.id} />
                  <input type="hidden" name="client_id" value={client.id} />
                  <input type="hidden" name="returnTo" value={`/admin/clients/${client.id}`} />
                  <AdminSubmitButton
                    tone="danger"
                    pendingLabel="Deleting…"
                    confirmMessage="Delete this engagement record? This cannot be undone."
                  >
                    Delete engagement
                  </AdminSubmitButton>
                </form>
              </details>
            ))
          ) : (
            <div className="empty">No engagements are attached to this client.</div>
          )}
        </div>
      </section>

      <section className="mt-12 border-t border-burgundy pt-6" aria-labelledby="delete-client-title">
        <h2 id="delete-client-title" className="display-s" style={{ color: "var(--color-burgundy)" }}>
          Delete client
        </h2>
        <p className="mt-2 max-w-[64ch] text-[0.875rem] text-ink-70">
          This removes the client and cascades its engagements, subscriptions, requests, and document metadata.
          Captured storage objects are removed after the database deletion. Linked users become unassigned and are not deleted.
        </p>
        <form action={deleteClientAction} className="mt-5">
          <input type="hidden" name="id" value={client.id} />
          <input type="hidden" name="returnTo" value="/admin/clients" />
          <AdminSubmitButton
            tone="danger"
            pendingLabel="Deleting client…"
            confirmMessage={`Permanently delete ${client.name} and its operational records?`}
          >
            Delete client
          </AdminSubmitButton>
        </form>
      </section>
    </>
  );
}
