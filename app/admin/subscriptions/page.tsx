import Link from "next/link";
import AdminNotice from "@/components/AdminNotice";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminSubmitButton from "@/components/AdminSubmitButton";
import AdminSubscriptionFields from "@/components/AdminSubscriptionFields";
import Badge from "@/components/Badge";
import {
  createSubscriptionAction,
  deleteSubscriptionAction,
  setSubscriptionPaymentAction,
  updateSubscriptionAction,
} from "@/app/admin/_actions/subscriptions";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatMoney, renewalNote } from "@/lib/format";
import {
  BILLING_PERIOD_LABEL,
  PAYMENT_STATE_LABEL,
  SUBSCRIPTION_STATUS_LABEL,
  paymentTone,
  subscriptionTone,
} from "@/lib/types";
import type { Client, PaymentState, Subscription } from "@/lib/types";

type SearchParams = Promise<{
  client?: string;
  paid?: string;
  notice?: string | string[];
  error?: string | string[];
}>;

type SubscriptionWithClient = Subscription & { client: Pick<Client, "id" | "name"> | null };

const LIVE_STATUSES = ["active", "trialing"] as const;

function isLive(subscription: Subscription): boolean {
  return (LIVE_STATUSES as readonly string[]).includes(subscription.status);
}

export default async function SubscriptionsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = createAdminClient();
  const clientsResult = await supabase.from("clients").select("id, name").order("name");
  const clients = (clientsResult.data ?? []) as Pick<Client, "id" | "name">[];
  const clientFilter = clients.some((client) => client.id === params.client) ? params.client! : "";
  const paidFilter: PaymentState | "" =
    params.paid === "paid" || params.paid === "unpaid" ? params.paid : "";

  let request = supabase
    .from("subscriptions")
    .select(
      "id, client_id, plan_name, status, billing_period, amount_minor, currency, started_on, renews_on, cancelled_at, payment_status, paid_on, notes, created_at, updated_at, client:clients(id, name)",
    )
    .order("created_at", { ascending: false });
  if (clientFilter) request = request.eq("client_id", clientFilter);
  if (paidFilter) request = request.eq("payment_status", paidFilter);
  const subscriptionsResult = await request;
  const subscriptions = (subscriptionsResult.data ?? []) as unknown as SubscriptionWithClient[];
  const loadError = clientsResult.error?.message ?? subscriptionsResult.error?.message;
  const today = new Date().toISOString().slice(0, 10);

  const live = subscriptions.filter(isLive);
  const awaitingPayment = live.filter((item) => item.payment_status === "unpaid");
  const lapsed = live.filter((item) => item.renews_on && item.renews_on < today);

  const returnParams = new URLSearchParams();
  if (clientFilter) returnParams.set("client", clientFilter);
  if (paidFilter) returnParams.set("paid", paidFilter);
  const returnTo = `/admin/subscriptions${returnParams.size ? `?${returnParams}` : ""}`;

  return (
    <>
      <AdminPageHeader
        eyebrow="Client management"
        title="Subscriptions"
        description="Recurring plans and their payment state. Pick a start date and a cycle; the renewal date follows from them unless you set your own."
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

      <div className="grid gap-px border border-rule bg-rule sm:grid-cols-3">
        <div className="bg-paper p-4">
          <span className="eyebrow">Live plans</span>
          <strong className="figure-xl mt-3 block">{live.length}</strong>
        </div>
        <div className="bg-paper p-4">
          <span className="eyebrow">Awaiting payment</span>
          <strong className="figure-xl mt-3 block">{awaitingPayment.length}</strong>
        </div>
        <div className="bg-paper p-4">
          <span className="eyebrow">Renewal passed</span>
          <strong className="figure-xl mt-3 block">{lapsed.length}</strong>
        </div>
      </div>

      <section id="new-subscription" className="card mt-8 scroll-mt-6">
        <details>
          <summary className="cursor-pointer font-medium">Create a subscription</summary>
          {clients.length ? (
            <form action={createSubscriptionAction} className="mt-6">
              <input type="hidden" name="returnTo" value={returnTo} />
              <div className="grid gap-x-5 sm:grid-cols-2">
                <label className="field">
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
                <label className="field">
                  <span className="field-label">Plan name</span>
                  <input className="input" name="plan_name" required maxLength={200} />
                </label>
              </div>
              <AdminSubscriptionFields defaultStartedOn={today} />
              <label className="field">
                <span className="field-label">Internal notes</span>
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
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="subscription-list-title" className="display-s">
              Subscription register
            </h2>
            <p className="mono mt-1 text-[0.6875rem] text-ink-45">
              {subscriptions.length} {subscriptions.length === 1 ? "record" : "records"}
            </p>
          </div>
          <form method="get" className="flex flex-col gap-2 sm:flex-row">
            <label>
              <span className="sr-only">Filter by client</span>
              <select className="select min-w-[13rem]" name="client" defaultValue={clientFilter}>
                <option value="">All clients</option>
                {clients.map((client) => (
                  <option value={client.id} key={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Filter by payment</span>
              <select className="select" name="paid" defaultValue={paidFilter}>
                <option value="">Paid and unpaid</option>
                <option value="unpaid">Not paid</option>
                <option value="paid">Paid</option>
              </select>
            </label>
            <button type="submit" className="btn btn-secondary">
              Filter
            </button>
          </form>
        </div>

        {subscriptions.length ? (
          <div className="space-y-4">
            {subscriptions.map((subscription) => {
              const overdue =
                isLive(subscription) &&
                subscription.payment_status === "unpaid" &&
                Boolean(subscription.renews_on && subscription.renews_on < today);

              return (
                <article className="card" key={subscription.id}>
                  <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-[1rem] font-semibold text-ink">{subscription.plan_name}</h3>
                      <p className="mt-1 text-[0.8125rem] text-ink-45">
                        {subscription.client ? (
                          <Link
                            href={`/admin/clients/${subscription.client.id}`}
                            className="hover:text-pine"
                          >
                            {subscription.client.name}
                          </Link>
                        ) : (
                          "Unknown client"
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {overdue ? <Badge tone="alert">Overdue</Badge> : null}
                      <Badge tone={paymentTone(subscription.payment_status)}>
                        {PAYMENT_STATE_LABEL[subscription.payment_status]}
                      </Badge>
                      <Badge tone={subscriptionTone(subscription.status)}>
                        {SUBSCRIPTION_STATUS_LABEL[subscription.status]}
                      </Badge>
                    </div>
                  </header>

                  <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-rule pt-4 text-[0.8125rem] lg:grid-cols-4">
                    <div>
                      <dt className="eyebrow mb-1">Amount</dt>
                      <dd className="mono text-ink">
                        {formatMoney(subscription.amount_minor, subscription.currency)}
                        <span className="text-ink-45">
                          {" "}
                          / {BILLING_PERIOD_LABEL[subscription.billing_period].toLowerCase()}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="eyebrow mb-1">Started</dt>
                      <dd className="mono text-ink-70">{formatDate(subscription.started_on)}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow mb-1">Renews</dt>
                      <dd className="mono text-ink-70">{formatDate(subscription.renews_on)}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow mb-1">Paid on</dt>
                      <dd className="mono text-ink-70">{formatDate(subscription.paid_on)}</dd>
                    </div>
                  </dl>

                  <p className="mt-3 text-[0.8125rem] text-ink-45">
                    {renewalNote(subscription.renews_on)}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-rule pt-5">
                    <form action={setSubscriptionPaymentAction}>
                      <input type="hidden" name="id" value={subscription.id} />
                      <input
                        type="hidden"
                        name="payment_status"
                        value={subscription.payment_status === "paid" ? "unpaid" : "paid"}
                      />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <AdminSubmitButton
                        tone={subscription.payment_status === "paid" ? "secondary" : "primary"}
                        pendingLabel="Saving…"
                        className="btn-sm"
                      >
                        {subscription.payment_status === "paid" ? "Mark not paid" : "Mark paid"}
                      </AdminSubmitButton>
                    </form>
                    {subscription.notes ? (
                      <span className="text-[0.8125rem] text-ink-45">{subscription.notes}</span>
                    ) : null}
                  </div>

                  <details className="mt-5 border-t border-rule pt-5">
                    <summary className="cursor-pointer text-[0.8125rem] font-medium text-ink-70">
                      Edit plan
                    </summary>
                    <form action={updateSubscriptionAction} className="mt-6">
                      <input type="hidden" name="id" value={subscription.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <div className="grid gap-x-5 sm:grid-cols-2">
                        <label className="field">
                          <span className="field-label">Client</span>
                          <select
                            className="select"
                            name="client_id"
                            defaultValue={subscription.client_id}
                            required
                          >
                            {clients.map((client) => (
                              <option value={client.id} key={client.id}>
                                {client.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="field">
                          <span className="field-label">Plan name</span>
                          <input
                            className="input"
                            name="plan_name"
                            defaultValue={subscription.plan_name}
                            required
                            maxLength={200}
                          />
                        </label>
                      </div>
                      <AdminSubscriptionFields
                        defaultPeriod={subscription.billing_period}
                        defaultStartedOn={subscription.started_on}
                        defaultRenewsOn={subscription.renews_on ?? ""}
                        defaultStatus={subscription.status}
                        defaultPaymentStatus={subscription.payment_status}
                        defaultAmount={(subscription.amount_minor / 100).toFixed(2)}
                        defaultCurrency={subscription.currency}
                      />
                      <label className="field">
                        <span className="field-label">Internal notes</span>
                        <textarea
                          className="textarea"
                          name="notes"
                          defaultValue={subscription.notes ?? ""}
                          maxLength={5000}
                        />
                      </label>
                      <AdminSubmitButton>Save subscription</AdminSubmitButton>
                    </form>
                    <form action={deleteSubscriptionAction} className="mt-5 border-t border-rule pt-5">
                      <input type="hidden" name="id" value={subscription.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <AdminSubmitButton
                        tone="danger"
                        pendingLabel="Deleting…"
                        className="btn-sm"
                        confirmMessage={`Delete the ${subscription.plan_name} subscription?`}
                      >
                        Delete subscription
                      </AdminSubmitButton>
                    </form>
                  </details>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty">
            {clientFilter || paidFilter
              ? "No subscriptions match these filters."
              : "No subscriptions have been recorded."}
          </div>
        )}
      </section>
    </>
  );
}
