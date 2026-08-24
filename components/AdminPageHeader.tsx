export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 border-b border-rule pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="eyebrow eyebrow-pine">{eyebrow}</span>
        <h1 className="display-m mt-3">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-[64ch] text-[0.9375rem] leading-relaxed text-ink-70">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
