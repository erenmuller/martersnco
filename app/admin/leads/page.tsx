import AdminNotice from "@/components/AdminNotice";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminSubmitButton from "@/components/AdminSubmitButton";
import Badge from "@/components/Badge";
import { deleteLeadAction, setLeadHandledAction } from "@/app/admin/_actions/leads";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/format";
import type { Lead } from "@/lib/types";

type SearchParams = Promise<{
  view?: string;
  notice?: string | string[];
  error?: string | string[];
}>;

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  // This page uses the service-role client, so it authorizes locally instead
  // of relying on the parent layout's redirect timing.
  await requireAdmin();
  const params = await searchParams;
  const view = params.view === "all" || params.view === "handled" ? params.view : "inbox";
  let leads: Lead[] = [];
  let loadError: string | null = null;

  try {
    const admin = createAdminClient();
    let request = admin.from("leads").select("*").order("created_at", { ascending: false });
    if (view === "inbox") request = request.eq("handled", false);
    if (view === "handled") request = request.eq("handled", true);
    const result = await request;
    if (result.error) loadError = result.error.message;
    leads = (result.data ?? []) as Lead[];
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Lead inbox is unavailable.";
  }

  const returnTo = `/admin/leads${view === "inbox" ? "" : `?view=${view}`}`;

  return (
    <>
      <AdminPageHeader
        eyebrow="Client acquisition"
        title="Leads inbox"
        description="Contact-form submissions are service-role only. Handle personal information here and remove it when it is no longer needed."
      />
      <AdminNotice notice={params.notice} error={params.error} />
      {loadError ? (
        <p className="notice notice-error" role="alert">
          Leads could not be loaded: {loadError}
        </p>
      ) : null}

      <nav aria-label="Lead view" className="mb-6 flex flex-wrap gap-2">
        {[
          ["inbox", "Unhandled"],
          ["all", "All leads"],
          ["handled", "Handled"],
        ].map(([value, label]) => (
          <a
            key={value}
            href={value === "inbox" ? "/admin/leads" : `/admin/leads?view=${value}`}
            aria-current={view === value ? "page" : undefined}
            className={`btn btn-sm ${view === value ? "btn-primary" : "btn-secondary"}`}
          >
            {label}
          </a>
        ))}
      </nav>

      <section aria-labelledby="lead-list-title">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="lead-list-title" className="display-s">
            {view === "inbox" ? "Unhandled enquiries" : view === "handled" ? "Handled enquiries" : "All enquiries"}
          </h2>
          <span className="mono text-[0.6875rem] text-ink-45">{leads.length} leads</span>
        </div>

        {leads.length ? (
          <div className="space-y-4">
            {leads.map((lead) => (
              <article className="card" key={lead.id}>
                <header className="flex flex-col gap-4 border-b border-rule pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="display-s">{lead.name}</h3>
                    <p className="mt-2 text-[0.875rem] text-ink-70">
                      <a className="text-pine underline underline-offset-2" href={`mailto:${lead.email}`}>
                        {lead.email}
                      </a>
                      {lead.company ? ` · ${lead.company}` : ""}
                      {lead.employees ? ` · ${lead.employees} staff` : ""}
                    </p>
                    <p className="mono mt-2 text-[0.6875rem] text-ink-45">
                      Received {formatDateTime(lead.created_at)}{lead.source ? ` · ${lead.source}` : ""}
                    </p>
                  </div>
                  <Badge tone={lead.handled ? "neutral" : "pending"}>
                    {lead.handled ? "Handled" : "Unhandled"}
                  </Badge>
                </header>

                <p className="my-5 whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink-70">
                  {lead.message}
                </p>

                <div className="flex flex-wrap gap-3 border-t border-rule pt-5">
                  <form action={setLeadHandledAction}>
                    <input type="hidden" name="id" value={lead.id} />
                    <input type="hidden" name="handled" value={lead.handled ? "false" : "true"} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <AdminSubmitButton tone={lead.handled ? "secondary" : "primary"}>
                      {lead.handled ? "Return to inbox" : "Mark handled"}
                    </AdminSubmitButton>
                  </form>
                  <form action={deleteLeadAction}>
                    <input type="hidden" name="id" value={lead.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <AdminSubmitButton
                      tone="danger"
                      pendingLabel="Deleting…"
                      confirmMessage={`Permanently delete the enquiry from ${lead.name}?`}
                    >
                      Delete lead
                    </AdminSubmitButton>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            {view === "inbox" ? "The lead inbox is clear." : "No leads match this view."}
          </div>
        )}
      </section>
    </>
  );
}
