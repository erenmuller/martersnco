export default function PortalLoading() {
  return (
    <div aria-live="polite" aria-busy="true">
      <span className="eyebrow eyebrow-pine mb-3">Client portal</span>
      <div className="h-10 w-2/3 animate-pulse bg-shade" />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="h-44 animate-pulse border border-rule bg-paper" />
        <div className="h-44 animate-pulse border border-rule bg-paper" />
      </div>
      <span className="sr-only">Loading portal information…</span>
    </div>
  );
}
