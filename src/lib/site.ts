import { headers } from "next/headers";

// Alamat dasar untuk membentuk URL permanen NFC: <base>/t/<slug>.
// Set NEXT_PUBLIC_SITE_URL (opsional)
// agar URL yang disalin selalu memakai domain produksi, bukan alamat yang sedang dibuka.
export async function getBaseUrl(): Promise<{ url: string; isLocal: boolean }> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (configured && /^https?:\/\//i.test(configured)) {
    return { url: configured, isLocal: isLocalHost(new URL(configured).hostname) };
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const hostname = host.split(":")[0];
  const proto = h.get("x-forwarded-proto") ?? (isLocalHost(hostname) ? "http" : "https");
  return { url: `${proto}://${host}`, isLocal: isLocalHost(hostname) };
}

function isLocalHost(hostname: string): boolean {
  return /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
}
