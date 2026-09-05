import Link from "next/link";
import AdminNotice from "@/components/AdminNotice";
import AdminPageHeader from "@/components/AdminPageHeader";
import Badge from "@/components/Badge";
import { WORKING_SECTIONS } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime, formatMoney, renewalNote } from "@/lib/format";
import {
  PAYMENT_STATE_LABEL,
  REQUEST_STATUS_LABEL,
  paymentTone,
  requestTone,
} from "@/lib/types";
import type { PaymentState, QuoteStatus, RequestStatus } from "@/lib/types";

type SearchParams = Promise<{
  notice?: string | string[];
  error?: string | string[];
}>;

type RecentRequest = {
  id: string;
  subject: string;
  status: RequestStatus;
  quote_status: QuoteStatus;
  created_at: string;
  client: { name: string } | null;
};

type Renewal = {
  id: string;
  plan_name: string;
  amount_minor: number;
  currency: string;
  renews_on: string | null;
  payment_status: PaymentState;
  client: { name: string } | null;
};

export default async function AdminDashboard({ searchParams }: { searchParams: SearchParams }) {
  // The lead count uses the service-role client, so authorize in this page as
  // well as the layout before any privileged query can run.
  await requireAdmin();
  const params = await searchParams;
  const supabase = await createClient();

  const [
    clients,
    openRequests,
    unpricedRequests,
    liveSubscriptions,
    unpaidSubscriptions,
    draftEditions,
    recentRequests,
    renewals,
  ] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("requests").select("id", { count: "exact", head: true }).neq("status", "resolved"),
    supabase
      .from("requests")
      .select("id", { count: "exact", head: true })
      .eq("quote_status", "none")
      .neq("status", "resolved"),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", ["trialing", "active"]),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", ["trialing", "active"])
      .eq("payment_status", "unpaid"),
    supabase
      .from("newsletter_editions")
      .select("id", { count: "exact", head: true })
      .neq("status", "sent"),
    supabase
      .from("requests")
      .select("id, subject, status, quote_status, created_at, client:clients(name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("subscriptions")
      .select("id, plan_name, amount_minor, currency, renews_on, payment_status, client:clients(name)")
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

  const queryError = [
    clients,
    openRequests,
    unpricedRequests,
    liveSubscriptions,
    unpaidSubscriptions,
    draftEditions,
    recentRequests,
    renewals,
  ]
    .map((result) => result.error?.message)
    .find(Boolean);

  // Ordered by how quickly each one costs something if it is ignored.
  const attention = [
    {
      label: "Unhandled leads",
      value: unhandledLeads,
      href: "/admin/leads",
      note: "New enquiries from the site",
    },
    {
      label: "Requests to price",
      value: unpricedRequests.count,
      href: "/admin/requests?quote=none",
      note: "Open and not yet quoted",
    },
    {
      label: "Unpaid periods",
      value: unpaidSubscriptions.count,
      href: "/admin/subscriptions?paid=unpaid",
      note: "Live plans awaiting payment",
    },
    {
      label: "Open requests",
      value: openRequests.count,
      href: "/admin/requests",
      note: "Anything not yet resolved",
    },
  ];

  const totals = [
    { label: "Active clients", value: clients.count, href: "/admin/clients" },
    { label: "Live subscriptions", value: liveSubscriptions.count, href: "/admin/subscriptions" },
    { label: "Editions in progress", value: draftEditions.count, href: "/admin/newsletter" },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Overview"
        title="Admin console"
        description="What needs a decision today, and the way into everything else. All figures come straight from the live database."
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

      <section aria-labelledby="needs-attention">
        <h2 id="needs-attention" className="display-s mb-4">
          Needs attention
        </h2>
        <div className="grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
          {attention.map((item) => (
            <Link key={item.label} href={item.href} className="group bg-paper p-5 hover:bg-shade">
              <span className="eyebrow">{item.label}</span>
              <strong className="figure-xl mt-3 block group-hover:text-pine">
                {item.value ?? "—"}
              </strong>
              <span className="mt-2 block text-[0.75rem] text-ink-45">{item.note}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="totals">
        <h2 id="totals" className="sr-only">
          Current totals
        </h2>
        <div className="grid gap-px border border-rule bg-rule sm:grid-cols-3">
          {totals.map((item) => (
            <Link key={item.label} href={item.href} className="group bg-paper p-4 hover:bg-shade">
              <span className="eyebrow">{item.label}</span>
              <strong className="figure-xl mt-3 block group-hover:text-pine">
                {item.value ?? "—"}
              </strong>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
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
                        <Link
                          href={`/admin/requests#request-${request.id}`}
                          className="hover:text-pine"
                        >
                          {request.subject}
                        </Link>
                        <span className="mt-1 block text-[0.75rem] font-normal text-ink-45">
                          {request.client?.name ?? "Unknown client"}
                          {request.quote_status === "none" ? " · not priced" : ""}
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
                <article
                  key={renewal.id}
                  className="flex items-start justify-between gap-5 bg-paper p-4"
                >
                  <div>
                    <h3 className="text-[0.9375rem] font-semibold">{renewal.plan_name}</h3>
                    <p className="mt-1 text-[0.8125rem] text-ink-45">
                      {renewal.client?.name ?? "Unknown client"} · {renewalNote(renewal.renews_on)}
                    </p>
                    <p className="mono mt-1 text-[0.6875rem] text-ink-45">
                      {formatDate(renewal.renews_on)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge tone={paymentTone(renewal.payment_status)}>
                      {PAYMENT_STATE_LABEL[renewal.payment_status]}
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

      <section className="mt-14" aria-labelledby="sections">
        <h2 id="sections" className="display-s mb-4">
          Everything else
        </h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {WORKING_SECTIONS.map((section) => (
            <div key={section.id} className="card">
              <span className="eyebrow eyebrow-pine">{section.label}</span>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-70">{section.blurb}</p>
              <ul className="mt-4 list-none space-y-3 border-t border-rule p-0 pt-4">
                {section.pages.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="text-[0.875rem] font-medium text-ink hover:text-pine"
                    >
                      {page.label}
                    </Link>
                    <span className="mt-0.5 block text-[0.75rem] leading-relaxed text-ink-45">
                      {page.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
