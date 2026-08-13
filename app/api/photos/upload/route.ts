import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Route Handler (not a Server Action) specifically so the browser can XHR
// this directly and get real upload-progress events - see
// lib/uploadPhotoWithProgress.ts for why. Otherwise this does the same
// auth/ownership/DB-bookkeeping the old uploadWeddingPhoto Server Action did.
const SINGLE_PHOTO_KINDS = new Set(["hero", "family", "footer"]);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "請重新登入。" }, { status: 401 });

  const formData = await req.formData();
  const weddingId = formData.get("weddingId");
  const kind = formData.get("kind");
  const file = formData.get("file");
  if (typeof weddingId !== "string" || typeof kind !== "string" || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "請求格式錯誤。" }, { status: 400 });
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id")
    .eq("id", weddingId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!wedding) return NextResponse.json({ error: "找不到這份喜帖。" }, { status: 404 });

  if (SINGLE_PHOTO_KINDS.has(kind)) {
    const { data: existing } = await supabase
      .from("wedding_photos")
      .select("id, storage_path")
      .eq("wedding_id", weddingId)
      .eq("kind", kind);
    for (const photo of existing ?? []) {
      await supabase.storage.from("wedding-photos").remove([photo.storage_path]);
      await supabase.from("wedding_photos").delete().eq("id", photo.id);
    }
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${weddingId}/${kind}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("wedding-photos").upload(path, file, {
    contentType: file.type,
  });
  if (uploadError) return NextResponse.json({ error: "照片上傳失敗，請稍後再試。" }, { status: 500 });

  let sortOrder = 0;
  if (!SINGLE_PHOTO_KINDS.has(kind)) {
    const { data: maxRow } = await supabase
      .from("wedding_photos")
      .select("sort_order")
      .eq("wedding_id", weddingId)
      .eq("kind", kind)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (maxRow?.sort_order ?? -1) + 1;
  }

  const { error: insertError } = await supabase.from("wedding_photos").insert({
    wedding_id: weddingId,
    kind,
    storage_path: path,
    sort_order: sortOrder,
  });
  if (insertError) return NextResponse.json({ error: "照片上傳失敗，請稍後再試。" }, { status: 500 });

  revalidatePath(`/dashboard/${weddingId}/edit`);
  return NextResponse.json({ ok: true });
}
