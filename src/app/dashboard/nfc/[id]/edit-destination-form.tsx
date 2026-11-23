"use client";

import { useActionState } from "react";
import { updateDestination, type FormState } from "../actions";

export function EditDestinationForm({ id, current }: { id: string; current: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateDestination, {});

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <label htmlFor="destination_url" className="text-xs uppercase tracking-wide text-sage-500">
        Ubah tujuan
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="destination_url"
          name="destination_url"
          key={current}
          defaultValue={current}
          required
          className="w-full rounded-lg border border-sage-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-forest-700 focus:ring-2 focus:ring-forest-700/15"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-forest-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-forest-800 disabled:opacity-60"
        >
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
      <p className="text-xs text-sage-500">URL permanen di tag NFC tidak berubah; hanya tujuannya.</p>
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
