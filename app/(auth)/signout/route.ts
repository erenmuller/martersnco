import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfiguration } from "../auth-shared";

export async function POST(request: NextRequest) {
  if (hasSupabaseConfiguration()) {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
  }

  return NextResponse.redirect(new URL("/login", request.url), 303);
}
