import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type AdminNoticeKind = "notice" | "error";

/**
 * Audit rows are intentionally written with the service role: authenticated
 * users may read them when they are admins, but no browser session can forge
 * one. Callers must have already passed requireAdmin().
 */
export async function writeAdminAudit(
  actorId: string,
  action: string,
  entity: string,
  entityId: string | null = null,
  meta: Record<string, unknown> = {},
) {
  const admin = createAdminClient();
  const { error } = await admin.from("audit_log").insert({
    actor_id: actorId,
    action,
    entity,
    entity_id: entityId,
    meta,
  });

  if (error) throw new Error(`Could not write audit entry: ${error.message}`);
}

/** Keep status redirects inside the protected admin area. */
export function adminNoticeUrl(
  path: string,
  kind: AdminNoticeKind,
  message: string,
): string {
  const safePath = isAdminPath(path) ? path : "/admin";
  const url = new URL(safePath, "https://admin.local");
  url.searchParams.delete("notice");
  url.searchParams.delete("error");
  url.searchParams.set(kind, message.slice(0, 240));
  return `${url.pathname}${url.search}${url.hash}`;
}

export function adminReturnPath(formData: FormData, fallback: string): string {
  const value = formData.get("returnTo");
  return typeof value === "string" && isAdminPath(value) ? value : fallback;
}

function isAdminPath(value: string): boolean {
  return value === "/admin" || (value.startsWith("/admin/") && !value.startsWith("/admin//"));
}

export function nullableText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function safeFileName(value: string): string {
  const normalised = value.normalize("NFKD");
  const dot = normalised.lastIndexOf(".");
  const extensionCandidate = dot >= 0 ? normalised.slice(dot + 1) : "";
  const extension = /^[a-zA-Z0-9]{1,10}$/.test(extensionCandidate)
    ? extensionCandidate.toLowerCase()
    : "";
  const stemSource = extension ? normalised.slice(0, dot) : normalised;
  const maxStemLength = 120 - (extension ? extension.length + 1 : 0);
  const stem = stemSource
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxStemLength)
    .replace(/[.-]+$/g, "") || "document";
  return extension ? `${stem}.${extension}` : stem;
}

/** A persisted client document is always one object directly under its tenant folder. */
export function isClientStoragePath(path: string, clientId: string): boolean {
  const prefix = `${clientId}/`;
  if (!path.startsWith(prefix)) return false;
  const fileName = path.slice(prefix.length);
  return Boolean(fileName) && !fileName.includes("/") && fileName !== "." && fileName !== "..";
}
