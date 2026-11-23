import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/site";
import { formatDateTime } from "@/lib/format";
import { CopyButton } from "@/components/copy-button";
import { StatusBadge } from "@/components/status-badge";
import { EditDestinationForm } from "./edit-destination-form";
import { ToggleActive } from "./toggle-active";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Tag = {
  id: string;
  slug: string;
  label: string | null;
  destination_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  customers: {
    id: string;
    full_name: string;
    company: string | null;
    phone: string | null;
    email: string | null;
    notes: string | null;
  } | null;
};

type HistoryRow = {
  id: number;
  change_type: string;
  old_url: string | null;
  new_url: string;
  changed_by_email: string | null;
  changed_at: string;
};

const CHANGE_LABEL: Record<string, string> = { created: "Dibuat", updated: "Diubah" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-sage-500">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

export default async function NfcDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ baru?: string }>;
}) {
  await requireOwner();
  const { id } = await params;
  const { baru } = await searchParams;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const [tagRes, historyRes] = await Promise.all([
    supabase
      .from("nfc_tags")
      .select(
        "id, slug, label, destination_url, is_active, created_at, updated_at, customers(id, full_name, company, phone, email, notes)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("link_history")
      .select("id, change_type, old_url, new_url, changed_by_email, changed_at")
      .eq("tag_id", id)
      .order("changed_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(50),
  ]);

  if (tagRes.error) {
    return (
      <div className="mx-auto max-w-4xl">
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Gagal membaca data: {tagRes.error.message}
        </p>
      </div>
    );
  }
  if (!tagRes.data) notFound();

  const tag = tagRes.data as unknown as Tag;
  const history = (historyRes.data ?? []) as unknown as HistoryRow[];
  const base = await getBaseUrl();
  const permanent = `${base.url}/t/${tag.slug}`;
  const destinationIsHttp = /^https?:\/\//i.test(tag.destination_url);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/dashboard/nfc"
        className="inline-flex items-center gap-1.5 text-sm text-sage-500 transition hover:text-forest-900"
      >
        <ArrowLeft size={16} /> Kembali ke daftar
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{tag.label ?? "Tanpa label"}</h1>
        <StatusBadge active={tag.is_active} />
        <div className="ml-auto">
          <ToggleActive id={tag.id} active={tag.is_active} />
        </div>
      </div>
      <p className="mt-1 font-mono text-xs text-sage-500">{tag.slug}</p>

      {baru === "1" && (
        <p role="status" className="mt-6 rounded-lg bg-forest-800/10 px-4 py-3 text-sm text-forest-800">
          Tag berhasil didaftarkan. Salin URL permanen di bawah, lalu program ke tag NFC.
        </p>
      )}

      {base.isLocal && (
        <p className="mt-6 rounded-lg bg-sage-100 px-4 py-3 text-sm text-forest-800">
          URL permanen di bawah memakai alamat lokal. Jangan diprogram ke tag NFC sebelum aplikasi
          dideploy.
        </p>
      )}
      {!tag.is_active && (
        <p className="mt-6 rounded-lg bg-sage-100 px-4 py-3 text-sm text-forest-800">
          Tag ini nonaktif, jadi tap pada tag tidak akan mengalihkan ke tujuan.
        </p>
      )}

      <section className="mt-6 rounded-2xl border border-sage-300/70 bg-white p-6">
        <h2 className="text-sm font-semibold">Link</h2>
        <dl className="mt-4 space-y-5">
          <Field label="URL permanen (diprogram ke tag NFC)">
            <div className="flex flex-wrap items-center gap-3">
              <span className="break-all font-mono text-xs">{permanent}</span>
              <CopyButton text={permanent} label="Salin URL" />
            </div>
          </Field>
          <Field label="Tujuan saat ini">
            {destinationIsHttp ? (
              <a
                href={tag.destination_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-1.5 break-all text-forest-800 underline-offset-2 hover:underline"
              >
                {tag.destination_url} <ExternalLink size={14} className="mt-0.5 shrink-0" />
              </a>
            ) : (
              <span className="break-all">{tag.destination_url}</span>
            )}
          </Field>
        </dl>
        <div className="mt-6 border-t border-sage-300/60 pt-5">
          <EditDestinationForm id={tag.id} current={tag.destination_url} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-sage-300/70 bg-white p-6">
          <h2 className="text-sm font-semibold">Customer</h2>
          {tag.customers ? (
            <dl className="mt-4 space-y-4">
              <Field label="Nama">{tag.customers.full_name}</Field>
              {tag.customers.company && <Field label="Perusahaan">{tag.customers.company}</Field>}
              {tag.customers.phone && <Field label="Telepon / WhatsApp">{tag.customers.phone}</Field>}
              {tag.customers.email && <Field label="Email">{tag.customers.email}</Field>}
              {tag.customers.notes && (
                <Field label="Catatan">
                  <span className="whitespace-pre-wrap">{tag.customers.notes}</span>
                </Field>
              )}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-sage-500">Data customer tidak tersedia.</p>
          )}
        </section>

        <section className="rounded-2xl border border-sage-300/70 bg-white p-6">
          <h2 className="text-sm font-semibold">Info tag</h2>
          <dl className="mt-4 space-y-4">
            <Field label="Dibuat">{formatDateTime(tag.created_at)}</Field>
            <Field label="Terakhir diperbarui">{formatDateTime(tag.updated_at)}</Field>
          </dl>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-sage-300/70 bg-white">
        <h2 className="px-6 pt-6 text-sm font-semibold">Riwayat perubahan link</h2>
        {historyRes.error && (
          <p role="alert" className="mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            Gagal membaca riwayat: {historyRes.error.message}
          </p>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-y border-sage-300/70 text-xs uppercase tracking-wide text-sage-500">
              <tr>
                <th className="px-6 py-3 font-medium">Waktu</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Sebelumnya</th>
                <th className="px-4 py-3 font-medium">Menjadi</th>
                <th className="px-6 py-3 font-medium">Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-300/50">
              {history.length === 0 && !historyRes.error && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sage-500">
                    Belum ada riwayat.
                  </td>
                </tr>
              )}
              {history.map((h) => (
                <tr key={h.id} className="align-top">
                  <td className="whitespace-nowrap px-6 py-3 text-sage-500">{formatDateTime(h.changed_at)}</td>
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
                  <td className="px-6 py-3 text-sage-500">{h.changed_by_email ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
