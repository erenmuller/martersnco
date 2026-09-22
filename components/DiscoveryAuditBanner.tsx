import Link from "next/link";
import Arrow from "./Arrow";
import styles from "./discovery-audit-banner.module.css";

export default function DiscoveryAuditBanner() {
  return (
    <aside className={styles.banner} aria-label="Book a discovery audit">
      <div className={`page ${styles.inner}`}>
        <div className={styles.copy}>
          <span className={styles.label}>Your next step, made clear</span>
          <p className={styles.title}>Find where automation can save you time.</p>
          <p className={styles.detail}>A discovery audit gives you a prioritised plan.</p>
        </div>
        <Link href="/contact#enquiry" className={styles.button}>
          Book a discovery audit <Arrow diagonal />
        </Link>
      </div>
    </aside>
  );
}
