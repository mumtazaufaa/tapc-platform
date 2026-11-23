"use client";

import { useActionState } from "react";
import { updateCustomer, type FormState } from "../actions";

type Customer = {
  id: string;
  full_name: string;
  phone: string | null;
  company: string | null;
  email: string | null;
  notes: string | null;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-sage-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-forest-700 focus:ring-2 focus:ring-forest-700/15";
const labelClass = "text-xs uppercase tracking-wide text-sage-500";

export function EditCustomerForm({ customer }: { customer: Customer }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateCustomer, {});

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={customer.id} />

      <div>
        <label htmlFor="full_name" className={labelClass}>
          Nama
        </label>
        <input
          id="full_name"
          name="full_name"
          defaultValue={customer.full_name}
          required
          maxLength={200}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelClass}>
            Nomor WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={customer.phone ?? ""}
            maxLength={50}
            inputMode="tel"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="company" className={labelClass}>
            Perusahaan
          </label>
          <input
            id="company"
            name="company"
            defaultValue={customer.company ?? ""}
            maxLength={200}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={customer.email ?? ""}
          maxLength={320}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Catatan
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={customer.notes ?? ""}
          maxLength={5000}
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-forest-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-forest-800 disabled:opacity-60"
        >
          {pending ? "Menyimpan…" : "Simpan perubahan"}
        </button>
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="rounded-lg bg-sage-100 px-3.5 py-2.5 text-sm text-forest-800">
          {state.ok}
        </p>
      )}
    </form>
  );
}
