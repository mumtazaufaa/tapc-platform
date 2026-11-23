import Link from "next/link";
import { Plus } from "lucide-react";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

type RecentTag = {
  id: string;
  slug: string;
  label: string | null;
  is_active: boolean;
  created_at: string;
  customers: { full_name: string } | null;
};

type RecentChange = {
  id: number;
  change_type: string;
  old_url: string | null;
  new_url: string;
  changed_at: string;
  nfc_tags: { id: string; slug: string; label: string | null; customers: { full_name: string } | null } | null;
};

const CHANGE_LABEL: Record<string, string> = { created: "Dibuat", updated: "Diubah" };

async function count(
  q: PromiseLike<{ count: number | null; error: { message: string } | null }>,
) {
  const { count, error } = await q;
  return { value: count ?? 0, error: error?.message };
}

export default async function OverviewPage() {
  const owner = await requireOwner();
  const supabase = await createClient();

  const [customers, tags, active, recentTagsRes, recentChangesRes] = await Promise.all([
    count(supabase.from("customers").select("id", { count: "exact", head: true })),
    count(supabase.from("nfc_tags").select("id", { count: "exact", head: true })),
    count(
      supabase.from("nfc_tags").select("id", { count: "exact", head: true }).eq("is_active", true),
    ),
    supabase
      .from("nfc_tags")
      .select("id, slug, label, is_active, created_at, customers(full_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("link_history")
      .select(
        "id, change_type, old_url, new_url, changed_at, nfc_tags(id, slug, label, customers(full_name))",
      )
      .order("changed_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(5),
  ]);
  const error =
    customers.error ??
    tags.error ??
    active.error ??
    recentTagsRes.error?.message ??
    recentChangesRes.error?.message;

  const recentTags = (recentTagsRes.data ?? []) as unknown as RecentTag[];
  const recentChanges = (recentChangesRes.data ?? []) as unknown as RecentChange[];

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
          <p className="mt-1 text-sm text-muted">Ringkasan TAP&amp;C</p>
        </div>
        <Link
          href="/dashboard/nfc/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-navy-800"
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
          <div key={c.label} className="rounded-2xl border border-petal-300/70 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-muted">{c.label}</p>
            <p className="mt-3 text-3xl font-semibold text-navy-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-petal-300/70 bg-white">
          <div className="flex items-center justify-between px-6 pt-6">
            <h2 className="text-sm font-semibold">Tag terbaru</h2>
            <Link href="/dashboard/nfc" className="text-xs font-medium text-navy-800 hover:underline">
              Lihat semua
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-petal-300/50">
            {recentTags.length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-muted">
                Belum ada tag. Klik “Registrasi NFC” untuk membuat yang pertama.
              </li>
            )}
            {recentTags.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/dashboard/nfc/${t.id}`}
                  className="flex items-center justify-between gap-3 px-6 py-3 transition hover:bg-petal-100"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.label ?? "Tanpa label"}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {t.customers?.full_name ?? "-"} · {formatDate(t.created_at)}
                    </p>
                  </div>
                  <StatusBadge active={t.is_active} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-petal-300/70 bg-white">
          <div className="flex items-center justify-between px-6 pt-6">
            <h2 className="text-sm font-semibold">Perubahan tujuan terbaru</h2>
            <Link href="/dashboard/history" className="text-xs font-medium text-navy-800 hover:underline">
              Lihat semua
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-petal-300/50">
            {recentChanges.length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-muted">Belum ada riwayat.</li>
            )}
            {recentChanges.map((h) => (
              <li key={h.id}>
                <Link
                  href={h.nfc_tags ? `/dashboard/nfc/${h.nfc_tags.id}` : "/dashboard/history"}
                  className="block px-6 py-3 transition hover:bg-petal-100"
                >
                  <p className="truncate text-sm font-medium">
                    {h.nfc_tags?.label ?? "Tanpa label"}
                    <span className="ml-2 text-xs font-normal text-muted">
                      {CHANGE_LABEL[h.change_type] ?? h.change_type}
                    </span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted" title={h.new_url}>
                    {h.new_url}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {h.nfc_tags?.customers?.full_name ?? "-"} · {formatDateTime(h.changed_at)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
