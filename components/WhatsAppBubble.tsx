import { site } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp-contact";
import WhatsAppIcon from "./WhatsAppIcon";
import styles from "./whatsapp.module.css";

export default function WhatsAppBubble() {
  return (
    <a
      className={styles.bubble}
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat on WhatsApp at ${site.whatsappDisplay} (opens in a new tab)`}
      title={`Chat on WhatsApp · ${site.whatsappDisplay}`}
    >
      <WhatsAppIcon />
      <span>Let’s chat</span>
    </a>
  );
}
