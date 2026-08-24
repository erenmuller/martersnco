import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireClient } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ClientDocument } from "@/lib/types";

const IdSchema = z.string().uuid();

function failed(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/portal/documents?error=download", request.url),
    303,
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsedId = IdSchema.safeParse((await params).id);
  if (!parsedId.success) return failed(request);

  const profile = await requireClient();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select(
      "id, client_id, title, kind, storage_path, size_bytes, uploaded_by, created_at",
    )
    .eq("id", parsedId.data)
    .eq("client_id", profile.client_id)
    .maybeSingle();
  const document = data as ClientDocument | null;

  // Keep the storage tenant boundary explicit even if a metadata row is ever
  // entered incorrectly. Storage RLS independently enforces the same prefix.
  if (
    error ||
    !document ||
    !document.storage_path.startsWith(`${profile.client_id}/`)
  ) {
    return failed(request);
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from("client-documents")
    .createSignedUrl(document.storage_path, 60, {
      download: document.title,
    });

  if (signedError || !signed?.signedUrl) return failed(request);
  return NextResponse.redirect(signed.signedUrl, 302);
}
