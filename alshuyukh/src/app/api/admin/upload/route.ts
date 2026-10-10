import { NextResponse } from "next/server";
import { getAdmin } from "@/server/auth/session";
import { can } from "@/server/auth/roles";
import { audit } from "@/server/auth/audit";
import { sameOrigin } from "@/lib/http";
import { storeImage } from "@/server/uploads";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can(user.role, "catalog")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file", message: "اختر صورة" }, { status: 400 });
  try {
    const media = await storeImage(file, { macro: form?.get("macro") === "1" });
    audit(user, "upload", "media", media.src);
    return NextResponse.json(media);
  } catch (e) {
    return NextResponse.json({ error: "invalid_image", message: e instanceof Error ? e.message : "صورة غير صالحة" }, { status: 400 });
  }
}
