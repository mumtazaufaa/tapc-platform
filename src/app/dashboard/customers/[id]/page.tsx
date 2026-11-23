import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { EditCustomerForm } from "./edit-customer-form";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Customer = {
  id: string;
  full_name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type TagRow = {
  id: string;
  slug: string;
  label: string | null;
  destination_url: string;
  is_active: boolean;
  created_at: string;
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const [customerRes, tagsRes] = await Promise.all([
    supabase
      .from("customers")
      .select("id, full_name, company, phone, email, notes, created_at, updated_at")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("nfc_tags")
      .select("id, slug, label, destination_url, is_active, created_at")
      .eq("customer_id", id)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (customerRes.error) {
    return (
      <div className="mx-auto max-w-4xl">
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Gagal membaca data: {customerRes.error.message}
        </p>
      </div>
    );
  }
  if (!customerRes.data) notFound();

  const customer = customerRes.data as unknown as Customer;
  const tags = (tagsRes.data ?? []) as unknown as TagRow[];

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-navy-900"
      >
        <ArrowLeft size={16} /> Kembali ke daftar
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">{customer.full_name}</h1>
      <p className="mt-1 text-sm text-muted">
        Terdaftar {formatDate(customer.created_at)} · diperbarui {formatDateTime(customer.updated_at)}
      </p>

      <section className="mt-6 rounded-2xl border border-petal-300/70 bg-white p-6">
        <h2 className="text-sm font-semibold">Data customer</h2>
        <div className="mt-4">
          <EditCustomerForm customer={customer} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-petal-300/70 bg-white">
        <h2 className="px-6 pt-6 text-sm font-semibold">Tag NFC ({tags.length})</h2>
        {tagsRes.error && (
          <p role="alert" className="mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            Gagal membaca tag: {tagsRes.error.message}
          </p>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-y border-petal-300/70 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-6 py-3 font-medium">Tag</th>
                <th className="px-4 py-3 font-medium">Tujuan saat ini</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Dibuat</th>
                <th className="px-6 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-petal-300/50">
              {tags.length === 0 && !tagsRes.error && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted">
                    Customer ini belum punya tag NFC.
                  </td>
                </tr>
              )}
              {tags.map((t) => (
                <tr key={t.id} className="align-top">
                  <td className="px-6 py-3">
                    <p className="font-medium text-navy-950">{t.label ?? "Tanpa label"}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted">{t.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block max-w-[16rem] truncate" title={t.destination_url}>
                      {t.destination_url}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={t.is_active} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {formatDate(t.created_at)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/dashboard/nfc/${t.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-navy-800 transition hover:bg-petal-100"
                    >
                      <Eye size={14} /> Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
