import Link from "next/link";
import AdminNotice from "@/components/AdminNotice";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminSubmitButton from "@/components/AdminSubmitButton";
import Badge from "@/components/Badge";
import { triageRequestAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/format";
import {
  REQUEST_STATUS_LABEL,
  requestTone,
} from "@/lib/types";
import type {
  Client,
  ClientRequest,
  RequestPriority,
  RequestStatus,
} from "@/lib/types";

type SearchParams = Promise<{
  client?: string;
  status?: string;
  notice?: string | string[];
  error?: string | string[];
}>;

type RequestWithRelations = ClientRequest & {
  client: Pick<Client, "id" | "name"> | null;
  creator: { full_name: string | null; email: string } | null;
};

const statuses = Object.entries(REQUEST_STATUS_LABEL) as [RequestStatus, string][];
const priorities: [RequestPriority, string][] = [
  ["low", "Low"],
  ["normal", "Normal"],
  ["high", "High"],
];

function priorityTone(priority: RequestPriority) {
  if (priority === "high") return "alert" as const;
  if (priority === "normal") return "pending" as const;
  return "neutral" as const;
}

export default async function RequestsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = createAdminClient();
  const clientsResult = await supabase.from("clients").select("id, name").order("name");
  const clients = (clientsResult.data ?? []) as Pick<Client, "id" | "name">[];
  const clientFilter = clients.some((client) => client.id === params.client) ? params.client! : "";
  const statusFilter = statuses.some(([status]) => status === params.status)
    ? (params.status as RequestStatus)
    : "";

  let request = supabase
    .from("requests")
    .select(
      "id, client_id, created_by, subject, body, status, priority, admin_notes, created_at, updated_at, resolved_at, client:clients(id, name), creator:profiles!requests_created_by_fkey(full_name, email)",
    )
    .order("created_at", { ascending: false });
  if (clientFilter) request = request.eq("client_id", clientFilter);
  if (statusFilter) request = request.eq("status", statusFilter);
  const requestsResult = await request;
  const requests = (requestsResult.data ?? []) as unknown as RequestWithRelations[];
  const loadError = clientsResult.error?.message ?? requestsResult.error?.message;
  const returnParams = new URLSearchParams();
  if (clientFilter) returnParams.set("client", clientFilter);
  if (statusFilter) returnParams.set("status", statusFilter);
  const returnTo = `/admin/requests${returnParams.size ? `?${returnParams}` : ""}`;

  return (
    <>
      <AdminPageHeader
        eyebrow="Support"
        title="Request triage"
        description="Client-filed requests are immutable to clients after submission. Admins own priority, status, and internal notes."
      />
      <AdminNotice notice={params.notice} error={params.error} />
      {loadError ? (
        <p className="notice notice-error" role="alert">
          Requests could not be loaded: {loadError}
        </p>
      ) : null}

      <form method="get" className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="field m-0 flex-1">
          <span className="field-label">Client</span>
          <select className="select" name="client" defaultValue={clientFilter}>
            <option value="">All clients</option>
            {clients.map((client) => (
              <option value={client.id} key={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field m-0 flex-1">
          <span className="field-label">Status</span>
          <select className="select" name="status" defaultValue={statusFilter}>
            <option value="">All statuses</option>
            {statuses.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-secondary">
          Filter requests
        </button>
      </form>

      <section className="mt-8" aria-labelledby="request-list-title">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="request-list-title" className="display-s">
            Queue
          </h2>
          <span className="mono text-[0.6875rem] text-ink-45">{requests.length} requests</span>
        </div>
        {requests.length ? (
          <div className="space-y-4">
            {requests.map((item) => (
              <article className="card scroll-mt-6" id={`request-${item.id}`} key={item.id}>
                <header className="flex flex-col gap-4 border-b border-rule pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="eyebrow eyebrow-pine">
                      {item.client ? (
                        <Link href={`/admin/clients/${item.client.id}`} className="hover:underline">
                          {item.client.name}
                        </Link>
                      ) : (
                        "Unknown client"
                      )}
                    </span>
                    <h3 className="display-s mt-2">{item.subject}</h3>
                    <p className="mono mt-2 text-[0.6875rem] text-ink-45">
                      Filed {formatDateTime(item.created_at)} by {item.creator?.full_name || item.creator?.email || "Unknown user"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={priorityTone(item.priority)}>{item.priority} priority</Badge>
                    <Badge tone={requestTone(item.status)}>{REQUEST_STATUS_LABEL[item.status]}</Badge>
                  </div>
                </header>

                <div className="prose-block whitespace-pre-wrap py-5 text-[0.9375rem]">
                  <p>{item.body}</p>
                </div>

                <form action={triageRequestAction} className="border-t border-rule pt-5">
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <div className="grid gap-x-5 sm:grid-cols-2">
                    <label className="field">
                      <span className="field-label">Status</span>
                      <select className="select" name="status" defaultValue={item.status}>
                        {statuses.map(([value, label]) => (
                          <option value={value} key={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span className="field-label">Priority</span>
                      <select className="select" name="priority" defaultValue={item.priority}>
                        {priorities.map(([value, label]) => (
                          <option value={value} key={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="field">
                    <span className="field-label">Internal notes</span>
                    <textarea
                      className="textarea"
                      name="admin_notes"
                      defaultValue={item.admin_notes ?? ""}
                      maxLength={5000}
                      placeholder="Visible to admins only"
                    />
                  </label>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <AdminSubmitButton pendingLabel="Updating…">Update request</AdminSubmitButton>
                    {item.resolved_at ? (
                      <span className="mono text-[0.6875rem] text-ink-45">
                        Resolved {formatDateTime(item.resolved_at)}
                      </span>
                    ) : null}
                  </div>
                </form>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">No requests match the current filters.</div>
        )}
      </section>
    </>
  );
}
