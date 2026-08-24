import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isClientStoragePath } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data: document, error } = await supabase
    .from("documents")
    .select("client_id, storage_path")
    .eq("id", id)
    .single();

  if (error || !document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
  if (!isClientStoragePath(document.storage_path, document.client_id)) {
    return NextResponse.json(
      { error: "Document storage path failed its tenant check." },
      { status: 409 },
    );
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from("client-documents")
    .createSignedUrl(document.storage_path, 60);
  if (signedUrlError || !data?.signedUrl) {
    return NextResponse.json({ error: "A secure download link could not be created." }, { status: 502 });
  }

  const response = NextResponse.redirect(data.signedUrl);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
