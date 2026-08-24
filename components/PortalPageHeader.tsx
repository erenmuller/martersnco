export default function PortalPageHeader({
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
    <header className="mb-8 border-b border-rule pb-7 sm:mb-10 sm:flex sm:items-end sm:justify-between sm:gap-8">
      <div>
        <span className="eyebrow eyebrow-pine mb-3">{eyebrow}</span>
        <h1 className="display-m text-ink">{title}</h1>
        {description && (
          <p className="mt-3 max-w-[58ch] text-[0.9375rem] leading-relaxed text-ink-70">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-5 shrink-0 sm:mt-0">{action}</div>}
    </header>
  );
}
