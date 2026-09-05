import AdminNotice from "@/components/AdminNotice";
import AdminPageHeader from "@/components/AdminPageHeader";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";

type SearchParams = Promise<{
  entity?: string;
  notice?: string | string[];
  error?: string | string[];
}>;

type AuditRow = {
  id: number;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
};

type Actor = { id: string; full_name: string | null; email: string };

export default async function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const entity = params.entity?.trim().slice(0, 80) ?? "";
  const supabase = await createClient();
  let request = supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (entity) request = request.eq("entity", entity);
  const auditResult = await request;
  const rows = (auditResult.data ?? []) as AuditRow[];

  const actorIds = [...new Set(rows.map((row) => row.actor_id).filter((id): id is string => Boolean(id)))];
  const actorResult = actorIds.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", actorIds)
    : { data: [] as Actor[], error: null };
  const actors = new Map((actorResult.data as Actor[]).map((actor) => [actor.id, actor]));
  const loadError = auditResult.error?.message ?? actorResult.error?.message;
  const entities = [...new Set(rows.map((row) => row.entity))].sort();

  return (
    <>
      <AdminPageHeader
        eyebrow="Operations"
        title="Audit log"
        description="The latest 200 recorded admin events. Audit rows are append-only from the service role and cannot be written by a browser session."
      />
      <AdminNotice notice={params.notice} error={params.error} />
      {loadError ? (
        <p className="notice notice-error" role="alert">
          Audit events could not be loaded: {loadError}
        </p>
      ) : null}

      <form method="get" className="card mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="field m-0 flex-1">
          <span className="field-label">Entity</span>
          <input
            className="input"
            name="entity"
            defaultValue={entity}
            list="audit-entities"
            placeholder="All entities"
          />
          <datalist id="audit-entities">
            {entities.map((item) => (
              <option value={item} key={item} />
            ))}
          </datalist>
        </label>
        <button type="submit" className="btn btn-secondary">
          Filter events
        </button>
        {entity ? (
          <a href="/admin/audit" className="btn btn-quiet">
            Clear
          </a>
        ) : null}
      </form>

      <section aria-labelledby="audit-list-title">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="audit-list-title" className="display-s">
            Recorded events
          </h2>
          <span className="mono text-[0.6875rem] text-ink-45">{rows.length} shown</span>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Context</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const actor = row.actor_id ? actors.get(row.actor_id) : null;
                  return (
                    <tr key={row.id}>
                      <td className="num">{formatDateTime(row.created_at)}</td>
                      <td>
                        {actor?.full_name || actor?.email || "System / deleted user"}
                        {actor?.full_name ? (
                          <span className="mt-1 block text-[0.75rem] text-ink-45">{actor.email}</span>
                        ) : null}
                      </td>
                      <td className="primary mono text-[0.75rem]">{row.action}</td>
                      <td>
                        <span className="mono text-[0.75rem]">{row.entity}</span>
                        {row.entity_id ? (
                          <span className="mt-1 block max-w-[12rem] truncate text-[0.6875rem] text-ink-45" title={row.entity_id}>
                            {row.entity_id}
                          </span>
                        ) : null}
                      </td>
                      <td>
                        {Object.keys(row.meta ?? {}).length ? (
                          <details>
                            <summary className="cursor-pointer text-[0.8125rem] text-pine">View context</summary>
                            <pre className="mono mt-2 max-w-[24rem] whitespace-pre-wrap break-words text-[0.6875rem] leading-relaxed text-ink-70">
                              {JSON.stringify(row.meta, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">No audit events match this filter.</div>
        )}
      </section>
    </>
  );
}
