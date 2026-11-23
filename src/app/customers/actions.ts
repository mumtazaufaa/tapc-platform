"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; ok?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

function dbMessage(err: { code?: string; message: string }): string {
  const m = err.message;
  if (m.includes("customers_email_check")) return "Format email tidak valid.";
  if (m.includes("customers_full_name_check")) return "Nama customer wajib diisi (maksimal 200 karakter).";
  if (m.includes("customers_phone_check")) return "Nomor telepon terlalu panjang (maksimal 50 karakter).";
  if (m.includes("customers_company_check")) return "Nama perusahaan terlalu panjang (maksimal 200 karakter).";
  if (m.includes("customers_notes_check")) return "Catatan terlalu panjang (maksimal 5000 karakter).";
  if (err.code === "42501") return "Aksi ini tidak diizinkan.";
  return `Gagal menyimpan: ${m}`;
}

// Mengubah data customer. Customer tidak punya akun; data ini hanya dipakai Owner
// untuk mengenali pemilik tag dan menghubunginya lewat WhatsApp.
export async function updateCustomer(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireOwner();

  const id = text(fd, "id");
  if (!UUID.test(id)) return { error: "Customer tidak valid." };

  const fullName = text(fd, "full_name");
  const phone = text(fd, "phone");
  const company = text(fd, "company");
  const email = text(fd, "email");
  const notes = text(fd, "notes");

  if (!fullName) return { error: "Nama customer wajib diisi." };
  if (fullName.length > 200) return { error: "Nama customer terlalu panjang (maksimal 200 karakter)." };
  if (phone.length > 50) return { error: "Nomor telepon terlalu panjang (maksimal 50 karakter)." };
  if (company.length > 200) return { error: "Nama perusahaan terlalu panjang (maksimal 200 karakter)." };
  if (email.length > 320) return { error: "Email terlalu panjang (maksimal 320 karakter)." };
  if (notes.length > 5000) return { error: "Catatan terlalu panjang (maksimal 5000 karakter)." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .update({
      full_name: fullName,
      phone: phone || null,
      company: company || null,
      email: email || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id");

  if (error) return { error: dbMessage(error) };
  if (!data || data.length === 0) return { error: "Customer tidak ditemukan atau tidak bisa diubah." };

  revalidatePath(`/dashboard/customers/${id}`);
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/nfc");
  return { ok: "Data customer disimpan." };
}
