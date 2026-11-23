# TAP&C — Tap and Connect

Aplikasi admin internal + redirect NFC. Stack: Next.js (App Router), TypeScript, Tailwind CSS, Supabase.

Tag NFC menyimpan satu URL permanen `https://<domain>/t/<slug>`. Tujuannya disimpan di database,
jadi bisa diganti dari dashboard tanpa memprogram ulang tag.

## Fitur

- Login Owner dan dashboard yang dilindungi (Overview, NFC Management, Customers, Link History, Settings)
- Registrasi tag dengan slug acak dari database, ubah tujuan, aktif/nonaktif
- Riwayat perubahan link otomatis (trigger database, hanya bisa dibaca)
- Redirect publik `/t/<slug>` tanpa membuka data customer

## Menjalankan di lokal

```bash
npm install
cp .env.example .env.local   # isi dua variabel di bawah
npm run dev
```

## Environment variables (isi di Vercel dan `.env.local`, jangan di GitHub)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (opsional): domain produksi untuk URL permanen tag

Jangan pernah menambahkan service-role / secret key.

## Deploy

Vercel, region fungsi Singapura (`vercel.json`) agar dekat dengan Supabase.
