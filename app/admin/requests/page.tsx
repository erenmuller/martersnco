import Link from "next/link";
import AdminNotice from "@/components/AdminNotice";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminQuoteFields from "@/components/AdminQuoteFields";
import AdminSubmitButton from "@/components/AdminSubmitButton";
import Badge from "@/components/Badge";
import { triageRequestAction } from "@/app/admin/_actions/requests";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTime, formatMoney } from "@/lib/format";
import {
  QUOTE_STATUS_LABEL,
  REQUEST_PRIORITY_LABEL,
  REQUEST_STATUS_LABEL,
  priorityTone,
  quoteTone,
  requestTone,
} from "@/lib/types";
import type {
  Client,
  ClientRequest,
  QuoteStatus,
  RequestPriority,
  RequestStatus,
} from "@/lib/types";

type SearchParams = Promise<{
  client?: string;
  status?: string;
  quote?: string;
  notice?: string | string[];
  error?: string | string[];
}>;

type RequestWithRelations = ClientRequest & {
  client: Pick<Client, "id" | "name"> | null;
  creator: { full_name: string | null; email: string } | null;
};

const statuses = Object.entries(REQUEST_STATUS_LABEL) as [RequestStatus, string][];
const priorities = Object.entries(REQUEST_PRIORITY_LABEL) as [RequestPriority, string][];
const quoteStates = Object.entries(QUOTE_STATUS_LABEL) as [QuoteStatus, string][];

/** How the pricing on a request reads at a glance. */
function quoteSummary(request: ClientRequest): string {
  if (request.quote_status === "none") return "Not priced yet";
  if (request.quote_status === "free") return "No charge";
  if (request.quote_amount_minor === null) return QUOTE_STATUS_LABEL[request.quote_status];
  return `${QUOTE_STATUS_LABEL[request.quote_status]} · ${formatMoney(
    request.quote_amount_minor,
    request.quote_currency,
  )}`;
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
  const quoteFilter = quoteStates.some(([state]) => state === params.quote)
    ? (params.quote as QuoteStatus)
    : "";

  let request = supabase
    .from("requests")
    .select(
      "id, client_id, created_by, subject, body, status, priority, admin_notes, quote_status, quote_amount_minor, quote_currency, quote_note, quoted_at, created_at, updated_at, resolved_at, client:clients(id, name), creator:profiles!requests_created_by_fkey(full_name, email)",
    )
    .order("created_at", { ascending: false });
  if (clientFilter) request = request.eq("client_id", clientFilter);
  if (statusFilter) request = request.eq("status", statusFilter);
  if (quoteFilter) request = request.eq("quote_status", quoteFilter);
  const requestsResult = await request;
  const requests = (requestsResult.data ?? []) as unknown as RequestWithRelations[];
  const loadError = clientsResult.error?.message ?? requestsResult.error?.message;

  const awaitingQuote = requests.filter(
    (item) => item.quote_status === "none" && item.status !== "resolved",
  );

  const returnParams = new URLSearchParams();
  if (clientFilter) returnParams.set("client", clientFilter);
  if (statusFilter) returnParams.set("status", statusFilter);
  if (quoteFilter) returnParams.set("quote", quoteFilter);
  const returnTo = `/admin/requests${returnParams.size ? `?${returnParams}` : ""}`;

  return (
    <>
      <AdminPageHeader
        eyebrow="Client management"
        title="Requests"
        description="What clients have asked for. A filed request is fixed; you own its status, its priority and what it costs them."
      />
      <AdminNotice notice={params.notice} error={params.error} />
      {loadError ? (
        <p className="notice notice-error" role="alert">
          Requests could not be loaded: {loadError}
        </p>
      ) : null}

      {awaitingQuote.length ? (
        <p className="notice notice-info" role="status">
          {awaitingQuote.length} open{" "}
          {awaitingQuote.length === 1 ? "request has" : "requests have"} no pricing yet.
        </p>
      ) : null}

      <form method="get" className="card flex flex-col gap-3 lg:flex-row lg:items-end">
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
        <label className="field m-0 flex-1">
          <span className="field-label">Pricing</span>
          <select className="select" name="quote" defaultValue={quoteFilter}>
            <option value="">Any pricing</option>
            {quoteStates.map(([value, label]) => (
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
          <span className="mono text-[0.6875rem] text-ink-45">
            {requests.length} {requests.length === 1 ? "request" : "requests"}
          </span>
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
                      Filed {formatDateTime(item.created_at)} by{" "}
                      {item.creator?.full_name || item.creator?.email || "Unknown user"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={quoteTone(item.quote_status)}>{quoteSummary(item)}</Badge>
                    <Badge tone={priorityTone(item.priority)}>
                      {REQUEST_PRIORITY_LABEL[item.priority]} priority
                    </Badge>
                    <Badge tone={requestTone(item.status)}>{REQUEST_STATUS_LABEL[item.status]}</Badge>
                  </div>
                </header>

                <div className="prose-block whitespace-pre-wrap py-5 text-[0.9375rem]">
                  <p>{item.body}</p>
                </div>

                {item.quote_note ? (
                  <p className="mb-5 border-l-2 border-pine bg-pine-wash p-3 text-[0.8125rem] text-ink-70">
                    <span className="eyebrow eyebrow-pine mb-1 block">Quote note to client</span>
                    {item.quote_note}
                  </p>
                ) : null}

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

                  <AdminQuoteFields
                    defaultStatus={item.quote_status}
                    defaultAmount={
                      item.quote_amount_minor === null
                        ? ""
                        : (item.quote_amount_minor / 100).toFixed(2)
                    }
                    defaultCurrency={item.quote_currency}
                    defaultNote={item.quote_note ?? ""}
                  />

                  <label className="field">
                    <span className="field-label">Internal notes</span>
                    <textarea
                      className="textarea"
                      name="admin_notes"
                      defaultValue={item.admin_notes ?? ""}
                      maxLength={5000}
                      rows={2}
                      placeholder="Visible to admins only"
                    />
                  </label>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <AdminSubmitButton pendingLabel="Updating…">Update request</AdminSubmitButton>
                    <span className="mono text-[0.6875rem] text-ink-45">
                      {item.quoted_at ? `Quoted ${formatDateTime(item.quoted_at)}` : null}
                      {item.quoted_at && item.resolved_at ? " · " : null}
                      {item.resolved_at ? `Resolved ${formatDateTime(item.resolved_at)}` : null}
                    </span>
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
