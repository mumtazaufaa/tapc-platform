"use client";

import { useActionState, useState } from "react";
import { FeedbackOverlay } from "@/components/feedback-overlay";
import { createTag, type FormState } from "../actions";

type Customer = { id: string; full_name: string; company: string | null };

const input =
  "w-full rounded-lg border border-petal-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15";
const labelCls = "text-sm font-medium text-navy-800";

export function RegisterForm({ customers }: { customers: Customer[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createTag, {});
  const [mode, setMode] = useState<"existing" | "new">(customers.length > 0 ? "existing" : "new");
  const [v, setV] = useState({
    customer_id: "",
    full_name: "",
    phone: "",
    company: "",
    email: "",
    label: "",
    destination_url: "",
    is_active: true,
  });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form action={action} className="mt-6 space-y-6">
      <input type="hidden" name="mode" value={mode} />

      <section className="space-y-4 rounded-2xl border border-petal-300/70 bg-white p-6">
        <h2 className="text-sm font-semibold">Customer</h2>
        {customers.length > 0 && (
        <div className="flex gap-1 rounded-xl border border-petal-300/70 p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={`flex-1 rounded-lg px-3 py-1.5 transition ${
                mode === "existing" ? "bg-navy-900 font-medium text-white" : "text-navy-800 hover:bg-petal-100"
              }`}
            >
              Customer yang sudah ada
            </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={`flex-1 rounded-lg px-3 py-1.5 transition ${
              mode === "new" ? "bg-navy-900 font-medium text-white" : "text-navy-800 hover:bg-petal-100"
            }`}
          >
            Customer baru
          </button>
        </div>
        )}

        {mode === "existing" ? (
          <div className="space-y-1.5">
            <label htmlFor="customer_id" className={labelCls}>Pilih customer</label>
            <select
              id="customer_id"
              name="customer_id"
              value={v.customer_id}
              onChange={set("customer_id")}
              required
              className={input}
            >
              <option value="">Pilih...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                  {c.company ? ` (${c.company})` : ""}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="full_name" className={labelCls}>Nama customer *</label>
              <input id="full_name" name="full_name" value={v.full_name} onChange={set("full_name")} required maxLength={200} className={input} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="phone" className={labelCls}>Nomor WhatsApp</label>
              <input id="phone" name="phone" value={v.phone} onChange={set("phone")} maxLength={50} inputMode="tel" placeholder="08xxxxxxxxxx" className={input} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="company" className={labelCls}>Perusahaan</label>
              <input id="company" name="company" value={v.company} onChange={set("company")} maxLength={200} className={input} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="email" className={labelCls}>Email</label>
              <input id="email" name="email" type="email" value={v.email} onChange={set("email")} className={input} />
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-petal-300/70 bg-white p-6">
        <h2 className="text-sm font-semibold">Tag NFC</h2>
        <div className="space-y-1.5">
          <label htmlFor="label" className={labelCls}>Label (opsional)</label>
          <input id="label" name="label" value={v.label} onChange={set("label")} maxLength={200} placeholder="Mis. Kartu nama Budi" className={input} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="destination_url" className={labelCls}>URL tujuan *</label>
          <input
            id="destination_url"
            name="destination_url"
            value={v.destination_url}
            onChange={set("destination_url")}
            required
            placeholder="https://instagram.com/username"
            className={input}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-navy-800">
          <input
            type="checkbox"
            name="is_active"
            checked={v.is_active}
            onChange={(e) => setV((p) => ({ ...p, is_active: e.target.checked }))}
            className="h-4 w-4 accent-navy-800"
          />
          Aktifkan tag sekarang
        </label>
      </section>

      <FeedbackOverlay pending={pending} state={state} loadingText="Menyimpan tag…" />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : "Simpan dan buat URL permanen"}
      </button>
    </form>
  );
}
