import type { Metadata } from "next";
import Badge from "@/components/Badge";
import PortalPageHeader from "@/components/PortalPageHeader";
import PortalRequestForm from "@/components/PortalRequestForm";
import { requireClient } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import {
  REQUEST_STATUS_LABEL,
  requestTone,
  type ClientRequest,
  type RequestPriority,
} from "@/lib/types";

export const metadata: Metadata = { title: "Requests" };

const priorityLabel: Record<RequestPriority, string> = {
  low: "Low priority",
  normal: "Normal priority",
  high: "High priority",
};

export default async function RequestsPage() {
  const profile = await requireClient();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .select(
      "id, client_id, created_by, subject, body, status, priority, created_at, resolved_at",
    )
    .eq("client_id", profile.client_id)
    .order("created_at", { ascending: false });
  const requests = (data ?? []) as ClientRequest[];

  return (
    <>
      <PortalPageHeader
        eyebrow="Support"
        title="Requests"
        description="File a question, change or issue and follow its current status. Submitted requests remain fixed so there is a clear record."
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]">
        <section aria-labelledby="request-history-heading">
          <h2 id="request-history-heading" className="display-s mb-4 text-ink">
            Request history
          </h2>

          {error ? (
            <p className="notice notice-error" role="alert">
              Requests could not be loaded. Refresh the page or try again shortly.
            </p>
          ) : requests.length ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <article key={request.id} className="card">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-medium text-ink">{request.subject}</h3>
                      <p className="mono mt-1 text-[0.6875rem] text-ink-45">
                        {formatDateTime(request.created_at)} ·{" "}
                        {priorityLabel[request.priority]}
                      </p>
                    </div>
                    <Badge tone={requestTone(request.status)}>
                      {REQUEST_STATUS_LABEL[request.status]}
                    </Badge>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-[0.875rem] leading-relaxed text-ink-70">
                    {request.body}
                  </p>
                  {request.resolved_at && (
                    <p className="mono mt-4 border-t border-rule pt-3 text-[0.6875rem] text-ink-45">
                      Resolved {formatDateTime(request.resolved_at)}
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">No requests have been filed yet.</div>
          )}
        </section>

        <section
          id="new-request"
          aria-labelledby="new-request-heading"
          className="card scroll-mt-28 lg:sticky lg:top-5"
        >
          <span className="eyebrow eyebrow-pine mb-2">New</span>
          <h2 id="new-request-heading" className="display-s mb-5 text-ink">
            File a request
          </h2>
          <PortalRequestForm />
        </section>
      </div>
    </>
  );
}
