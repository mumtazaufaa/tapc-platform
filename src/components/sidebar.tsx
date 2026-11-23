import { LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";
import type { AdminProfile } from "@/lib/auth";
import { SidebarNav } from "@/components/sidebar-nav";

export function Sidebar({ owner }: { owner: AdminProfile }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-forest-950 text-sage-100">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-100 text-sm font-semibold text-forest-900">
          T
        </div>
        <span className="text-base font-semibold tracking-tight text-white">TAP&amp;C</span>
      </div>
      <SidebarNav />
      <div className="border-t border-forest-800 px-4 py-4">
        <p className="truncate text-sm font-medium text-white">{owner.full_name ?? "Owner"}</p>
        <p className="truncate text-xs text-sage-500">{owner.email}</p>
        <form action={signOut} className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-sage-300 transition hover:bg-forest-900 hover:text-white"
          >
            <LogOut size={16} /> Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
