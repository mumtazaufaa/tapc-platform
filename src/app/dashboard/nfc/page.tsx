import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { CopyButton } from "@/components/copy-button";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

type TagRow = {
  id: string;
  slug: string;
  label: string | null;
  destination_url: string;
  is_active: boolean;
  created_at: string;
  customers: { id: string; full_name: string; company: string | null } | null;
};

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "active", label: "Aktif" },
  { key: "inactive", label: "Nonaktif" },
] as const;

export default async function NfcListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireOwner();
  const { status } = await searchParams;
  const filter = status === "active" || status === "inactive" ? status : "all";

  const supabase = await createClient();
  let query = supabase
    .from("nfc_tags")
    .select("id, slug, label, destination_url, is_active, created_at, customers(id, full_name, company)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (filter === "active") query = query.eq("is_active", true);
  if (filter === "inactive") query = query.eq("is_active", false);

  const { data, error } = await query;
  const tags = (data ?? []) as unknown as TagRow[];
  const base = await getBaseUrl();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">NFC Management</h1>
          <p className="mt-1 text-sm text-sage-500">Daftar tag NFC beserta URL permanen dan tujuannya.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/nfc/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-forest-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-forest-800"
        >
          <Plus size={16} /> Registrasi NFC
        </Link>
        <div className="flex gap-1 rounded-xl border border-sage-300/70 bg-white p-1">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/dashboard/nfc" : `/dashboard/nfc?status=${f.key}`}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                filter === f.key
                  ? "bg-forest-900 font-medium text-white"
                  : "text-forest-800 hover:bg-sage-100"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        </div>
      </div>

      {base.isLocal && (
        <p className="mt-6 rounded-lg bg-sage-100 px-4 py-3 text-sm text-forest-800">
          URL di bawah memakai alamat lokal ({base.url}). Jangan diprogram ke tag NFC; gunakan URL
          setelah aplikasi dideploy ke domain Vercel.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Gagal membaca data: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-sage-300/70 bg-white">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="border-b border-sage-300/70 text-xs uppercase tracking-wide text-sage-500">
            <tr>
              <th className="px-4 py-3 font-medium">Tag</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">URL permanen</th>
              <th className="px-4 py-3 font-medium">Tujuan saat ini</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Dibuat</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-300/50">
            {tags.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sage-500">
                  {filter === "all"
                    ? "Belum ada NFC tag. Klik “Registrasi NFC” untuk membuat yang pertama."
                    : "Tidak ada tag dengan status ini."}
                </td>
              </tr>
            )}
            {tags.map((t) => {
              const permanent = `${base.url}/t/${t.slug}`;
              return (
                <tr key={t.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-forest-950">{t.label ?? "Tanpa label"}</p>
                    <p className="mt-0.5 font-mono text-xs text-sage-500">{t.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    {t.customers ? (
                      <>
                        <p>{t.customers.full_name}</p>
                        {t.customers.company && (
                          <p className="mt-0.5 text-xs text-sage-500">{t.customers.company}</p>
                        )}
                      </>
                    ) : (
                      <span className="text-sage-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="max-w-[14rem] truncate font-mono text-xs" title={permanent}>
                        {permanent}
                      </span>
                      <CopyButton text={permanent} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block max-w-[16rem] truncate" title={t.destination_url}>
                      {t.destination_url}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={t.is_active} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sage-500">{formatDate(t.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/nfc/${t.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-forest-800 transition hover:bg-sage-100"
                    >
                      <Eye size={14} /> Detail
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-sage-500">{tags.length} tag ditampilkan.</p>
    </div>
  );
}
