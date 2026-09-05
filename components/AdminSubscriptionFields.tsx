"use client";

import { useState } from "react";
import { addBillingPeriod, derivedRenewal } from "@/lib/billing";
import { formatDate } from "@/lib/format";
import { BILLING_PERIOD_LABEL, PAYMENT_STATE_LABEL } from "@/lib/types";
import type { BillingPeriod, PaymentState, SubscriptionStatus } from "@/lib/types";
import { SUBSCRIPTION_STATUS_LABEL } from "@/lib/types";

const periods = Object.entries(BILLING_PERIOD_LABEL) as [BillingPeriod, string][];
const statuses = Object.entries(SUBSCRIPTION_STATUS_LABEL) as [SubscriptionStatus, string][];
const payments = Object.entries(PAYMENT_STATE_LABEL) as [PaymentState, string][];

/**
 * The cycle fields for a subscription. A monthly plan needs only a start date:
 * the renewal date follows from the cycle and is previewed live here, with an
 * override for the plans that renew off-cycle. The same derivation runs again
 * on the server, so a submission with JavaScript off lands identically.
 */
export default function AdminSubscriptionFields({
  defaultPeriod = "monthly",
  defaultStartedOn,
  defaultRenewsOn = "",
  defaultStatus = "active",
  defaultPaymentStatus = "unpaid",
  defaultAmount = "0.00",
  defaultCurrency = "AED",
}: {
  defaultPeriod?: BillingPeriod;
  defaultStartedOn: string;
  defaultRenewsOn?: string;
  defaultStatus?: SubscriptionStatus;
  defaultPaymentStatus?: PaymentState;
  defaultAmount?: string;
  defaultCurrency?: string;
}) {
  const [period, setPeriod] = useState<BillingPeriod>(defaultPeriod);
  const [startedOn, setStartedOn] = useState(defaultStartedOn);

  // An existing row counts as overridden only when its date is off-cycle.
  const [override, setOverride] = useState(() =>
    defaultRenewsOn && defaultRenewsOn !== addBillingPeriod(defaultStartedOn, defaultPeriod)
      ? defaultRenewsOn
      : "",
  );
  const [custom, setCustom] = useState(Boolean(override));

  const renewal = derivedRenewal(startedOn, period, custom ? override : null);
  const cycleWord =
    period === "monthly" ? "a month" : period === "quarterly" ? "three months" : "a year";

  return (
    <>
      <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="field">
          <span className="field-label">Amount</span>
          <input
            className="input mono"
            name="amount"
            inputMode="decimal"
            defaultValue={defaultAmount}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Currency</span>
          <input
            className="input mono uppercase"
            name="currency"
            defaultValue={defaultCurrency}
            minLength={3}
            maxLength={3}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Billing period</span>
          <select
            className="select"
            name="billing_period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as BillingPeriod)}
          >
            {periods.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Start date</span>
          <input
            className="input"
            name="started_on"
            type="date"
            value={startedOn}
            onChange={(event) => setStartedOn(event.target.value)}
            required
          />
        </label>
      </div>

      <div className="mb-5 border border-rule bg-shade p-4">
        <p className="text-[0.8125rem] text-ink">
          <span className="font-medium">Renews {formatDate(renewal)}</span>
          <span className="text-ink-45">
            {custom && override
              ? " · set by hand"
              : ` · ${cycleWord} after the start date`}
          </span>
        </p>
        <label className="mt-3 flex items-center gap-2 text-[0.8125rem] text-ink-70">
          <input
            type="checkbox"
            checked={custom}
            onChange={(event) => {
              setCustom(event.target.checked);
              if (!event.target.checked) setOverride("");
            }}
          />
          Renews on a different date
        </label>
        {custom ? (
          <label className="field mt-3 mb-0 max-w-[16rem]">
            <span className="field-label">Renewal date</span>
            <input
              className="input"
              name="renews_on"
              type="date"
              value={override}
              min={startedOn || undefined}
              onChange={(event) => setOverride(event.target.value)}
            />
          </label>
        ) : (
          // Submitted empty so the server derives the date from the cycle.
          <input type="hidden" name="renews_on" value="" />
        )}
      </div>

      <div className="grid gap-x-5 sm:grid-cols-2">
        <label className="field">
          <span className="field-label">Subscription status</span>
          <select className="select" name="status" defaultValue={defaultStatus}>
            {statuses.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">This period</span>
          <select className="select" name="payment_status" defaultValue={defaultPaymentStatus}>
            {payments.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </>
  );
}
