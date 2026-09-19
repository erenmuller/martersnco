import Link from "next/link";

/**
 * The wordmark, per the design blueprint.
 *
 * Cormorant Garamond 500, tracking +0.03em, initial capitals with the full
 * stop after "Co." The ampersand is brass and is the only coloured glyph —
 * #8A6A2F on paper, #C9A86A on navy, never the reverse.
 *
 * It is typeset, not drawn, so it can be rebuilt anywhere the font is
 * available. Never boxed, ruled, shadowed or badged; clear space equals the
 * cap height of the M on all four sides.
 */
export default function Wordmark({
  href = "/",
  className = "",
  onNavy = false,
  descriptor = false,
}: {
  href?: string | null;
  className?: string;
  /** Flips the ampersand and word to the on-navy pair. */
  onNavy?: boolean;
  /** The "Applied intelligence" lockup. Omit where it would crowd. */
  descriptor?: boolean;
}) {
  const word = (
    <span
      className={`font-mark inline-flex items-baseline whitespace-nowrap text-[1.3rem] leading-none tracking-[0.03em] ${className}`}
      style={{ fontWeight: 500 }}
    >
      Marters
      <span
        className="mx-[0.18em]"
        style={{
          color: onNavy ? "var(--color-brass-light)" : "var(--color-brass)",
        }}
      >
        &amp;
      </span>
      Co.
    </span>
  );

  // Baseline-aligned, roughly half the wordmark size, mono caps at +0.16em.
  const content = descriptor ? (
    <span className="inline-flex items-baseline gap-[0.9em]">
      {word}
      <span
        className="mono text-[0.65rem] uppercase leading-none tracking-[0.16em]"
        style={{
          color: onNavy
            ? "var(--color-on-navy-mute)"
            : "var(--color-ink-45)",
        }}
      >
        Applied intelligence
      </span>
    </span>
  ) : (
    word
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className={
        onNavy
          ? "text-on-navy-strong transition-colors hover:text-white"
          : "text-ink transition-colors hover:text-pine"
      }
      aria-label="Marters & Co. — home"
    >
      {content}
    </Link>
  );
}
