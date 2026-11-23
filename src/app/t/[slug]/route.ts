import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const SLUG_FORMAT = /^[a-km-np-z2-9]{12}$/i;
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function page(status: number, title: string, text: string) {
  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${title}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f8f5;color:#163326;font-family:ui-sans-serif,system-ui,sans-serif}
main{text-align:center;padding:24px}h1{font-size:20px;margin:0 0 8px}p{margin:0;color:#6b8577;font-size:14px}</style></head>
<body><main><h1>${title}</h1><p>${text}</p></main></body></html>`;
  return new NextResponse(html, {
    status,
    headers: { ...NO_STORE, "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Slug yang formatnya salah ditolak tanpa menyentuh database.
  if (!SLUG_FORMAT.test(slug)) {
    return page(404, "Link tidak ditemukan", "Tag NFC ini tidak aktif atau tidak dikenal.");
  }

  // Klien anonim tanpa sesi: hanya boleh memanggil fungsi publik resolve_nfc_redirect.
  const supabase = createClient(env.supabaseUrl, env.supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let destination: string | null = null;
  try {
    const { data, error } = await supabase.rpc("resolve_nfc_redirect", { p_slug: slug });
    if (error) throw error;
    destination = typeof data === "string" ? data : null;
  } catch {
    return page(503, "Layanan sementara tidak tersedia", "Silakan coba lagi sebentar lagi.");
  }

  if (!destination) {
    return page(404, "Link tidak ditemukan", "Tag NFC ini tidak aktif atau tidak dikenal.");
  }

  // Pertahanan berlapis: pastikan hanya http/https sebelum mengalihkan.
  try {
    const url = new URL(destination);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("scheme");
    return NextResponse.redirect(url, { status: 302, headers: NO_STORE });
  } catch {
    return page(404, "Link tidak ditemukan", "Tag NFC ini tidak aktif atau tidak dikenal.");
  }
}
