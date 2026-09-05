import Link from "next/link";
import AdminNotice from "@/components/AdminNotice";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminSubmitButton from "@/components/AdminSubmitButton";
import Badge from "@/components/Badge";
import { createClientAction } from "@/app/admin/_actions/clients";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";
import { CLIENT_STATUS_LABEL, clientTone } from "@/lib/types";
import type { Client, ClientStatus } from "@/lib/types";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  notice?: string | string[];
  error?: string | string[];
}>;

const statuses = Object.entries(CLIENT_STATUS_LABEL) as [ClientStatus, string][];

export default async function ClientsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const query = params.q?.trim().slice(0, 100) ?? "";
  const status = statuses.some(([value]) => value === params.status)
    ? (params.status as ClientStatus)
    : "";

  const supabase = createAdminClient();
  let request = supabase
    .from("clients")
    .select(
      "id, name, legal_name, status, industry, primary_contact_name, primary_contact_email, notes, created_at, updated_at",
    )
    .order("name");
  if (query) request = request.ilike("name", `%${query}%`);
  if (status) request = request.eq("status", status);
  const { data, error } = await request;
  const clients = (data ?? []) as Client[];

  return (
    <>
      <AdminPageHeader
        eyebrow="Client management"
        title="Clients"
        description="Companies, primary contacts, and the operational records attached to them."
        action={
          <a href="#new-client" className="btn btn-primary">
            Add a client
          </a>
        }
      />
      <AdminNotice notice={params.notice} error={params.error} />

      <section id="new-client" className="card scroll-mt-6" aria-labelledby="new-client-title">
        <details>
          <summary className="cursor-pointer font-medium text-ink">
            <span id="new-client-title">Create a client record</span>
          </summary>
          <form action={createClientAction} className="mt-6">
            <input type="hidden" name="returnTo" value="/admin/clients" />
            <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-3">
              <label className="field">
                <span className="field-label">Trading name</span>
                <input className="input" name="name" required maxLength={160} />
              </label>
              <label className="field">
                <span className="field-label">Legal name</span>
                <input className="input" name="legal_name" maxLength={240} />
              </label>
              <label className="field">
                <span className="field-label">Status</span>
                <select className="select" name="status" defaultValue="prospect">
                  {statuses.map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field-label">Industry</span>
                <input className="input" name="industry" maxLength={160} />
              </label>
              <label className="field">
                <span className="field-label">Primary contact</span>
                <input className="input" name="primary_contact_name" maxLength={160} />
              </label>
              <label className="field">
                <span className="field-label">Contact email</span>
                <input className="input" name="primary_contact_email" type="email" maxLength={200} />
              </label>
            </div>
            <label className="field">
              <span className="field-label">Internal notes</span>
              <textarea className="textarea" name="notes" maxLength={5000} />
            </label>
            <AdminSubmitButton pendingLabel="Creating…">Create client</AdminSubmitButton>
          </form>
        </details>
      </section>

      <section className="mt-10" aria-labelledby="client-list-title">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="client-list-title" className="display-s">
              Client register
            </h2>
            <p className="mono mt-1 text-[0.6875rem] text-ink-45">
              {clients.length} {clients.length === 1 ? "record" : "records"}
            </p>
          </div>
          <form method="get" className="flex flex-col gap-2 sm:flex-row">
            <label>
              <span className="sr-only">Search client name</span>
              <input
                className="input min-w-[15rem]"
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search client name"
              />
            </label>
            <label>
              <span className="sr-only">Filter by status</span>
              <select className="select" name="status" defaultValue={status}>
                <option value="">All statuses</option>
                {statuses.map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn-secondary" type="submit">
              Filter
            </button>
          </form>
        </div>

        {error ? (
          <p className="notice notice-error" role="alert">
            Clients could not be loaded: {error.message}
          </p>
        ) : clients.length ? (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Contact</th>
                  <th>Industry</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="primary">
                      <Link className="hover:text-pine" href={`/admin/clients/${client.id}`}>
                        {client.name}
                      </Link>
                      {client.legal_name ? (
                        <span className="mt-1 block text-[0.75rem] font-normal text-ink-45">
                          {client.legal_name}
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <Badge tone={clientTone(client.status)}>{CLIENT_STATUS_LABEL[client.status]}</Badge>
                    </td>
                    <td>
                      {client.primary_contact_name || "—"}
                      {client.primary_contact_email ? (
                        <a
                          className="mt-1 block text-[0.75rem] text-pine underline underline-offset-2"
                          href={`mailto:${client.primary_contact_email}`}
                        >
                          {client.primary_contact_email}
                        </a>
                      ) : null}
                    </td>
                    <td>{client.industry || "—"}</td>
                    <td className="num">{formatDate(client.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            {query || status ? "No clients match these filters." : "No clients yet. Create the first record above."}
          </div>
        )}
      </section>
    </>
  );
}
