import Link from "next/link";
import Arrow from "./Arrow";
import styles from "./discovery-audit-banner.module.css";

export default function DiscoveryAuditBanner() {
  return (
    <aside className={styles.banner} aria-label="Book a discovery audit">
      <div className={`page ${styles.inner}`}>
        <p className={styles.copy}>Find out what to automate first.</p>
        <Link href="/contact#enquiry" className={styles.button}>
          Book a discovery audit <Arrow diagonal />
        </Link>
      </div>
    </aside>
  );
}
