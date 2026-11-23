import { LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/site";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-sage-500">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

export default async function SettingsPage() {
  const owner = await requireOwner();
  const supabase = await createClient();
  const { data: admin } = await supabase
    .from("admins")
    .select("created_at")
    .eq("id", owner.id)
    .maybeSingle();
  const base = await getBaseUrl();
  const onVercelDomain = /\.vercel\.app$/i.test(new URL(base.url).hostname);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-sage-500">Profil Owner dan informasi aplikasi.</p>

      <section className="mt-6 rounded-2xl border border-sage-300/70 bg-white p-6">
        <h2 className="text-sm font-semibold">Profil Owner</h2>
        <dl className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field label="Nama">{owner.full_name ?? "-"}</Field>
          <Field label="Email akun">{owner.email}</Field>
          <Field label="Peran">Owner</Field>
          <Field label="Akun dibuat">{admin?.created_at ? formatDate(admin.created_at) : "-"}</Field>
        </dl>
        <p className="mt-5 text-xs text-sage-500">
          Nama, email, dan password diubah lewat Supabase Authentication dan tabel admins.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-sage-300/70 bg-white p-6">
        <h2 className="text-sm font-semibold">Informasi aplikasi</h2>
        <dl className="mt-4 space-y-5">
          <Field label="Aplikasi">TAP&amp;C (Tap and Connect), pengalihan URL untuk tag NFC</Field>
          <Field label="Alamat dasar URL permanen">
            <span className="break-all font-mono text-xs">{base.url}</span>
          </Field>
          <Field label="Format URL pada tag">
            <span className="break-all font-mono text-xs">{base.url}/t/&lt;slug&gt;</span>
          </Field>
          <Field label="Zona waktu tampilan">Asia/Jakarta</Field>
        </dl>
        {(base.isLocal || onVercelDomain) && (
          <p className="mt-5 rounded-lg bg-sage-100 px-4 py-3 text-sm text-forest-800">
            {base.isLocal
              ? "Alamat ini lokal, jadi jangan dipakai untuk memprogram tag."
              : "Alamat ini masih domain vercel.app. URL di tag fisik tidak bisa diubah tanpa memprogram ulang tag, jadi pasang domain sendiri dulu sebelum memprogram tag untuk customer."}
          </p>
        )}
      </section>

      <form action={signOut} className="mt-6">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg border border-sage-300 bg-white px-4 py-2.5 text-sm font-medium text-forest-800 transition hover:bg-sage-100"
        >
          <LogOut size={16} /> Keluar
        </button>
      </form>
    </div>
  );
}
