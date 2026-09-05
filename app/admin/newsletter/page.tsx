import AdminNotice from "@/components/AdminNotice";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminSubmitButton from "@/components/AdminSubmitButton";
import Badge from "@/components/Badge";
import {
  createEditionAction,
  deleteEditionAction,
  markEditionSentAction,
  updateEditionAction,
} from "@/app/admin/_actions/newsletter";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";
import { NEWSLETTER_STATUS_LABEL, newsletterTone } from "@/lib/types";
import type { NewsletterEdition, NewsletterStatus } from "@/lib/types";

type SearchParams = Promise<{
  status?: string;
  notice?: string | string[];
  error?: string | string[];
}>;

const statuses = Object.entries(NEWSLETTER_STATUS_LABEL) as [NewsletterStatus, string][];

/** Google Docs links are long; show where it points, not the whole URL. */
function linkLabel(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, "");
  } catch {
    return "document";
  }
}

export default async function NewsletterPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const statusFilter = statuses.some(([value]) => value === params.status)
    ? (params.status as NewsletterStatus)
    : "";

  const supabase = createAdminClient();
  let query = supabase
    .from("newsletter_editions")
    .select("id, title, doc_url, status, sent_on, notes, created_by, created_at, updated_at")
    .order("sent_on", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false });
  if (statusFilter) query = query.eq("status", statusFilter);
  const { data, error } = await query;
  const editions = (data ?? []) as NewsletterEdition[];

  const today = new Date().toISOString().slice(0, 10);
  const returnTo = `/admin/newsletter${statusFilter ? `?status=${statusFilter}` : ""}`;

  return (
    <>
      <AdminPageHeader
        eyebrow="Client acquisition"
        title="Newsletter"
        description="One row per edition: what it is called and the Google Doc it is written in. This is the index of what has gone out and what is still in draft."
        action={
          <a href="#new-edition" className="btn btn-primary">
            Add an edition
          </a>
        }
      />
      <AdminNotice notice={params.notice} error={params.error} />
      {error ? (
        <p className="notice notice-error" role="alert">
          Editions could not be loaded: {error.message}
        </p>
      ) : null}

      <section id="new-edition" className="card scroll-mt-6">
        <details>
          <summary className="cursor-pointer font-medium">Add an edition</summary>
          <form action={createEditionAction} className="mt-6">
            <input type="hidden" name="returnTo" value={returnTo} />
            <div className="grid gap-x-5 sm:grid-cols-2">
              <label className="field">
                <span className="field-label">Edition name</span>
                <input
                  className="input"
                  name="title"
                  required
                  maxLength={200}
                  placeholder="Issue 04 — Where automation actually pays"
                />
              </label>
              <label className="field">
                <span className="field-label">Google Doc link</span>
                <input
                  className="input"
                  name="doc_url"
                  type="url"
                  required
                  maxLength={2000}
                  placeholder="https://docs.google.com/document/d/…"
                />
              </label>
              <label className="field">
                <span className="field-label">Status</span>
                <select className="select" name="status" defaultValue="draft">
                  {statuses.map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field-label">Sent on</span>
                <input className="input" name="sent_on" type="date" max={today} />
                <span className="field-hint">Needed once the status is Sent.</span>
              </label>
            </div>
            <label className="field">
              <span className="field-label">Internal notes</span>
              <textarea
                className="textarea"
                name="notes"
                maxLength={5000}
                rows={2}
                placeholder="Angle, segment, anything worth remembering next issue."
              />
            </label>
            <AdminSubmitButton pendingLabel="Adding…">Add edition</AdminSubmitButton>
          </form>
        </details>
      </section>

      <section className="mt-10" aria-labelledby="edition-list-title">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="edition-list-title" className="display-s">
              Editions
            </h2>
            <p className="mono mt-1 text-[0.6875rem] text-ink-45">
              {editions.length} {editions.length === 1 ? "edition" : "editions"}
            </p>
          </div>
          <form method="get" className="flex gap-2">
            <label>
              <span className="sr-only">Filter by status</span>
              <select className="select" name="status" defaultValue={statusFilter}>
                <option value="">All statuses</option>
                {statuses.map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn btn-secondary">
              Filter
            </button>
          </form>
        </div>

        {editions.length ? (
          <div className="space-y-4">
            {editions.map((edition) => (
              <article className="card" key={edition.id}>
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-[1rem] font-semibold text-ink">{edition.title}</h3>
                    <p className="mt-2 text-[0.8125rem]">
                      <a
                        className="text-pine underline underline-offset-2"
                        href={edition.doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open on {linkLabel(edition.doc_url)} ↗
                      </a>
                    </p>
                    <p className="mono mt-2 text-[0.6875rem] text-ink-45">
                      {edition.status === "sent"
                        ? `Sent ${formatDate(edition.sent_on)}`
                        : `Added ${formatDate(edition.created_at)}`}
                    </p>
                  </div>
                  <Badge tone={newsletterTone(edition.status)}>
                    {NEWSLETTER_STATUS_LABEL[edition.status]}
                  </Badge>
                </header>

                {edition.notes ? (
                  <p className="mt-4 whitespace-pre-wrap text-[0.875rem] leading-relaxed text-ink-70">
                    {edition.notes}
                  </p>
                ) : null}

                {edition.status === "sent" ? null : (
                  <div className="mt-5 border-t border-rule pt-5">
                    <form action={markEditionSentAction}>
                      <input type="hidden" name="id" value={edition.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <AdminSubmitButton pendingLabel="Saving…" className="btn-sm">
                        Mark sent today
                      </AdminSubmitButton>
                    </form>
                  </div>
                )}

                <details className="mt-5 border-t border-rule pt-5">
                  <summary className="cursor-pointer text-[0.8125rem] font-medium text-ink-70">
                    Edit edition
                  </summary>
                  <form action={updateEditionAction} className="mt-6">
                    <input type="hidden" name="id" value={edition.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <div className="grid gap-x-5 sm:grid-cols-2">
                      <label className="field">
                        <span className="field-label">Edition name</span>
                        <input
                          className="input"
                          name="title"
                          defaultValue={edition.title}
                          required
                          maxLength={200}
                        />
                      </label>
                      <label className="field">
                        <span className="field-label">Google Doc link</span>
                        <input
                          className="input"
                          name="doc_url"
                          type="url"
                          defaultValue={edition.doc_url}
                          required
                          maxLength={2000}
                        />
                      </label>
                      <label className="field">
                        <span className="field-label">Status</span>
                        <select className="select" name="status" defaultValue={edition.status}>
                          {statuses.map(([value, label]) => (
                            <option value={value} key={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        <span className="field-label">Sent on</span>
                        <input
                          className="input"
                          name="sent_on"
                          type="date"
                          max={today}
                          defaultValue={edition.sent_on ?? ""}
                        />
                        <span className="field-hint">Needed once the status is Sent.</span>
                      </label>
                    </div>
                    <label className="field">
                      <span className="field-label">Internal notes</span>
                      <textarea
                        className="textarea"
                        name="notes"
                        defaultValue={edition.notes ?? ""}
                        maxLength={5000}
                        rows={2}
                      />
                    </label>
                    <AdminSubmitButton>Save edition</AdminSubmitButton>
                  </form>
                  <form action={deleteEditionAction} className="mt-5 border-t border-rule pt-5">
                    <input type="hidden" name="id" value={edition.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <AdminSubmitButton
                      tone="danger"
                      pendingLabel="Deleting…"
                      className="btn-sm"
                      confirmMessage={`Delete “${edition.title}”? The Google Doc itself is not touched.`}
                    >
                      Delete edition
                    </AdminSubmitButton>
                  </form>
                </details>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            {statusFilter
              ? "No editions have this status."
              : "No editions yet. Add the first one above."}
          </div>
        )}
      </section>
    </>
  );
}
