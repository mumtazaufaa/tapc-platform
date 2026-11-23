"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

/** Kotak konfirmasi dengan latar blur; pengganti window.confirm() bawaan browser. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-navy-950/35 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="animate-pop-in w-full max-w-sm rounded-3xl bg-white px-8 py-9 text-center shadow-2xl shadow-navy-950/20"
      >
        <TriangleAlert className="mx-auto text-petal-500" size={52} strokeWidth={2} />
        <h2 className="mt-4 text-xl font-semibold text-navy-950">{title}</h2>
        <p className="mt-2 text-base text-navy-800">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-petal-300 bg-white px-4 py-3 text-base font-medium text-navy-800 transition hover:bg-petal-100"
          >
            Batal
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-navy-900 px-4 py-3 text-base font-medium text-white transition hover:bg-navy-800"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
