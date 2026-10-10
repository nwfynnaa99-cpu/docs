import { redirect } from "next/navigation";
import { getAdmin } from "@/server/auth/session";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "دخول الإدارة", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-deep px-5">
      <div className="w-full max-w-sm">
        <p className="text-center font-display text-3xl">الشيوخ</p>
        <p className="latin-label mt-1 text-center text-[0.625rem] text-gold">ADMIN</p>
        <div className="mt-10 border border-ink-line bg-ink p-8">
          <h1 className="mb-6 font-display text-lg">تسجيل الدخول</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
