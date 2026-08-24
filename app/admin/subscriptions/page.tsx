import AdminNotice from "@/components/AdminNotice";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminSubmitButton from "@/components/AdminSubmitButton";
import Badge from "@/components/Badge";
import {
  createSubscriptionAction,
  deleteSubscriptionAction,
  updateSubscriptionAction,
} from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatMoney, renewalNote } from "@/lib/format";
import {
  SUBSCRIPTION_STATUS_LABEL,
  subscriptionTone,
} from "@/lib/types";
import type {
  BillingPeriod,
  Client,
  Subscription,
  SubscriptionStatus,
} from "@/lib/types";

type SearchParams = Promise<{
  client?: string;
  notice?: string | string[];
  error?: string | string[];
}>;

type SubscriptionWithClient = Subscription & { client: Pick<Client, "id" | "name"> | null };
const statuses = Object.entries(SUBSCRIPTION_STATUS_LABEL) as [SubscriptionStatus, string][];
const periods: [BillingPeriod, string][] = [
  ["monthly", "Monthly"],
  ["quarterly", "Quarterly"],
  ["annual", "Annual"],
];

export default async function SubscriptionsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = createAdminClient();
  const clientsResult = await supabase.from("clients").select("id, name").order("name");
  const clients = (clientsResult.data ?? []) as Pick<Client, "id" | "name">[];
  const clientFilter = clients.some((client) => client.id === params.client) ? params.client! : "";

  let request = supabase
    .from("subscriptions")
    .select(
      "id, client_id, plan_name, status, billing_period, amount_minor, currency, started_on, renews_on, cancelled_at, notes, created_at, updated_at, client:clients(id, name)",
    )
    .order("created_at", { ascending: false });
  if (clientFilter) request = request.eq("client_id", clientFilter);
  const subscriptionsResult = await request;
  const subscriptions = (subscriptionsResult.data ?? []) as unknown as SubscriptionWithClient[];
  const loadError = clientsResult.error?.message ?? subscriptionsResult.error?.message;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <AdminPageHeader
        eyebrow="Commercial"
        title="Subscriptions"
        description="Recurring programmes, billing periods, status, and renewal dates. Amounts are stored in minor units."
        action={
          <a href="#new-subscription" className="btn btn-primary">
            Add a subscription
          </a>
        }
      />
      <AdminNotice notice={params.notice} error={params.error} />
      {loadError ? (
        <p className="notice notice-error" role="alert">
          Subscription data could not be loaded: {loadError}
        </p>
      ) : null}

      <section id="new-subscription" className="card scroll-mt-6">
        <details>
          <summary className="cursor-pointer font-medium">Create a subscription</summary>
          {clients.length ? (
            <form action={createSubscriptionAction} className="mt-6">
              <input type="hidden" name="returnTo" value="/admin/subscriptions" />
              <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-4">
                <label className="field sm:col-span-2">
                  <span className="field-label">Client</span>
                  <select className="select" name="client_id" defaultValue={clientFilter} required>
                    <option value="" disabled>
                      Choose a client
                    </option>
                    {clients.map((client) => (
                      <option value={client.id} key={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field sm:col-span-2">
                  <span className="field-label">Plan name</span>
                  <input className="input" name="plan_name" required maxLength={200} />
                </label>
                <label className="field">
                  <span className="field-label">Status</span>
                  <select className="select" name="status" defaultValue="active">
                    {statuses.map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field-label">Billing period</span>
                  <select className="select" name="billing_period" defaultValue="monthly">
                    {periods.map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field-label">Amount</span>
                  <input className="input mono" name="amount" inputMode="decimal" defaultValue="0.00" required />
                </label>
                <label className="field">
                  <span className="field-label">Currency</span>
                  <input className="input mono uppercase" name="currency" defaultValue="AED" minLength={3} maxLength={3} required />
                </label>
                <label className="field">
                  <span className="field-label">Start date</span>
                  <input className="input" name="started_on" type="date" defaultValue={today} required />
                </label>
                <label className="field">
                  <span className="field-label">Renewal date</span>
                  <input className="input" name="renews_on" type="date" />
                </label>
              </div>
              <label className="field">
                <span className="field-label">Notes</span>
                <textarea className="textarea" name="notes" maxLength={5000} />
              </label>
              <AdminSubmitButton pendingLabel="Creating…">Create subscription</AdminSubmitButton>
            </form>
          ) : (
            <p className="notice notice-info mt-4">Create a client before adding a subscription.</p>
          )}
        </details>
      </section>

      <section className="mt-10" aria-labelledby="subscription-list-title">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="subscription-list-title" className="display-s">
              Subscription register
            </h2>
            <p className="mono mt-1 text-[0.6875rem] text-ink-45">{subscriptions.length} records</p>
          </div>
          <form method="get" className="flex gap-2">
            <label>
              <span className="sr-only">Filter by client</span>
              <select className="select min-w-[14rem]" name="client" defaultValue={clientFilter}>
                <option value="">All clients</option>
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

        {subscriptions.length ? (
          <div className="space-y-3">
            {subscriptions.map((subscription) => (
              <details key={subscription.id} className="card">
                <summary className="cursor-pointer list-none">
                  <span className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                    <span>
                      <strong className="block text-[0.9375rem]">{subscription.plan_name}</strong>
                      <span className="mt-1 block text-[0.8125rem] text-ink-45">
                        {subscription.client?.name ?? "Unknown client"} · {renewalNote(subscription.renews_on)}
                      </span>
                    </span>
                    <span className="mono text-[0.8125rem] text-ink">
                      {formatMoney(subscription.amount_minor, subscription.currency)} / {subscription.billing_period}
                    </span>
                    <Badge tone={subscriptionTone(subscription.status)}>
                      {SUBSCRIPTION_STATUS_LABEL[subscription.status]}
                    </Badge>
                  </span>
                </summary>
                <form action={updateSubscriptionAction} className="mt-6 border-t border-rule pt-6">
                  <input type="hidden" name="id" value={subscription.id} />
                  <input type="hidden" name="returnTo" value="/admin/subscriptions" />
                  <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="field sm:col-span-2">
                      <span className="field-label">Client</span>
                      <select className="select" name="client_id" defaultValue={subscription.client_id} required>
                        {clients.map((client) => (
                          <option value={client.id} key={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field sm:col-span-2">
                      <span className="field-label">Plan name</span>
                      <input className="input" name="plan_name" defaultValue={subscription.plan_name} required maxLength={200} />
                    </label>
                    <label className="field">
                      <span className="field-label">Status</span>
                      <select className="select" name="status" defaultValue={subscription.status}>
                        {statuses.map(([value, label]) => (
                          <option value={value} key={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span className="field-label">Billing period</span>
                      <select className="select" name="billing_period" defaultValue={subscription.billing_period}>
                        {periods.map(([value, label]) => (
                          <option value={value} key={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span className="field-label">Amount</span>
                      <input
                        className="input mono"
                        name="amount"
                        inputMode="decimal"
                        defaultValue={(subscription.amount_minor / 100).toFixed(2)}
                        required
                      />
                    </label>
                    <label className="field">
                      <span className="field-label">Currency</span>
                      <input
                        className="input mono uppercase"
                        name="currency"
                        defaultValue={subscription.currency}
                        minLength={3}
                        maxLength={3}
                        required
                      />
                    </label>
                    <label className="field">
                      <span className="field-label">Start date</span>
                      <input className="input" name="started_on" type="date" defaultValue={subscription.started_on} required />
                    </label>
                    <label className="field">
                      <span className="field-label">Renewal date</span>
                      <input className="input" name="renews_on" type="date" defaultValue={subscription.renews_on ?? ""} />
                    </label>
                  </div>
                  <label className="field">
                    <span className="field-label">Notes</span>
                    <textarea className="textarea" name="notes" defaultValue={subscription.notes ?? ""} maxLength={5000} />
                  </label>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <AdminSubmitButton>Save subscription</AdminSubmitButton>
                    <span className="mono text-[0.6875rem] text-ink-45">
                      Started {formatDate(subscription.started_on)}
                    </span>
                  </div>
                </form>
                <form action={deleteSubscriptionAction} className="mt-5 border-t border-rule pt-5">
                  <input type="hidden" name="id" value={subscription.id} />
                  <input type="hidden" name="returnTo" value="/admin/subscriptions" />
                  <AdminSubmitButton
                    tone="danger"
                    pendingLabel="Deleting…"
                    confirmMessage={`Delete the ${subscription.plan_name} subscription?`}
                  >
                    Delete subscription
                  </AdminSubmitButton>
                </form>
              </details>
            ))}
          </div>
        ) : (
          <div className="empty">
            {clientFilter ? "This client has no subscriptions." : "No subscriptions have been recorded."}
          </div>
        )}
      </section>
    </>
  );
}
