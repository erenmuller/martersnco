/** Formatting helpers. Dates render in a fixed locale so server and client agree. */

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(d);
}

/** amount_minor is stored in minor units to avoid float rounding. */
export function formatMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
}

/** Whole days from today until `value`. Negative when the date has passed. */
export function daysUntil(value: string | null | undefined): number | null {
  if (!value) return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  const startOfDay = (d: Date) =>
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round(
    (startOfDay(target) - startOfDay(new Date())) / 86_400_000,
  );
}

export function renewalNote(renewsOn: string | null | undefined): string {
  const days = daysUntil(renewsOn);
  if (days === null) return "No renewal date set";
  if (days < 0) return `Lapsed ${Math.abs(days)} days ago`;
  if (days === 0) return "Renews today";
  if (days === 1) return "Renews tomorrow";
  return `Renews in ${days} days`;
}

export function initials(name: string | null | undefined): string {
  if (!name) return "—";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
