"use client";

import { useCallback, useState } from "react";
import DiscoveryAuditFlow from "./DiscoveryAuditFlow";
import Link from "next/link";
import Arrow from "./Arrow";
import styles from "./discovery-audit-banner.module.css";

export default function DiscoveryAuditBanner() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <aside className={styles.banner} aria-label="Book a discovery audit">
        <div className={`page ${styles.inner}`}>
          <div className={styles.copy}>
            <p className={styles.title}>Find where automation can save you time.</p>
            <p className={styles.detail}>A discovery audit gives you a prioritised plan.</p>
          </div>
          <Link
            href="/contact#enquiry"
            className={styles.button}
            onClick={(event) => {
              if (
                window.matchMedia("(max-width: 699px)").matches &&
                !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
              ) {
                event.preventDefault();
                setOpen(true);
              }
            }}
          >
            Book a discovery audit <Arrow diagonal />
          </Link>
        </div>
      </aside>
      <DiscoveryAuditFlow open={open} onClose={close} />
    </>
  );
}
