import Link from "next/link";
import Arrow from "@/components/Arrow";
import { discoveryAudit } from "@/lib/marketing-services";
import styles from "./discovery-path.module.css";

export default function DiscoveryPath({ detailed = false }: { detailed?: boolean }) {
  const Heading = detailed ? "h2" : "h3";

  return (
    <>
      <article className={styles.audit} id={detailed ? discoveryAudit.id : undefined}>
        <div className={styles.intro}>
          <span className={styles.label}><span className={styles.dot} /> Recommended starting point</span>
          <Heading>{discoveryAudit.title}</Heading>
          <p>{detailed ? discoveryAudit.description : "Understand where the biggest opportunities are before deciding what to build. Your audit gives you a prioritised plan for what comes next."}</p>
          <Link href={detailed ? "/contact" : "/services#identify"} className={styles.link}>
            {detailed ? "Discuss an audit" : "Explore the audit"} <Arrow diagonal />
          </Link>
        </div>
        <div className={styles.outcome}>
          <span className={styles.label}>A clear plan, built around your business</span>
          <ul>
            <li>Identify the work worth improving</li>
            <li>Weigh the costs and potential savings</li>
            <li>Recommend the right services, in priority order</li>
          </ul>
          <p>{discoveryAudit.terms}</p>
        </div>
      </article>
      <div className={styles.next}>
        <span className={styles.connector} aria-hidden="true">↓</span>
        <div>
          <p className={styles.nextTitle}>What your audit could lead to</p>
          <p>Depending on what we find, we may recommend one or more of these services.</p>
        </div>
      </div>
    </>
  );
}
