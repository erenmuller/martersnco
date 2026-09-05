/**
 * Row shapes for the Marters & Co. schema.
 *
 * These are hand-maintained. Once your project is live you can replace this
 * file wholesale with generated types:
 *   supabase gen types typescript --linked > lib/types.ts
 */

export type Role = "admin" | "client";

export type ServiceCategory =
  | "process_identification"
  | "automation_implementation"
  | "workflow_program"
  | "enterprise_build"
  | "enablement";

export type ClientStatus = "prospect" | "active" | "paused" | "closed";
export type EngagementStatus = "scoped" | "active" | "paused" | "completed";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";
export type BillingPeriod = "monthly" | "quarterly" | "annual";
export type PaymentState = "unpaid" | "paid";
export type RequestStatus = "open" | "in_progress" | "blocked" | "resolved";
export type RequestPriority = "low" | "normal" | "high";
export type QuoteStatus = "none" | "free" | "quoted" | "accepted" | "declined";
export type NewsletterStatus = "draft" | "scheduled" | "sent";
export type DocumentKind =
  | "process_map"
  | "proposal"
  | "report"
  | "invoice"
  | "other";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  client_id: string | null;
  phone_e164: string | null;
  whatsapp_verified_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  legal_name: string | null;
  status: ClientStatus;
  industry: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  notes: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  code: string;
  name: string;
  summary: string | null;
  category: ServiceCategory;
  is_active: boolean;
  sort_order: number;
}

export interface ClientService {
  id: string;
  client_id: string;
  service_id: string;
  status: EngagementStatus;
  started_on: string | null;
  ended_on: string | null;
  owner_name: string | null;
  notes: string | null;
  created_at: string;
  service?: Service;
  client?: Client;
}

export interface Subscription {
  id: string;
  client_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  billing_period: BillingPeriod;
  /** Minor units (fils for AED, cents for USD). Avoids float rounding. */
  amount_minor: number;
  currency: string;
  started_on: string;
  renews_on: string | null;
  cancelled_at: string | null;
  payment_status: PaymentState;
  paid_on: string | null;
  notes: string | null;
  created_at: string;
  client?: Client;
}

export interface ClientDocument {
  id: string;
  client_id: string;
  title: string;
  kind: DocumentKind;
  storage_path: string;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface ClientRequest {
  id: string;
  client_id: string;
  created_by: string | null;
  subject: string;
  body: string;
  status: RequestStatus;
  priority: RequestPriority;
  admin_notes: string | null;
  quote_status: QuoteStatus;
  quote_amount_minor: number | null;
  quote_currency: string;
  quote_note: string | null;
  quoted_at: string | null;
  created_at: string;
  resolved_at: string | null;
  client?: Client;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  employees: string | null;
  message: string;
  source: string | null;
  handled: boolean;
  created_at: string;
}

export interface NewsletterEdition {
  id: string;
  title: string;
  /** Google Doc the edition is drafted in. */
  doc_url: string;
  status: NewsletterStatus;
  sent_on: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/* -------------------------------------------------------------------------
   Display maps — single source of truth for human-readable labels.
   ------------------------------------------------------------------------- */

export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = {
  process_identification: "Process identification",
  automation_implementation: "Automation implementation",
  workflow_program: "AI workflow programme",
  enterprise_build: "Enterprise build",
  enablement: "Team enablement",
};

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  prospect: "Prospect",
  active: "Active",
  paused: "Paused",
  closed: "Closed",
};

export const ENGAGEMENT_STATUS_LABEL: Record<EngagementStatus, string> = {
  scoped: "Scoped",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
};

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  trialing: "Trialing",
  active: "Active",
  past_due: "Past due",
  cancelled: "Cancelled",
  expired: "Expired",
};

export const BILLING_PERIOD_LABEL: Record<BillingPeriod, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

export const PAYMENT_STATE_LABEL: Record<PaymentState, string> = {
  unpaid: "Not paid",
  paid: "Paid",
};

export const REQUEST_PRIORITY_LABEL: Record<RequestPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  none: "Not quoted",
  free: "No charge",
  quoted: "Quoted",
  accepted: "Accepted",
  declined: "Declined",
};

export const NEWSLETTER_STATUS_LABEL: Record<NewsletterStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  sent: "Sent",
};

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  blocked: "Blocked",
  resolved: "Resolved",
};

export const DOCUMENT_KIND_LABEL: Record<DocumentKind, string> = {
  process_map: "Process map",
  proposal: "Proposal",
  report: "Report",
  invoice: "Invoice",
  other: "Document",
};

export type BadgeTone = "ok" | "pending" | "alert" | "neutral";

export function engagementTone(s: EngagementStatus): BadgeTone {
  if (s === "active") return "ok";
  if (s === "scoped") return "pending";
  if (s === "paused") return "alert";
  return "neutral";
}

export function subscriptionTone(s: SubscriptionStatus): BadgeTone {
  if (s === "active") return "ok";
  if (s === "trialing") return "pending";
  if (s === "past_due") return "alert";
  return "neutral";
}

export function requestTone(s: RequestStatus): BadgeTone {
  if (s === "resolved") return "ok";
  if (s === "in_progress") return "pending";
  if (s === "blocked") return "alert";
  return "neutral";
}

export function paymentTone(s: PaymentState): BadgeTone {
  return s === "paid" ? "ok" : "pending";
}

export function quoteTone(s: QuoteStatus): BadgeTone {
  if (s === "accepted" || s === "free") return "ok";
  if (s === "quoted") return "pending";
  if (s === "declined") return "alert";
  return "neutral";
}

export function newsletterTone(s: NewsletterStatus): BadgeTone {
  if (s === "sent") return "ok";
  if (s === "scheduled") return "pending";
  return "neutral";
}

export function priorityTone(s: RequestPriority): BadgeTone {
  if (s === "high") return "alert";
  if (s === "normal") return "pending";
  return "neutral";
}

export function clientTone(s: ClientStatus): BadgeTone {
  if (s === "active") return "ok";
  if (s === "prospect") return "pending";
  if (s === "paused") return "alert";
  return "neutral";
}
