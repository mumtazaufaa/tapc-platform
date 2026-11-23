"use client";

import { useActionState } from "react";
import { setTagActive, type FormState } from "../actions";

export function ToggleActive({ id, active }: { id: string; active: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(setTagActive, {});

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (active && !confirm("Nonaktifkan tag ini? Tap pada tag tidak akan mengalihkan ke tujuan.")) {
          e.preventDefault();
        }
      }}
      className="flex items-center gap-3"
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={active ? "false" : "true"} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-petal-300 bg-white px-3 py-1.5 text-xs font-medium text-navy-800 transition hover:bg-petal-100 disabled:opacity-60"
      >
        {pending ? "Memproses…" : active ? "Nonaktifkan" : "Aktifkan"}
      </button>
      {state.error && (
        <span role="alert" className="text-xs text-red-800">
          {state.error}
        </span>
      )}
    </form>
  );
}
