import Link from "next/link";
import { Eye, Search } from "lucide-react";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type CustomerRow = {
  id: string;
  full_name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  nfc_tags: { count: number }[];
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireOwner();
  const { q } = await searchParams;
  // Karakter khusus dibuang agar tidak merusak sintaks filter PostgREST.
  const term = (q ?? "").replace(/[,()%*\\"]/g, " ").trim().slice(0, 100);

  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select("id, full_name, company, phone, email, created_at, nfc_tags(count)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (term) {
    const p = `"%${term}%"`;
    query = query.or(
      `full_name.ilike.${p},company.ilike.${p},phone.ilike.${p},email.ilike.${p}`,
    );
  }

  const { data, error } = await query;
  const customers = (data ?? []) as unknown as CustomerRow[];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-sage-500">
            Pemilik tag NFC. Customer baru dibuat saat meregistrasi tag.
          </p>
        </div>
        <form action="/dashboard/customers" method="get" className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sage-500"
          />
          <input
            name="q"
            defaultValue={term}
            placeholder="Cari nama, perusahaan, atau nomor"
            aria-label="Cari customer"
            className="w-72 rounded-lg border border-sage-300 bg-white py-2 pl-9 pr-3.5 text-sm outline-none transition focus:border-forest-700 focus:ring-2 focus:ring-forest-700/15"
          />
        </form>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Gagal membaca data: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-sage-300/70 bg-white">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-sage-300/70 text-xs uppercase tracking-wide text-sage-500">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">WhatsApp</th>
              <th className="px-4 py-3 font-medium">Jumlah tag</th>
              <th className="px-4 py-3 font-medium">Terdaftar</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-300/50">
            {customers.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sage-500">
                  {term
                    ? "Tidak ada customer yang cocok dengan pencarian."
                    : "Belum ada customer. Customer pertama dibuat lewat “Registrasi NFC”."}
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-medium text-forest-950">{c.full_name}</p>
                  {c.company && <p className="mt-0.5 text-xs text-sage-500">{c.company}</p>}
                </td>
                <td className="px-4 py-3">{c.phone ?? <span className="text-sage-500">-</span>}</td>
                <td className="px-4 py-3">{c.nfc_tags?.[0]?.count ?? 0}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sage-500">
                  {formatDate(c.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/customers/${c.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-forest-800 transition hover:bg-sage-100"
                  >
                    <Eye size={14} /> Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-sage-500">{customers.length} customer ditampilkan.</p>
    </div>
  );
}
