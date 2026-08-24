import type { Metadata } from "next";
import Link from "next/link";
import Badge from "@/components/Badge";
import PortalPageHeader from "@/components/PortalPageHeader";
import { requireClient } from "@/lib/auth";
import { formatDate, formatMoney, renewalNote } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import {
  CLIENT_STATUS_LABEL,
  DOCUMENT_KIND_LABEL,
  ENGAGEMENT_STATUS_LABEL,
  REQUEST_STATUS_LABEL,
  SUBSCRIPTION_STATUS_LABEL,
  clientTone,
  engagementTone,
  requestTone,
  subscriptionTone,
  type Client,
  type ClientDocument,
  type ClientRequest,
  type ClientService,
  type Subscription,
} from "@/lib/types";

export const metadata: Metadata = { title: "Overview" };

export default async function PortalDashboardPage() {
  const profile = await requireClient();
  const supabase = await createClient();

  const [clientResult, engagementResult, subscriptionResult, requestResult, documentResult] =
    await Promise.all([
      supabase
        .from("clients")
        .select("id, name, legal_name, status, industry, primary_contact_name, primary_contact_email, created_at")
        .eq("id", profile.client_id)
        .maybeSingle(),
      supabase
        .from("client_services")
        .select(
          "id, client_id, service_id, status, started_on, ended_on, owner_name, created_at, service:services(id, code, name, summary, category, is_active, sort_order)",
        )
        .eq("client_id", profile.client_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("subscriptions")
        .select(
          "id, client_id, plan_name, status, billing_period, amount_minor, currency, started_on, renews_on, cancelled_at, created_at",
        )
        .eq("client_id", profile.client_id)
        .order("renews_on", { ascending: true, nullsFirst: false }),
      supabase
        .from("requests")
        .select(
          "id, client_id, created_by, subject, body, status, priority, created_at, resolved_at",
        )
        .eq("client_id", profile.client_id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("documents")
        .select(
          "id, client_id, title, kind, storage_path, size_bytes, uploaded_by, created_at",
        )
        .eq("client_id", profile.client_id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const client = clientResult.data as Client | null;
  const engagements = (engagementResult.data ?? []) as unknown as ClientService[];
  const subscriptions = (subscriptionResult.data ?? []) as Subscription[];
  const requests = (requestResult.data ?? []) as ClientRequest[];
  const documents = (documentResult.data ?? []) as ClientDocument[];
  const hasQueryError = [
    clientResult.error,
    engagementResult.error,
    subscriptionResult.error,
    requestResult.error,
    documentResult.error,
  ].some(Boolean);
  const currentSubscription = subscriptions.find(
    (subscription) =>
      subscription.status === "active" || subscription.status === "trialing",
  );

  return (
    <>
      <PortalPageHeader
        eyebrow="Overview"
        title={client ? client.name : "Your client portal"}
        description={`Welcome${profile.full_name ? `, ${profile.full_name}` : ""}. This is the current record of your work with Marters & Co.`}
        action={
          <Link href="/portal/requests#new-request" className="btn btn-primary">
            New request
          </Link>
        }
      />

      {hasQueryError && (
        <p className="notice notice-error" role="alert">
          Some portal information could not be loaded. Refresh the page or try
          again shortly.
        </p>
      )}

      <section aria-labelledby="account-heading" className="mb-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="account-heading" className="display-s text-ink">
            Account
          </h2>
          {client && (
            <Badge tone={clientTone(client.status)}>
              {CLIENT_STATUS_LABEL[client.status]}
            </Badge>
          )}
        </div>

        {client ? (
          <div className="card grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="eyebrow mb-2">Organisation</span>
              <p className="font-medium text-ink">{client.name}</p>
              {client.legal_name && client.legal_name !== client.name && (
                <p className="mt-1 text-[0.8125rem] text-ink-45">
                  {client.legal_name}
                </p>
              )}
            </div>
            <div>
              <span className="eyebrow mb-2">Industry</span>
              <p className="text-ink-70">{client.industry || "Not specified"}</p>
            </div>
            <div>
              <span className="eyebrow mb-2">Primary contact</span>
              <p className="text-ink-70">
                {client.primary_contact_name || "Not specified"}
              </p>
            </div>
            <div>
              <span className="eyebrow mb-2">Engagements</span>
              <p className="mono text-ink">
                {engagementResult.error ? "—" : engagements.length}
              </p>
            </div>
          </div>
        ) : (
          <div className="empty">Organisation details are unavailable.</div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="engagements-heading">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="engagements-heading" className="display-s text-ink">
              Engagements
            </h2>
            <Link href="/portal/engagements" className="link-rule text-[0.8125rem]">
              View all
            </Link>
          </div>
          {engagementResult.error ? (
            <div className="empty">Engagements could not be loaded.</div>
          ) : engagements.length ? (
            <div className="divide-y divide-rule border border-rule bg-paper">
              {engagements.slice(0, 4).map((engagement) => (
                <div
                  key={engagement.id}
                  className="flex items-start justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink">
                      {engagement.service?.name ?? "Service engagement"}
                    </p>
                    <p className="mt-1 text-[0.8125rem] text-ink-45">
                      Started {formatDate(engagement.started_on)}
                    </p>
                  </div>
                  <Badge tone={engagementTone(engagement.status)}>
                    {ENGAGEMENT_STATUS_LABEL[engagement.status]}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No engagements have been added yet.</div>
          )}
        </section>

        <section aria-labelledby="subscription-heading">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="subscription-heading" className="display-s text-ink">
              Subscription
            </h2>
            <Link
              href="/portal/subscriptions"
              className="link-rule text-[0.8125rem]"
            >
              View all
            </Link>
          </div>
          {subscriptionResult.error ? (
            <div className="empty">Subscriptions could not be loaded.</div>
          ) : currentSubscription ? (
            <div className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-ink">
                    {currentSubscription.plan_name}
                  </p>
                  <p className="mono mt-2 text-[1.25rem] text-ink">
                    {formatMoney(
                      currentSubscription.amount_minor,
                      currentSubscription.currency,
                    )}
                  </p>
                  <p className="mt-1 text-[0.8125rem] capitalize text-ink-45">
                    {currentSubscription.billing_period}
                  </p>
                </div>
                <Badge tone={subscriptionTone(currentSubscription.status)}>
                  {SUBSCRIPTION_STATUS_LABEL[currentSubscription.status]}
                </Badge>
              </div>
              <div className="mt-6 border-t border-rule pt-4">
                <p className="text-[0.875rem] text-ink-70">
                  {renewalNote(currentSubscription.renews_on)}
                </p>
                <p className="mono mt-1 text-[0.75rem] text-ink-45">
                  {formatDate(currentSubscription.renews_on)}
                </p>
              </div>
            </div>
          ) : subscriptions.length ? (
            <div className="empty">There is no active subscription.</div>
          ) : (
            <div className="empty">No subscriptions have been added yet.</div>
          )}
        </section>

        <section aria-labelledby="requests-heading">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="requests-heading" className="display-s text-ink">
              Recent requests
            </h2>
            <Link href="/portal/requests" className="link-rule text-[0.8125rem]">
              View all
            </Link>
          </div>
          {requestResult.error ? (
            <div className="empty">Requests could not be loaded.</div>
          ) : requests.length ? (
            <div className="divide-y divide-rule border border-rule bg-paper">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-start justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {request.subject}
                    </p>
                    <p className="mono mt-1 text-[0.6875rem] text-ink-45">
                      {formatDate(request.created_at)}
                    </p>
                  </div>
                  <Badge tone={requestTone(request.status)}>
                    {REQUEST_STATUS_LABEL[request.status]}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No requests have been filed.</div>
          )}
        </section>

        <section aria-labelledby="documents-heading">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="documents-heading" className="display-s text-ink">
              Recent documents
            </h2>
            <Link href="/portal/documents" className="link-rule text-[0.8125rem]">
              View all
            </Link>
          </div>
          {documentResult.error ? (
            <div className="empty">Documents could not be loaded.</div>
          ) : documents.length ? (
            <div className="divide-y divide-rule border border-rule bg-paper">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {document.title}
                    </p>
                    <p className="mt-1 text-[0.75rem] text-ink-45">
                      {DOCUMENT_KIND_LABEL[document.kind]} ·{" "}
                      <span className="mono">{formatDate(document.created_at)}</span>
                    </p>
                  </div>
                  <a
                    href={`/portal/documents/${document.id}/download`}
                    className="btn btn-secondary btn-sm"
                    aria-label={`Download ${document.title}`}
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No documents are available yet.</div>
          )}
        </section>
      </div>
    </>
  );
}
