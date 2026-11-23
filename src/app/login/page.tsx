import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOwner } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  if (await getActiveOwner(supabase)) redirect("/dashboard");

  const { error } = await searchParams;
  const notice = error === "akses" ? "Akun ini tidak memiliki akses admin." : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-forest-900 text-lg font-semibold text-white">
            T
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-forest-950">TAP&amp;C</h1>
          <p className="mt-1 text-sm text-sage-500">Masuk ke dashboard admin</p>
        </div>
        <div className="rounded-2xl border border-sage-300/70 bg-white p-6 shadow-sm">
          <LoginForm notice={notice} />
        </div>
      </div>
    </main>
  );
}
