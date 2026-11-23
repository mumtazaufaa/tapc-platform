import Link from "next/link";
import { Plus } from "lucide-react";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function count(
  q: PromiseLike<{ count: number | null; error: { message: string } | null }>,
) {
  const { count, error } = await q;
  return { value: count ?? 0, error: error?.message };
}

export default async function OverviewPage() {
  const owner = await requireOwner();
  const supabase = await createClient();

  const [customers, tags, active] = await Promise.all([
    count(supabase.from("customers").select("id", { count: "exact", head: true })),
    count(supabase.from("nfc_tags").select("id", { count: "exact", head: true })),
    count(
      supabase.from("nfc_tags").select("id", { count: "exact", head: true }).eq("is_active", true),
    ),
  ]);
  const error = customers.error ?? tags.error ?? active.error;

  const cards = [
    { label: "Total NFC Tags", value: tags.value },
    { label: "Active NFC Tags", value: active.value },
    { label: "Inactive NFC Tags", value: tags.value - active.value },
    { label: "Total Customers", value: customers.value },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Halo, {owner.full_name ?? "Owner"}
          </h1>
          <p className="mt-1 text-sm text-sage-500">Ringkasan TAP&amp;C</p>
        </div>
        <Link
          href="/dashboard/nfc/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-forest-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-forest-800"
        >
          <Plus size={16} /> Registrasi NFC
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Gagal membaca data: {error}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-sage-300/70 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-sage-500">{c.label}</p>
            <p className="mt-3 text-3xl font-semibold text-forest-900">{c.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 rounded-xl bg-sage-100 px-4 py-3 text-sm text-forest-800">
        Tahap 1 selesai jika Anda bisa login dan angka di atas tampil (boleh semuanya 0).
        Menu lain akan aktif pada tahap berikutnya.
      </p>
    </div>
  );
}
