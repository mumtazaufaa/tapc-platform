"use client";

import { useActionState, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FeedbackOverlay } from "@/components/feedback-overlay";
import { setTagActive, type FormState } from "../actions";

export function ToggleActive({ id, active }: { id: string; active: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(setTagActive, {});
  const [confirming, setConfirming] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} className="flex items-center gap-3">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={active ? "false" : "true"} />
      <button
        type={active ? "button" : "submit"}
        onClick={active ? () => setConfirming(true) : undefined}
        disabled={pending}
        className="rounded-lg border border-petal-300 bg-white px-4 py-2 text-sm font-medium text-navy-800 transition hover:bg-petal-100 disabled:opacity-60"
      >
        {active ? "Nonaktifkan" : "Aktifkan"}
      </button>

      <ConfirmDialog
        open={confirming}
        title="Nonaktifkan tag ini?"
        message="Tap pada tag tidak akan mengalihkan ke tujuan sampai tag diaktifkan lagi."
        confirmLabel="Ya, nonaktifkan"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          formRef.current?.requestSubmit();
        }}
      />
      <FeedbackOverlay
        pending={pending}
        state={state}
        loadingText={active ? "Menonaktifkan tag…" : "Mengaktifkan tag…"}
      />
    </form>
  );
}
