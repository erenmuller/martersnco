import Link from "next/link";
import AdminNotice from "@/components/AdminNotice";
import AdminPageHeader from "@/components/AdminPageHeader";
import Badge from "@/components/Badge";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatMoney, renewalNote } from "@/lib/format";
import {
  requestTone,
  subscriptionTone,
  REQUEST_STATUS_LABEL,
  SUBSCRIPTION_STATUS_LABEL,
} from "@/lib/types";
import type { RequestStatus, SubscriptionStatus } from "@/lib/types";

type SearchParams = Promise<{
  notice?: string | string[];
  error?: string | string[];
}>;

type RecentRequest = {
  id: string;
  subject: string;
  status: RequestStatus;
  priority: string;
  created_at: string;
  client: { name: string } | null;
};

type Renewal = {
  id: string;
  plan_name: string;
  status: SubscriptionStatus;
  amount_minor: number;
  currency: string;
  renews_on: string | null;
  client: { name: string } | null;
};

export default async function AdminDashboard({ searchParams }: { searchParams: SearchParams }) {
  // The lead count uses the service-role client, so authorize in this page as
  // well as the layout before any privileged query can run.
  await requireAdmin();
  const params = await searchParams;
  const supabase = await createClient();

  const [clients, engagements, subscriptions, requests, recentRequests, renewals] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("client_services")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", ["trialing", "active"]),
    supabase
      .from("requests")
      .select("id", { count: "exact", head: true })
      .neq("status", "resolved"),
    supabase
      .from("requests")
      .select("id, subject, status, priority, created_at, client:clients(name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("subscriptions")
      .select("id, plan_name, status, amount_minor, currency, renews_on, client:clients(name)")
      .in("status", ["trialing", "active"])
      .not("renews_on", "is", null)
      .order("renews_on", { ascending: true })
      .limit(5),
  ]);

  let unhandledLeads: number | null = null;
  let leadError: string | null = null;
  try {
    const admin = createAdminClient();
    const result = await admin
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("handled", false);
    if (result.error) leadError = result.error.message;
    else unhandledLeads = result.count ?? 0;
  } catch (error) {
    leadError = error instanceof Error ? error.message : "Lead inbox is unavailable.";
  }

  const queryError = [clients, engagements, subscriptions, requests, recentRequests, renewals]
    .map((result) => result.error?.message)
    .find(Boolean);

  const stats = [
    { label: "Active clients", value: clients.count, href: "/admin/clients" },
    { label: "Live engagements", value: engagements.count, href: "/admin/clients" },
    { label: "Live subscriptions", value: subscriptions.count, href: "/admin/subscriptions" },
    { label: "Open requests", value: requests.count, href: "/admin/requests" },
    { label: "Unhandled leads", value: unhandledLeads, href: "/admin/leads" },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Operations"
        title="Admin overview"
        description="Live operational data only. Counts and queues come directly from the current Supabase project."
        action={
          <Link href="/admin/clients#new-client" className="btn btn-primary">
            Add a client
          </Link>
        }
      />
      <AdminNotice notice={params.notice} error={params.error} />
      {queryError ? (
        <p className="notice notice-error" role="alert">
          Some operational data could not be loaded: {queryError}
        </p>
      ) : null}
      {leadError ? (
        <p className="notice notice-info" role="status">
          Lead count unavailable: {leadError}
        </p>
      ) : null}

      <section aria-labelledby="admin-counts">
        <h2 id="admin-counts" className="sr-only">
          Current counts
        </h2>
        <div className="grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="group bg-paper p-5 hover:bg-shade">
              <span className="eyebrow">{stat.label}</span>
              <strong className="figure-xl mt-4 block group-hover:text-pine">
                {stat.value ?? "—"}
              </strong>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="recent-requests">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="recent-requests" className="display-s">
              Recent requests
            </h2>
            <Link href="/admin/requests" className="link-rule text-[0.8125rem]">
              All requests →
            </Link>
          </div>
          {recentRequests.data?.length ? (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Status</th>
                    <th>Filed</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentRequests.data as unknown as RecentRequest[]).map((request) => (
                    <tr key={request.id}>
                      <td className="primary">
                        <Link href={`/admin/requests#request-${request.id}`} className="hover:text-pine">
                          {request.subject}
                        </Link>
                        <span className="mt-1 block text-[0.75rem] font-normal text-ink-45">
                          {request.client?.name ?? "Unknown client"}
                        </span>
                      </td>
                      <td>
                        <Badge tone={requestTone(request.status)}>
                          {REQUEST_STATUS_LABEL[request.status]}
                        </Badge>
                      </td>
                      <td className="num">{formatDateTime(request.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">No requests have been filed.</div>
          )}
        </section>

        <section aria-labelledby="upcoming-renewals">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="upcoming-renewals" className="display-s">
              Upcoming renewals
            </h2>
            <Link href="/admin/subscriptions" className="link-rule text-[0.8125rem]">
              All subscriptions →
            </Link>
          </div>
          {renewals.data?.length ? (
            <div className="space-y-px bg-rule">
              {(renewals.data as unknown as Renewal[]).map((renewal) => (
                <article key={renewal.id} className="flex items-start justify-between gap-5 bg-paper p-4">
                  <div>
                    <h3 className="text-[0.9375rem] font-semibold">{renewal.plan_name}</h3>
                    <p className="mt-1 text-[0.8125rem] text-ink-45">
                      {renewal.client?.name ?? "Unknown client"} · {renewalNote(renewal.renews_on)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge tone={subscriptionTone(renewal.status)}>
                      {SUBSCRIPTION_STATUS_LABEL[renewal.status]}
                    </Badge>
                    <p className="mono mt-2 text-[0.75rem] text-ink-70">
                      {formatMoney(renewal.amount_minor, renewal.currency)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">No dated renewals are scheduled.</div>
          )}
        </section>
      </div>
    </>
  );
}
