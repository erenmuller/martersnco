import AdminNotice from "@/components/AdminNotice";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminSubmitButton from "@/components/AdminSubmitButton";
import Badge from "@/components/Badge";
import {
  createServiceAction,
  deleteServiceAction,
  updateServiceAction,
} from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { SERVICE_CATEGORY_LABEL } from "@/lib/types";
import type { Service, ServiceCategory } from "@/lib/types";

type SearchParams = Promise<{ notice?: string | string[]; error?: string | string[] }>;
const categories = Object.entries(SERVICE_CATEGORY_LABEL) as [ServiceCategory, string][];

export default async function ServicesAdminPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order")
    .order("name");
  const services = (data ?? []) as Service[];

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Services"
        description="The operational catalogue assigned to client engagements. Service codes should stay aligned with the marketing copy."
        action={
          <a href="#new-service" className="btn btn-primary">
            Add a service
          </a>
        }
      />
      <AdminNotice notice={params.notice} error={params.error} />

      <section id="new-service" className="card scroll-mt-6">
        <details>
          <summary className="cursor-pointer font-medium">Create a catalogue item</summary>
          <form action={createServiceAction} className="mt-6">
            <input type="hidden" name="returnTo" value="/admin/services" />
            <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-4">
              <label className="field">
                <span className="field-label">Code</span>
                <input className="input mono" name="code" required maxLength={30} placeholder="PI-03" />
              </label>
              <label className="field sm:col-span-2">
                <span className="field-label">Name</span>
                <input className="input" name="name" required maxLength={200} />
              </label>
              <label className="field">
                <span className="field-label">Sort order</span>
                <input className="input mono" name="sort_order" type="number" min={0} max={100000} defaultValue={100} />
              </label>
              <label className="field sm:col-span-2">
                <span className="field-label">Category</span>
                <select className="select" name="category" defaultValue="process_identification">
                  {categories.map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field flex items-center gap-3 pt-6">
                <input name="is_active" type="checkbox" defaultChecked className="h-4 w-4 accent-pine" />
                <span className="text-[0.875rem]">Available for assignment</span>
              </label>
            </div>
            <label className="field">
              <span className="field-label">Summary</span>
              <textarea className="textarea" name="summary" maxLength={1000} />
            </label>
            <AdminSubmitButton pendingLabel="Creating…">Create service</AdminSubmitButton>
          </form>
        </details>
      </section>

      <section className="mt-10" aria-labelledby="catalogue-title">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="catalogue-title" className="display-s">
            Catalogue
          </h2>
          <span className="mono text-[0.6875rem] text-ink-45">{services.length} items</span>
        </div>
        {error ? (
          <p className="notice notice-error" role="alert">
            Services could not be loaded: {error.message}
          </p>
        ) : services.length ? (
          <div className="space-y-3">
            {services.map((service) => (
              <details key={service.id} className="card">
                <summary className="cursor-pointer list-none">
                  <span className="grid items-start gap-4 sm:grid-cols-[6rem_1fr_auto]">
                    <span className="mono text-[0.75rem] text-pine">{service.code}</span>
                    <span>
                      <strong className="block text-[0.9375rem]">{service.name}</strong>
                      <span className="mt-1 block text-[0.8125rem] text-ink-45">
                        {SERVICE_CATEGORY_LABEL[service.category]}
                      </span>
                    </span>
                    <Badge tone={service.is_active ? "ok" : "neutral"}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </span>
                </summary>
                <form action={updateServiceAction} className="mt-6 border-t border-rule pt-6">
                  <input type="hidden" name="id" value={service.id} />
                  <input type="hidden" name="returnTo" value="/admin/services" />
                  <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="field">
                      <span className="field-label">Code</span>
                      <input className="input mono" name="code" defaultValue={service.code} required maxLength={30} />
                    </label>
                    <label className="field sm:col-span-2">
                      <span className="field-label">Name</span>
                      <input className="input" name="name" defaultValue={service.name} required maxLength={200} />
                    </label>
                    <label className="field">
                      <span className="field-label">Sort order</span>
                      <input
                        className="input mono"
                        name="sort_order"
                        type="number"
                        min={0}
                        max={100000}
                        defaultValue={service.sort_order}
                      />
                    </label>
                    <label className="field sm:col-span-2">
                      <span className="field-label">Category</span>
                      <select className="select" name="category" defaultValue={service.category}>
                        {categories.map(([value, label]) => (
                          <option value={value} key={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field flex items-center gap-3 pt-6">
                      <input
                        name="is_active"
                        type="checkbox"
                        defaultChecked={service.is_active}
                        className="h-4 w-4 accent-pine"
                      />
                      <span className="text-[0.875rem]">Available for assignment</span>
                    </label>
                  </div>
                  <label className="field">
                    <span className="field-label">Summary</span>
                    <textarea className="textarea" name="summary" defaultValue={service.summary ?? ""} maxLength={1000} />
                  </label>
                  <AdminSubmitButton>Save service</AdminSubmitButton>
                </form>
                <form action={deleteServiceAction} className="mt-5 border-t border-rule pt-5">
                  <input type="hidden" name="id" value={service.id} />
                  <input type="hidden" name="returnTo" value="/admin/services" />
                  <AdminSubmitButton
                    tone="danger"
                    pendingLabel="Deleting…"
                    confirmMessage={`Delete ${service.code} — ${service.name}? Existing engagements will prevent deletion.`}
                  >
                    Delete service
                  </AdminSubmitButton>
                </form>
              </details>
            ))}
          </div>
        ) : (
          <div className="empty">No service catalogue items exist.</div>
        )}
      </section>
    </>
  );
}
