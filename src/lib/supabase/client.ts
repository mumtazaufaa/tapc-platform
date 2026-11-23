import { createBrowserClient } from "@supabase/ssr";

// Klien browser (disiapkan untuk tahap berikutnya; data utama tetap diambil via server).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
