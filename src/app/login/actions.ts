"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOwner } from "@/lib/auth";

export type LoginState = { error?: string };

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Isi email dan password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Log lengkap di terminal `npm run dev` (bukan di browser).
    console.error("[login] signInWithPassword gagal:", error.status, error.code, error.message);

    // Bedakan penyebab agar tidak semuanya tampak "password salah".
    if (error.code === "invalid_credentials") {
      return { error: "Email atau password salah." };
    }
    if (error.code === "email_not_confirmed") {
      return { error: "Email belum dikonfirmasi di Supabase (Authentication → Users)." };
    }
    // Sisanya: API key salah/placeholder, URL salah, jaringan, rate limit, dll.
    return { error: `Gagal login (${error.code ?? error.status ?? "unknown"}): ${error.message}` };
  }

  const owner = await getActiveOwner(supabase);
  if (!owner) {
    console.error("[login] Auth berhasil tapi baris admins tidak terbaca / bukan owner aktif.");
    await supabase.auth.signOut();
    return { error: "Akun ini tidak memiliki akses admin." };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
