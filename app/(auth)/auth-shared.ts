/** Utilities shared by the server-side authentication entry points. */

export function hasSupabaseConfiguration(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Accept a same-origin path only. Authentication URLs are frequently copied
 * from query strings, so this guard prevents them becoming open redirects.
 */
export function safeNextPath(
  value: string | null | undefined,
  fallback: string,
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://portal.invalid");
    if (parsed.origin !== "https://portal.invalid") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function isPortalPath(path: string): boolean {
  return path === "/portal" || path.startsWith("/portal/");
}

export function isAdminPath(path: string): boolean {
  return path === "/admin" || path.startsWith("/admin/");
}
