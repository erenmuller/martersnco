import Link from "next/link";

/**
 * The wordmark. Fraunces' italic ampersand is the one flourish in the
 * identity — a partnership mark for a firm whose name ends in "& Co."
 *
 * The same face now sets every headline on the site, which is the point: the
 * mark should look like it belongs to the page rather than like a logo
 * dropped onto one.
 */
export default function Wordmark({
  href = "/",
  className = "",
}: {
  href?: string | null;
  className?: string;
}) {
  const content = (
    <span
      className={`font-mark inline-flex items-baseline whitespace-nowrap text-[1.3rem] leading-none ${className}`}
      style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1, "opsz" 32' }}
    >
      Marters
      <em
        className="mx-[0.2em]"
        style={{
          fontStyle: "italic",
          fontSize: "1.1em",
          color: "var(--color-pine)",
        }}
      >
        &amp;
      </em>
      Co.
    </span>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="text-ink transition-colors hover:text-pine"
      aria-label="Marters & Co. — home"
    >
      {content}
    </Link>
  );
}
