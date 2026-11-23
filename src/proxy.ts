import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Rute publik /t/<slug> sengaja dikecualikan agar redirect NFC cepat dan tanpa sesi.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|t/).*)"],
};
