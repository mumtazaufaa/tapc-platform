"use client";

import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ActionResult = { error?: string; ok?: string };
type Phase = "idle" | "loading" | "result";

// Loading minimal tampil selama ini supaya tidak berkedip kalau server sangat cepat.
const MIN_LOADING_MS = 800;
// Popup "berhasil" menutup sendiri; popup "gagal" menunggu dibaca sampai ditutup manual.
const AUTO_CLOSE_MS = 2800;

/**
 * Popup di tengah layar dengan latar blur.
 * Tampil "loading" saat aksi berjalan, lalu berubah jadi kotak berhasil / gagal.
 */
export function FeedbackOverlay({
  pending,
  state,
  loadingText = "Sedang memproses…",
}: {
  pending: boolean;
  state: ActionResult;
  loadingText?: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<{ kind: "ok" | "error"; message: string } | null>(null);
  const initialState = useRef(state);
  const startedAt = useRef(0);

  // Aksi mulai berjalan -> tampilkan loading.
  useEffect(() => {
    if (pending) {
      startedAt.current = Date.now();
      setPhase("loading");
    }
  }, [pending]);

  // Aksi selesai -> tunggu loading minimal, lalu tampilkan hasil.
  useEffect(() => {
    if (pending || state === initialState.current) return;
    const message = state.error ?? state.ok;
    if (!message) {
      setPhase("idle");
      return;
    }
    const wait = Math.max(0, MIN_LOADING_MS - (Date.now() - startedAt.current));
    const t = setTimeout(() => {
      setResult({ kind: state.error ? "error" : "ok", message });
      setPhase("result");
    }, wait);
    return () => clearTimeout(t);
  }, [pending, state]);

  // Popup berhasil menutup sendiri.
  useEffect(() => {
    if (phase !== "result" || result?.kind !== "ok") return;
    const t = setTimeout(() => setPhase("idle"), AUTO_CLOSE_MS);
    return () => clearTimeout(t);
  }, [phase, result]);

  // Tombol Esc menutup popup hasil.
  useEffect(() => {
    if (phase !== "result") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPhase("idle");
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  if (phase === "idle") return null;

  const isOk = result?.kind === "ok";

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-navy-950/35 px-4 backdrop-blur-sm"
      onClick={() => phase === "result" && setPhase("idle")}
    >
      <div
        role={phase === "loading" ? "status" : isOk ? "status" : "alertdialog"}
        aria-live="polite"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="animate-pop-in w-full max-w-sm rounded-3xl bg-white px-8 py-9 text-center shadow-2xl shadow-navy-950/20"
      >
        {phase === "loading" || !result ? (
          <>
            <LoaderCircle className="mx-auto animate-spin text-petal-500" size={48} strokeWidth={2.25} />
            <p className="mt-5 text-base font-medium text-navy-800">{loadingText}</p>
            <p className="mt-1 text-sm text-muted">Mohon tunggu sebentar.</p>
          </>
        ) : (
          <>
            {isOk ? (
              <CircleCheck className="mx-auto text-emerald-600" size={56} strokeWidth={2} />
            ) : (
              <CircleX className="mx-auto text-red-600" size={56} strokeWidth={2} />
            )}
            <h2 className="mt-4 text-xl font-semibold text-navy-950">{isOk ? "Berhasil" : "Gagal"}</h2>
            <p className="mt-2 text-base text-navy-800">{result.message}</p>
            <button
              type="button"
              autoFocus
              onClick={() => setPhase("idle")}
              className="mt-6 w-full rounded-xl bg-navy-900 px-4 py-3 text-base font-medium text-white transition hover:bg-navy-800"
            >
              {isOk ? "Oke" : "Tutup"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
