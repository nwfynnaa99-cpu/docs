import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

const scrypt = (pw: string, salt: Buffer, keylen: number, opts: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) => scryptCb(pw, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key))));

// N=2^15 ≈ 32 MB per hash: slow for attackers, fine for an admin login.
const PARAMS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEYLEN = 64;

/** Format: scrypt$N$r$p$saltB64$hashB64 (self-describing, so params can be raised later). */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize("NFKC"), salt, KEYLEN, PARAMS);
  return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, n, r, p, saltB64, hashB64] = stored.split("$");
  if (alg !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const key = await scrypt(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, { N: Number(n), r: Number(r), p: Number(p), maxmem: 128 * 1024 * 1024 });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** Minimum policy: 10+ characters, not all one character class. */
export function passwordProblem(pw: string): string | null {
  if (pw.length < 10) return "كلمة المرور يجب ألا تقل عن 10 أحرف";
  if (pw.length > 200) return "كلمة المرور طويلة جدًا";
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(pw)).length;
  if (classes < 2) return "استخدم مزيجًا من الحروف والأرقام أو الرموز";
  return null;
}
