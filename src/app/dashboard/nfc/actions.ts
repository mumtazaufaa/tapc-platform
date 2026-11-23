"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; ok?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

// Menerima "youtube.com/@x" (tanpa skema) dengan menambahkan https://, dan menolak skema selain http/https.
function parseHttpUrl(raw: string): string | null {
  if (!raw) return null;
  const value = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

const URL_ERROR = "URL tujuan tidak valid. Contoh: https://instagram.com/username";

function dbMessage(err: { code?: string; message: string }): string {
  const m = err.message;
  if (m.includes("customers_email_check")) return "Format email tidak valid.";
  if (m.includes("customers_full_name_check")) return "Nama customer wajib diisi (maksimal 200 karakter).";
  if (m.includes("customers_phone_check")) return "Nomor telepon terlalu panjang (maksimal 50 karakter).";
  if (m.includes("customers_company_check")) return "Nama perusahaan terlalu panjang (maksimal 200 karakter).";
  if (m.includes("nfc_tags_label_check")) return "Label terlalu panjang (maksimal 200 karakter).";
  if (m.includes("nfc_tags_destination_url_http")) return URL_ERROR;
  if (err.code === "42501") return "Aksi ini tidak diizinkan.";
  return `Gagal menyimpan: ${m}`;
}

// Slug dibuat oleh trigger database (nfc_tags_guard) dan riwayat dicatat oleh trigger
// log_nfc_destination_change: aplikasi sengaja tidak mengisi keduanya.
export async function createTag(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireOwner();

  const mode = text(fd, "mode");
  const label = text(fd, "label");
  const destination = parseHttpUrl(text(fd, "destination_url"));
  const isActive = fd.get("is_active") === "on";

  if (!destination) return { error: URL_ERROR };
  if (label.length > 200) return { error: "Label terlalu panjang (maksimal 200 karakter)." };

  const supabase = await createClient();

  let customerId: string;
  let createdCustomer = false;

  if (mode === "existing") {
    customerId = text(fd, "customer_id");
    if (!UUID.test(customerId)) return { error: "Pilih customer terlebih dahulu." };
  } else {
    const fullName = text(fd, "full_name");
    if (!fullName) return { error: "Nama customer wajib diisi." };
    const { data, error } = await supabase
      .from("customers")
      .insert({
        full_name: fullName,
        phone: text(fd, "phone") || null,
        company: text(fd, "company") || null,
        email: text(fd, "email") || null,
      })
      .select("id")
      .single();
    if (error || !data) return { error: dbMessage(error ?? { message: "customer tidak tersimpan" }) };
    customerId = data.id as string;
    createdCustomer = true;
  }

  const { data: tag, error: tagError } = await supabase
    .from("nfc_tags")
    .insert({
      customer_id: customerId,
      destination_url: destination,
      label: label || null,
      is_active: isActive,
    })
    .select("id")
    .single();

  if (tagError || !tag) {
    // Jangan tinggalkan customer yatim jika tag gagal dibuat.
    if (createdCustomer) await supabase.from("customers").delete().eq("id", customerId);
    return { error: dbMessage(tagError ?? { message: "tag tidak tersimpan" }) };
  }

  revalidatePath("/dashboard/nfc");
  redirect(`/dashboard/nfc/${tag.id}?baru=1`);
}

export async function updateDestination(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireOwner();

  const id = text(fd, "id");
  if (!UUID.test(id)) return { error: "Tag tidak valid." };
  const destination = parseHttpUrl(text(fd, "destination_url"));
  if (!destination) return { error: URL_ERROR };

  const supabase = await createClient();
  const { data: current, error: readError } = await supabase
    .from("nfc_tags")
    .select("destination_url")
    .eq("id", id)
    .maybeSingle();
  if (readError) return { error: dbMessage(readError) };
  if (!current) return { error: "Tag tidak ditemukan." };
  if (current.destination_url === destination) return { ok: "Tujuan tidak berubah." };

  const { data, error } = await supabase
    .from("nfc_tags")
    .update({ destination_url: destination })
    .eq("id", id)
    .select("id");
  if (error) return { error: dbMessage(error) };
  if (!data || data.length === 0) return { error: "Tag tidak ditemukan atau tidak bisa diubah." };

  revalidatePath(`/dashboard/nfc/${id}`);
  revalidatePath("/dashboard/nfc");
  return { ok: "Tujuan diperbarui. Perubahan tercatat otomatis di riwayat." };
}

export async function setTagActive(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireOwner();

  const id = text(fd, "id");
  if (!UUID.test(id)) return { error: "Tag tidak valid." };
  const active = text(fd, "active") === "true";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("nfc_tags")
    .update({ is_active: active })
    .eq("id", id)
    .select("id");
  if (error) return { error: dbMessage(error) };
  if (!data || data.length === 0) return { error: "Tag tidak ditemukan atau tidak bisa diubah." };

  revalidatePath(`/dashboard/nfc/${id}`);
  revalidatePath("/dashboard/nfc");
  return { ok: active ? "Tag diaktifkan." : "Tag dinonaktifkan." };
}
