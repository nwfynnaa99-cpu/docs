import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");
export const UPLOAD_NAME = /^[a-z0-9]{24}(-macro)?\.webp$/;
const MAX_BYTES = 8 * 1024 * 1024;

// Magic bytes for accepted inputs. Extensions and MIME types are client-controlled, so they're ignored.
const SIGNATURES: [string, (b: Buffer) => boolean][] = [
  ["jpeg", (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff],
  ["png", (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))],
  ["webp", (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP"],
  ["avif", (b) => b.subarray(4, 12).toString("latin1").startsWith("ftypavi")],
];

/**
 * Validates and re-encodes an upload. Re-encoding through sharp strips
 * EXIF/GPS metadata and anything appended to the file (polyglots), and
 * normalizes size. Returns the stored media entry.
 */
export async function storeImage(file: File, { macro = false } = {}) {
  if (file.size > MAX_BYTES) throw new Error("حجم الصورة أكبر من 8 ميجابايت");
  const buf = Buffer.from(await file.arrayBuffer());
  if (!SIGNATURES.some(([, ok]) => ok(buf))) throw new Error("صيغة غير مدعومة. استخدم JPG أو PNG أو WebP أو AVIF");
  const img = sharp(buf, { limitInputPixels: 50_000_000, failOn: "error" }).rotate();
  const meta = await img.metadata();
  if (!meta.width || !meta.height) throw new Error("تعذّر قراءة الصورة");
  const out = await img.resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const name = `${randomBytes(12).toString("hex")}${macro ? "-macro" : ""}.webp`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), out.data);
  return { src: `/uploads/${name}`, width: out.info.width, height: out.info.height };
}

export async function readUpload(name: string) {
  if (!UPLOAD_NAME.test(name)) return null;
  try {
    return await readFile(path.join(UPLOAD_DIR, name));
  } catch {
    return null;
  }
}
