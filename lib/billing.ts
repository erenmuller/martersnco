/**
 * Billing-cycle arithmetic. Shared by the admin form's live preview and the
 * server action that persists the row, so both derive the same renewal date.
 *
 * Dates are plain `YYYY-MM-DD` strings throughout: a billing period is a
 * calendar fact, not an instant, so nothing here touches time zones.
 */

import type { BillingPeriod } from "@/lib/types";

const MONTHS_IN_PERIOD: Record<BillingPeriod, number> = {
  monthly: 1,
  quarterly: 3,
  annual: 12,
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string | null | undefined): value is string {
  if (!value || !ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= daysInMonth(year, month);
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Advance a date by one billing period, clamping to the end of the target
 * month. 31 Jan billed monthly renews 28 Feb, then 28 Mar — the same day the
 * bank would use, and never a rolled-over 3 March.
 */
export function addBillingPeriod(
  date: string,
  period: BillingPeriod,
  cycles = 1,
): string | null {
  if (!isIsoDate(date)) return null;

  const [year, month, day] = date.split("-").map(Number);
  const advanced = month - 1 + MONTHS_IN_PERIOD[period] * cycles;
  const targetYear = year + Math.floor(advanced / 12);
  const targetMonth = ((advanced % 12) + 12) % 12 + 1;
  const targetDay = Math.min(day, daysInMonth(targetYear, targetMonth));

  return `${targetYear.toString().padStart(4, "0")}-${targetMonth
    .toString()
    .padStart(2, "0")}-${targetDay.toString().padStart(2, "0")}`;
}

/**
 * The renewal date a subscription should carry. A monthly plan needs nothing
 * but a start date; an admin who wants a different date supplies an override.
 */
export function derivedRenewal(
  startedOn: string,
  period: BillingPeriod,
  override?: string | null,
): string | null {
  if (override && isIsoDate(override)) return override;
  return addBillingPeriod(startedOn, period);
}

/**
 * The first renewal on or after today. Used for display only: the stored
 * `renews_on` is the authoritative next date an admin has agreed to.
 */
export function nextRenewalOnOrAfter(
  renewsOn: string | null,
  period: BillingPeriod,
  today = new Date().toISOString().slice(0, 10),
): string | null {
  if (!isIsoDate(renewsOn)) return null;

  let candidate: string | null = renewsOn;
  // A yearly plan left untouched for a decade still settles in ten steps.
  for (let guard = 0; guard < 240 && candidate && candidate < today; guard += 1) {
    candidate = addBillingPeriod(candidate, period);
  }
  return candidate;
}

export { MONTHS_IN_PERIOD };
