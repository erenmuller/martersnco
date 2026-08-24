import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * `createServerClient` types `cookies` as a union of the current and the
 * deprecated shape, which stops TypeScript inferring this parameter. Naming
 * it here keeps both call sites strict.
 */
type CookiesToSet = { name: string; value: string; options: CookieOptions }[];

/**
 * Session refresh and route gating for the two private areas.
 *
 * The matcher in middleware.ts only sends /portal and /admin here, so the
 * public marketing pages never pay for an auth round-trip. Each private page
 * additionally re-checks the session server-side (see lib/auth.ts) — this is
 * the fast gate, not the only one.
 */
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without credentials nothing behind the login can work. Fail closed.
  if (!url || !anonKey) {
    const to = request.nextUrl.clone();
    to.pathname = "/login";
    to.searchParams.set("error", "unconfigured");
    return NextResponse.redirect(to);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refreshes the token. Must run before any redirect below.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (!user) {
    const to = request.nextUrl.clone();
    to.pathname = "/login";
    to.searchParams.set("next", path);
    return NextResponse.redirect(to);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) {
    const to = request.nextUrl.clone();
    to.pathname = "/login";
    to.searchParams.set("error", "inactive");
    return NextResponse.redirect(to);
  }

  // A client user who wanders into /admin goes to their own portal.
  if (path.startsWith("/admin") && profile.role !== "admin") {
    const to = request.nextUrl.clone();
    to.pathname = "/portal";
    to.search = "";
    return NextResponse.redirect(to);
  }

  return response;
}
