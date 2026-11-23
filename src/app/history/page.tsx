import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const CHANGE_LABEL: Record<string, string> = { created: "Dibuat", updated: "Diubah" };

type HistoryRow = {
  id: number;
  change_type: string;
  old_url: string | null;
  new_url: string;
  changed_by_email: string | null;
  changed_at: string;
  nfc_tags: {
    id: string;
    slug: string;
    label: string | null;
    customers: { id: string; full_name: string } | null;
  } | null;
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireOwner();
  const { page: pageParam } = await searchParams;
  const parsed = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  const from = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  // Hanya membaca: riwayat ditulis otomatis oleh trigger database dan tidak bisa diubah dari aplikasi.
  const { data, error, count } = await supabase
    .from("link_history")
    .select(
      "id, change_type, old_url, new_url, changed_by_email, changed_at, nfc_tags(id, slug, label, customers(id, full_name))",
      { count: "exact" },
    )
    .order("changed_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const rows = (data ?? []) as unknown as HistoryRow[];
  const total = count ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (p: number) => (p <= 1 ? "/dashboard/history" : `/dashboard/history?page=${p}`);
  const navClass =
    "inline-flex items-center gap-1 rounded-lg border border-sage-300 bg-white px-3 py-1.5 text-sm text-forest-800 transition hover:bg-sage-100";
  const navDisabled =
    "inline-flex items-center gap-1 rounded-lg border border-sage-300/60 px-3 py-1.5 text-sm text-sage-500";

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight">Link History</h1>
      <p className="mt-1 text-sm text-sage-500">
        Semua perubahan tujuan link, dari yang terbaru. Riwayat hanya bisa dibaca.
      </p>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Gagal membaca riwayat: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-sage-300/70 bg-white">
        <table className="w-full min-w-[60rem] text-left text-sm">
          <thead className="border-b border-sage-300/70 text-xs uppercase tracking-wide text-sage-500">
            <tr>
              <th className="px-4 py-3 font-medium">Waktu</th>
              <th className="px-4 py-3 font-medium">Tag</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 font-medium">Sebelumnya</th>
              <th className="px-4 py-3 font-medium">Menjadi</th>
              <th className="px-4 py-3 font-medium">Oleh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-300/50">
            {rows.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sage-500">
                  {page > 1
                    ? "Tidak ada data di halaman ini."
                    : "Belum ada riwayat. Riwayat muncul saat tag dibuat atau tujuannya diubah."}
                </td>
              </tr>
            )}
            {rows.map((h) => (
              <tr key={h.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-sage-500">
                  {formatDateTime(h.changed_at)}
                </td>
                <td className="px-4 py-3">
                  {h.nfc_tags ? (
                    <Link
                      href={`/dashboard/nfc/${h.nfc_tags.id}`}
                      className="block text-forest-800 underline-offset-2 hover:underline"
                    >
                      {h.nfc_tags.label ?? "Tanpa label"}
                      <span className="mt-0.5 block font-mono text-xs text-sage-500">
                        {h.nfc_tags.slug}
                      </span>
                    </Link>
                  ) : (
                    <span className="text-sage-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {h.nfc_tags?.customers ? (
                    <Link
                      href={`/dashboard/customers/${h.nfc_tags.customers.id}`}
                      className="text-forest-800 underline-offset-2 hover:underline"
                    >
                      {h.nfc_tags.customers.full_name}
                    </Link>
                  ) : (
                    <span className="text-sage-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">{CHANGE_LABEL[h.change_type] ?? h.change_type}</td>
                <td className="px-4 py-3">
                  <span className="block max-w-[14rem] truncate" title={h.old_url ?? ""}>
                    {h.old_url ?? "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="block max-w-[14rem] truncate" title={h.new_url}>
                    {h.new_url}
                  </span>
                </td>
                <td className="px-4 py-3 text-sage-500">{h.changed_by_email ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-sage-500">
          {total} catatan · halaman {Math.min(page, lastPage)} dari {lastPage}
        </p>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className={navClass}>
              <ChevronLeft size={16} /> Lebih baru
            </Link>
          ) : (
            <span className={navDisabled}>
              <ChevronLeft size={16} /> Lebih baru
            </span>
          )}
          {page < lastPage ? (
            <Link href={pageHref(page + 1)} className={navClass}>
              Lebih lama <ChevronRight size={16} />
            </Link>
          ) : (
            <span className={navDisabled}>
              Lebih lama <ChevronRight size={16} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
