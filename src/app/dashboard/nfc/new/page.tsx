import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "./register-form";

export const dynamic = "force-dynamic";

export default async function NewNfcPage() {
  await requireOwner();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, full_name, company")
    .order("full_name", { ascending: true })
    .limit(500);

  const customers = (data ?? []) as unknown as { id: string; full_name: string; company: string | null }[];

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard/nfc"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-navy-900"
      >
        <ArrowLeft size={16} /> Kembali ke daftar
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Registrasi NFC baru</h1>
      <p className="mt-1 text-sm text-muted">
        URL permanen dibuat otomatis oleh sistem setelah tag disimpan.
      </p>
      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Gagal membaca daftar customer: {error.message}
        </p>
      )}
      <RegisterForm customers={customers} />
    </div>
  );
}
