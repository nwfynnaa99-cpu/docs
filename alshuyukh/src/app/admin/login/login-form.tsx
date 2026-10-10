"use client";

import { AdminForm } from "@/components/admin/admin-form";
import { TextInput } from "@/components/admin/fields";
import { loginAction } from "../actions";

export function LoginForm() {
  return (
    <AdminForm action={loginAction} submitLabel="دخول">
      <TextInput label="البريد الإلكتروني" name="email" type="email" autoComplete="username" dir="ltr" required />
      <TextInput label="كلمة المرور" name="password" type="password" autoComplete="current-password" dir="ltr" required />
    </AdminForm>
  );
}
