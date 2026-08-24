import type { BadgeTone } from "@/lib/types";

const toneClass: Record<BadgeTone, string> = {
  ok: "badge-ok",
  pending: "badge-pending",
  alert: "badge-alert",
  neutral: "badge-neutral",
};

export default function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return <span className={`badge ${toneClass[tone]}`}>{children}</span>;
}
