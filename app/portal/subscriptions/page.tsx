import type { Metadata } from "next";
import Badge from "@/components/Badge";
import PortalPageHeader from "@/components/PortalPageHeader";
import { requireClient } from "@/lib/auth";
import { formatDate, formatMoney, renewalNote } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import {
  SUBSCRIPTION_STATUS_LABEL,
  subscriptionTone,
  type Subscription,
} from "@/lib/types";

export const metadata: Metadata = { title: "Subscriptions" };

const billingLabel: Record<Subscription["billing_period"], string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

export default async function SubscriptionsPage() {
  const profile = await requireClient();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "id, client_id, plan_name, status, billing_period, amount_minor, currency, started_on, renews_on, cancelled_at, created_at",
    )
    .eq("client_id", profile.client_id)
    .order("created_at", { ascending: false });
  const subscriptions = (data ?? []) as Subscription[];

  return (
    <>
      <PortalPageHeader
        eyebrow="Account"
        title="Subscriptions"
        description="Plan status, billing cadence and the next recorded renewal date."
      />

      {error ? (
        <p className="notice notice-error" role="alert">
          Subscriptions could not be loaded. Refresh the page or try again shortly.
        </p>
      ) : subscriptions.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {subscriptions.map((subscription) => (
            <article key={subscription.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="eyebrow mb-2">Plan</span>
                  <h2 className="display-s text-ink">{subscription.plan_name}</h2>
                </div>
                <Badge tone={subscriptionTone(subscription.status)}>
                  {SUBSCRIPTION_STATUS_LABEL[subscription.status]}
                </Badge>
              </div>

              <p className="mono mt-7 text-[1.55rem] tracking-[-0.03em] text-ink">
                {formatMoney(subscription.amount_minor, subscription.currency)}
              </p>
              <p className="mt-1 text-[0.8125rem] text-ink-45">
                Billed {billingLabel[subscription.billing_period].toLowerCase()}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-5 border-t border-rule pt-4 text-[0.8125rem]">
                <div>
                  <dt className="eyebrow mb-1">Started</dt>
                  <dd className="mono text-ink-70">
                    {formatDate(subscription.started_on)}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow mb-1">Next renewal</dt>
                  <dd className="mono text-ink-70">
                    {formatDate(subscription.renews_on)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-[0.875rem] text-ink-70">
                {renewalNote(subscription.renews_on)}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          No subscriptions have been added for your organisation yet.
        </div>
      )}
    </>
  );
}
