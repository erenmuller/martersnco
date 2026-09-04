import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfiguration, safeNextPath } from "../../auth-shared";

const emailOtpTypes = new Set<EmailOtpType>(["invite", "recovery"]);

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && emailOtpTypes.has(value as EmailOtpType);
}

/**
 * The one entry point for both email links.
 *
 * Two shapes arrive here, and they carry different amounts of information:
 *
 *   token_hash + type   Sent when the Supabase email template has been changed
 *                       to the SSR form (see the README), and by the invitation
 *                       links this app mints itself. Self-describing, and it
 *                       works in any browser.
 *
 *   code                Sent by Supabase's stock template, which bounces
 *                       through /auth/v1/verify first. It arrives with NO type
 *                       parameter, and exchanging it needs the PKCE verifier
 *                       cookie set in the browser that asked for the reset.
 *
 * Because the stock template drops the type, the destination cannot be derived
 * from it. `next` is therefore set on the redirectTo when the link is created,
 * and the fallback below assumes recovery rather than a portal visit — nothing
 * but invitations and recoveries ever reaches this route, and sending someone
 * to /portal instead of a password form strands them.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  const fallback = type === "invite" ? "/welcome" : "/reset-password";
  const destination = safeNextPath(url.searchParams.get("next"), fallback);

  if (!hasSupabaseConfiguration()) {
    return NextResponse.redirect(new URL("/login?error=unconfigured", url));
  }

  // Neither shape is present, so the token is most likely in the URL fragment
  // — a project still on the implicit flow. A server route cannot read a
  // fragment, but a browser preserves it across a redirect, so hand it to a
  // page that can. See /auth/complete.
  if (!code && !tokenHash) {
    const to = new URL("/auth/complete", url);
    to.searchParams.set("next", destination);
    return NextResponse.redirect(to);
  }

  const supabase = await createClient();
  let error: { message: string } | null = null;

  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && isEmailOtpType(type)) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  } else {
    error = { message: "Unrecognised authentication parameters" };
  }

  if (error) {
    console.error("[auth:callback]", error.message);

    // A `code` can only be exchanged in the browser that asked for the reset,
    // because the PKCE verifier lives in that browser's cookie. Opening the
    // email on a phone, or in a webmail client's in-app browser, fails here
    // through no fault of the user — so say what to do rather than implying
    // the link is stale. Switching the Supabase template to the token_hash
    // form removes this failure entirely; see the README.
    const missingVerifier = /code.?verifier/i.test(error.message);
    return NextResponse.redirect(
      new URL(`/login?error=${missingVerifier ? "samebrowser" : "expired"}`, url),
    );
  }

  return NextResponse.redirect(new URL(destination, url));
}
