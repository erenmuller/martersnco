import type { Metadata } from "next";
import Badge from "@/components/Badge";
import PortalPageHeader from "@/components/PortalPageHeader";
import { requireClient } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import {
  ENGAGEMENT_STATUS_LABEL,
  SERVICE_CATEGORY_LABEL,
  engagementTone,
  type ClientService,
} from "@/lib/types";

export const metadata: Metadata = { title: "Engagements" };

export default async function EngagementsPage() {
  const profile = await requireClient();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_services")
    .select(
      "id, client_id, service_id, status, started_on, ended_on, owner_name, created_at, service:services(id, code, name, summary, category, is_active, sort_order)",
    )
    .eq("client_id", profile.client_id)
    .order("created_at", { ascending: false });
  const engagements = (data ?? []) as unknown as ClientService[];

  return (
    <>
      <PortalPageHeader
        eyebrow="Work"
        title="Engagements"
        description="The services currently scoped, active or completed for your organisation."
      />

      {error ? (
        <p className="notice notice-error" role="alert">
          Engagements could not be loaded. Refresh the page or try again shortly.
        </p>
      ) : engagements.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {engagements.map((engagement) => (
            <article key={engagement.id} className="card flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {engagement.service?.category && (
                    <span className="eyebrow mb-2">
                      {SERVICE_CATEGORY_LABEL[engagement.service.category]}
                    </span>
                  )}
                  <h2 className="display-s text-ink">
                    {engagement.service?.name ?? "Service engagement"}
                  </h2>
                </div>
                <Badge tone={engagementTone(engagement.status)}>
                  {ENGAGEMENT_STATUS_LABEL[engagement.status]}
                </Badge>
              </div>

              {engagement.service?.summary && (
                <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-70">
                  {engagement.service.summary}
                </p>
              )}

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-rule pt-4 text-[0.8125rem]">
                <div>
                  <dt className="eyebrow mb-1">Started</dt>
                  <dd className="mono text-ink-70">
                    {formatDate(engagement.started_on)}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow mb-1">Completed</dt>
                  <dd className="mono text-ink-70">
                    {formatDate(engagement.ended_on)}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="eyebrow mb-1">Marters &amp; Co. lead</dt>
                  <dd className="text-ink-70">
                    {engagement.owner_name || "Not assigned"}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          No engagements have been added for your organisation yet.
        </div>
      )}
    </>
  );
}
