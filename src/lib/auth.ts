import { cache } from "react";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type AdminProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "owner";
  is_active: boolean;
};

// Mengembalikan profil Owner aktif untuk pengguna yang sedang login, atau null.
// getUser() memverifikasi token ke server Auth (bukan sekadar membaca cookie).
export async function getActiveOwner(supabase: SupabaseClient): Promise<AdminProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from("admins")
    .select("id, email, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin || !admin.is_active || admin.role !== "owner") return null;
  return admin as AdminProfile;
}

// Dipakai di layout dan di setiap server action yang butuh Owner.
export const requireOwner = cache(async (): Promise<AdminProfile> => {
  const supabase = await createClient();
  const owner = await getActiveOwner(supabase);
  if (!owner) {
    await supabase.auth.signOut();
    redirect("/login?error=akses");
  }
  return owner;
});
