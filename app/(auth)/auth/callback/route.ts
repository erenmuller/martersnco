import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  hasSupabaseConfiguration,
  safeNextPath,
} from "../../auth-shared";

const emailOtpTypes = new Set<EmailOtpType>([
  "invite",
  "recovery",
]);

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && emailOtpTypes.has(value as EmailOtpType);
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const fallback =
    type === "recovery" || type === "invite"
      ? "/reset-password"
      : "/portal";
  const destination = safeNextPath(url.searchParams.get("next"), fallback);

  if (!hasSupabaseConfiguration()) {
    return NextResponse.redirect(new URL("/login?error=unconfigured", url));
  }

  const supabase = await createClient();
  let error: { message: string } | null = null;

  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && isEmailOtpType(type)) {
    ({ error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    }));
  } else {
    error = { message: "Missing authentication code" };
  }

  if (error) {
    const reason = type === "recovery" ? "expired" : "auth";
    return NextResponse.redirect(new URL(`/login?error=${reason}`, url));
  }

  return NextResponse.redirect(new URL(destination, url));
}
