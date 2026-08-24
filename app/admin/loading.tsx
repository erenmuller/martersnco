export default function AdminLoading() {
  return (
    <div className="card" role="status" aria-live="polite">
      <span className="eyebrow eyebrow-pine">Loading</span>
      <p className="mt-3 text-[0.9375rem] text-ink-70">Loading current admin data…</p>
    </div>
  );
}
