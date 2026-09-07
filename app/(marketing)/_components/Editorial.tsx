import type { ReactNode } from "react";
import Link from "next/link";
import Arrow from "@/components/Arrow";
import s from "./editorial.module.css";

export function PageIntro({
  label,
  title,
  children,
  visual,
  links,
}: {
  label: string;
  title: ReactNode;
  children: ReactNode;
  visual: ReactNode;
  links: ReactNode;
}) {
  return (
    <section className={`page ${s.hero}`}>
      <div className={s.heroCopy}>
        <span className="studio-label">
          <span className="status-dot" />
          {label}
        </span>
        <h1>{title}</h1>
        <p>{children}</p>
        <div className="hero-actions">{links}</div>
      </div>
      {visual}
    </section>
  );
}

export function SectionTitle({
  label,
  title,
  children,
}: {
  label: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="studio-label">{label}</span>
        <h2>{title}</h2>
      </div>
      {children && <p>{children}</p>}
    </div>
  );
}

export function NextConversation({
  label = "Let’s start with you",
  title,
  children,
  showPastWork = true,
}: {
  label?: string;
  title: ReactNode;
  children: ReactNode;
  showPastWork?: boolean;
}) {
  return (
    <section className={s.closing}>
      <div className={`page ${s.closingInner}`}>
        <div>
          <span className="studio-label">{label}</span>
          <h2>{title}</h2>
          <p>{children}</p>
        </div>
        <div className={s.closingAction}>
          <Link href="/contact" className="btn btn-primary">
            Let’s talk about your business <Arrow />
          </Link>
          <span>A free first conversation. A person who listens.</span>
          {showPastWork && <Link href="/past-work" className={`text-link ${s.pastWorkLink}`}>
            See our past work <Arrow diagonal />
          </Link>}
        </div>
      </div>
    </section>
  );
}
