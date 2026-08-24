import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /*
   * Only the private areas. Marketing pages stay fully static with no auth
   * round-trip, which is the whole point of prerendering them.
   */
  matcher: ["/portal/:path*", "/admin/:path*"],
};
