import "server-only";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR, UPLOAD_NAME } from "@/server/uploads";

/** Images the admin can pick from: bundled /media files and uploads. */
export async function mediaLibrary() {
  const bundled = await readdir(path.join(process.cwd(), "public", "media")).catch(() => [] as string[]);
  const uploads = await readdir(UPLOAD_DIR).catch(() => [] as string[]);
  const withMacro = (dir: string, files: string[]) => (f: string) => ({
    src: `${dir}/${f}`,
    macro: files.includes(f.replace(".webp", "-macro.webp")) ? `${dir}/${f.replace(".webp", "-macro.webp")}` : undefined,
  });
  return [
    ...uploads.filter((f) => UPLOAD_NAME.test(f) && !f.includes("-macro")).map(withMacro("/uploads", uploads)),
    ...bundled.filter((f) => f.endsWith(".webp") && !f.includes("-macro")).map(withMacro("/media", bundled)),
  ];
}
